import { PLATFORM_IDS, Platform } from "@yanxu/domain";
import {
  RuntimeMessageType,
  type ApplyJobFromRuntimeResult,
} from "../runtime/runtime-message.js";
import {
  BATCH_PLATFORM_SCOPE_ALL,
  type BatchPlatformScope,
  STORAGE_KEY_BATCH_PLATFORM_SCOPE,
  isSinglePlatformScope,
  parseBatchPlatformScope,
} from "../shared/batch-platform-scope.js";
import {
  BATCH_PROGRESS_STORAGE_KEY,
  type StoredBatchProgress,
} from "../shared/batch-progress.js";
import {
  BROWSER_FILE_SOURCE_SUMMARY_KEY,
  BROWSER_JOB_FILE_PATH,
  browserFileSourceNeedsPermission,
  loadBrowserFileSource,
  loadBrowserFileSourceSummary,
} from "../shared/browser-file-source.js";
import { formatBrowserFileSourceStatus, isPermissionRestoreRequired } from "./browser-file-source-status.js";
import {
  resolveChannelsSubmitBatchConfig,
  STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS,
  STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE,
  type ChannelsSubmitBatchConfig,
} from "../shared/channels-submit-batch-config.js";
import {
  DEFAULT_FIELDS_SETTLE_MS,
} from "../shared/fields-settle-config.js";
import {
  listenBatchProgressLog,
  renderBatchProgressLog,
} from "./batch-progress-log.js";
import {
  allPlatformsSubmitBusyLabel,
  allPlatformsSubmitSuccessLabel,
  bindSubmitAllPlatformsButton,
  collectSubmitAllPlatformsButton,
} from "./platform-submit-controls.js";
import {
  batchPlatformScopeOpeningLabel,
  batchPlatformScopeSinglePlatformHelp,
  batchPlatformScopeUploadBusyLabel,
  batchPlatformScopeUploadFillButtonLabel,
  batchPlatformScopeUploadSuccessLabel,
  isBatchPlatformScopeValue,
  platformItemSelectionLabel as formatPlatformItemSelectionLabel,
} from "./batch-platform-scope-ui.js";
import {
  hasPlatformItemSelection,
  loadPlatformItemSelectionEntries,
  readSelectedPlatformItemIndices,
  renderPlatformItemSelectionList,
} from "./platform-item-selection.js";
import {
  buildOutcomeAlertClass,
  inferOutcomeVariant,
  PopupOutcomeVariant,
} from "./popup-outcome.js";
import {
  createRuntimeRequestId,
  sendPingToServiceWorker,
  sendRuntimeMessageWithTimeout,
} from "./send-runtime-message.js";
import { startUploadFlow } from "./start-upload-flow.js";

function byId(elementId: string): HTMLElement | null {
  return document.getElementById(elementId);
}

function setOutcome(text: string, variant?: PopupOutcomeVariant): void {
  const out = byId("autoUploadOutcome");
  if (!out) return;

  const resolvedVariant = variant ?? inferOutcomeVariant(text);
  out.textContent = text;
  out.className = buildOutcomeAlertClass(resolvedVariant);
  out.classList.remove("d-none");
}

async function copyBatchProgressLog(progressLog: HTMLElement): Promise<void> {
  const text = progressLog.textContent?.trim() ?? "";
  if (!text) {
    setOutcome("暂无日志", PopupOutcomeVariant.Secondary);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setOutcome("日志已复制", PopupOutcomeVariant.Success);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "clipboard_write_failed";
    setOutcome(`复制失败：${detail}`, PopupOutcomeVariant.Danger);
  }
}

function setSubmitAllPlatformsTitle(button: HTMLButtonElement, channelsBatch: ChannelsSubmitBatchConfig): void {
  button.title = allPlatformsSubmitBusyLabel(channelsBatch);
}

function openOptionsForPermissionRestore(): void {
  void chrome.runtime.openOptionsPage();
}

function readStoredNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

async function loadChannelsSubmitBatchConfig(): Promise<ChannelsSubmitBatchConfig> {
  const stored = await chrome.storage.local.get([
    STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE,
    STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS,
  ]);
  return resolveChannelsSubmitBatchConfig({
    batchSize: readStoredNumber(stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE]),
    batchIntervalSeconds: readStoredNumber(
      stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS],
    ),
  });
}

async function wakeServiceWorker(): Promise<void> {
  await sendPingToServiceWorker();
}

async function runRuntimeBatchAction(
  button: HTMLButtonElement,
  jobFilePath: string,
  message: Record<string, unknown>,
  busyLabel: string,
  successLabel: string,
  progressContainer: HTMLElement | null,
): Promise<void> {
  setOutcome(busyLabel, PopupOutcomeVariant.Info);
  button.disabled = true;

  const requestId = createRuntimeRequestId();
  const stopListen =
    progressContainer === null
      ? () => {}
      : listenBatchProgressLog(progressContainer, requestId);

  if (progressContainer) progressContainer.textContent = "";

  try {
    await wakeServiceWorker();

    const { result } =
      await sendRuntimeMessageWithTimeout<ApplyJobFromRuntimeResult>(
        message,
        requestId,
      );

    if (result.ok === true) {
      const label = result.message ? `${successLabel} ${result.message}` : successLabel;
      setOutcome(label, PopupOutcomeVariant.Success);
      return;
    }

    setOutcome(
      `失败（${result.code}）：${result.message}`,
      PopupOutcomeVariant.Danger,
    );
    if (isPermissionRestoreRequired(result.code)) openOptionsForPermissionRestore();
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "unexpected_error";
    setOutcome(`失败：${detail}`, PopupOutcomeVariant.Danger);
  } finally {
    stopListen();
    if (progressContainer) {
      const stored = await chrome.storage.local.get(BATCH_PROGRESS_STORAGE_KEY);
      renderBatchProgressLog(
        progressContainer,
        stored[BATCH_PROGRESS_STORAGE_KEY] as StoredBatchProgress | undefined,
        requestId,
      );
    }
    button.disabled = false;
  }
}

async function runRuntimeSubmitAllPlatformsAction(
  submitButton: HTMLButtonElement,
  channelsBatch: ChannelsSubmitBatchConfig,
): Promise<void> {
  setOutcome(allPlatformsSubmitBusyLabel(channelsBatch), PopupOutcomeVariant.Info);
  submitButton.disabled = true;

  const failures: string[] = [];

  try {
    for (const platform of PLATFORM_IDS) {
      const requestId = createRuntimeRequestId();

      try {
        await wakeServiceWorker();

        const message: Record<string, unknown> = {
          type: RuntimeMessageType.SubmitPlatformTabs,
          platform,
        };
        if (platform === Platform.Channels) {
          message.channelsSubmitBatchSize = channelsBatch.batchSize;
          message.channelsSubmitBatchIntervalMs = channelsBatch.batchIntervalMs;
        }

        const { result } =
          await sendRuntimeMessageWithTimeout<ApplyJobFromRuntimeResult>(
            message,
            requestId,
          );

        if (result.ok !== true) {
          failures.push(`${platform} (${result.code}): ${result.message}`);
        }
      } catch (error: unknown) {
        const detail = error instanceof Error ? error.message : "unexpected_error";
        failures.push(`${platform}: ${detail}`);
      }
    }

    if (failures.length === 0) {
      setOutcome(
        allPlatformsSubmitSuccessLabel(channelsBatch),
        PopupOutcomeVariant.Success,
      );
      return;
    }

    setOutcome(`失败：${failures.join("; ")}`, PopupOutcomeVariant.Danger);
  } finally {
    submitButton.disabled = false;
  }
}

async function runSubmitAllPlatformsWithStoredSettings(
  submitButton: HTMLButtonElement,
): Promise<void> {
  const channelsBatch = await loadChannelsSubmitBatchConfig();
  await runRuntimeSubmitAllPlatformsAction(submitButton, channelsBatch);
}

function readBatchPlatformScopeSelect(select: HTMLSelectElement): BatchPlatformScope {
  const value = select.value;
  return isBatchPlatformScopeValue(value) ? value : BATCH_PLATFORM_SCOPE_ALL;
}

async function loadBatchPlatformScopeIntoSelect(
  select: HTMLSelectElement,
): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY_BATCH_PLATFORM_SCOPE);
  select.value = parseBatchPlatformScope(stored[STORAGE_KEY_BATCH_PLATFORM_SCOPE]);
}

async function persistBatchPlatformScope(scope: BatchPlatformScope): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY_BATCH_PLATFORM_SCOPE]: scope });
}

function syncBatchPlatformScopeUi(
  scope: BatchPlatformScope,
  batchPlatformScopeHelp: HTMLElement,
  platformItemSelectionSection: HTMLElement,
  platformItemSelectionLabelEl: HTMLElement,
  uploadAndFillAllTabsButton: HTMLButtonElement,
): void {
  const singlePlatform = isSinglePlatformScope(scope) ? scope : undefined;
  batchPlatformScopeHelp.classList.toggle("d-none", singlePlatform === undefined);
  platformItemSelectionSection.classList.toggle("d-none", singlePlatform === undefined);
  if (singlePlatform !== undefined) {
    batchPlatformScopeHelp.textContent = batchPlatformScopeSinglePlatformHelp(scope);
    platformItemSelectionLabelEl.textContent =
      formatPlatformItemSelectionLabel(singlePlatform);
  }
  uploadAndFillAllTabsButton.textContent = batchPlatformScopeUploadFillButtonLabel(scope);
}

async function refreshPlatformItemSelectionList(
  jobFilePath: string,
  scope: BatchPlatformScope,
  listContainer: HTMLElement,
): Promise<void> {
  if (!isSinglePlatformScope(scope) || !jobFilePath) {
    listContainer.replaceChildren();
    return;
  }

  try {
    const entries = await loadPlatformItemSelectionEntries(jobFilePath, scope);
    if (!entries) {
      renderPlatformItemSelectionList(listContainer, [], scope);
      return;
    }
    renderPlatformItemSelectionList(listContainer, entries, scope);
  } catch {
    renderPlatformItemSelectionList(listContainer, [], scope);
  }
}

async function openUploadTabsForJob(
  jobFilePath: string,
  batchPlatformScope: BatchPlatformScope,
): Promise<ApplyJobFromRuntimeResult> {
  setOutcome(batchPlatformScopeOpeningLabel(batchPlatformScope), PopupOutcomeVariant.Info);
  await wakeServiceWorker();
  const { result } = await sendRuntimeMessageWithTimeout<ApplyJobFromRuntimeResult>({
    type: RuntimeMessageType.OpenAllPlatformTabs,
    jobFilePath,
    batchPlatformScope,
  });
  return result;
}

async function bootstrap(): Promise<void> {
  const openBrowserFileSourceButton = byId("openBrowserFileSourceButton");
  const browserFileSourceStatus = byId("browserFileSourceStatus");
  const batchPlatformScopeSelect = byId("batchPlatformScopeSelect");
  const uploadAndFillAllTabsButton = byId("uploadAndFillAllTabsButton");
  const submitHorizontalCoverCheckbox = byId("submitHorizontalCoverCheckbox");
  const progressLog = byId("batchProgressLog");
  const copyProgressLogButton = byId("copyBatchProgressLogButton");
  const batchPlatformScopeHelp = byId("batchPlatformScopeHelp");
  const platformItemSelectionSection = byId("platformItemSelectionSection");
  const platformItemSelectionLabelEl = byId("platformItemSelectionLabel");
  const platformItemSelectionList = byId("platformItemSelectionList");
  if (!(openBrowserFileSourceButton instanceof HTMLButtonElement)) return;
  if (!(browserFileSourceStatus instanceof HTMLElement)) return;
  if (!(batchPlatformScopeSelect instanceof HTMLSelectElement)) return;
  if (!(uploadAndFillAllTabsButton instanceof HTMLButtonElement)) return;
  if (!(progressLog instanceof HTMLElement)) return;
  if (!(copyProgressLogButton instanceof HTMLButtonElement)) return;
  if (!(batchPlatformScopeHelp instanceof HTMLElement)) return;
  if (!(platformItemSelectionSection instanceof HTMLElement)) return;
  if (!(platformItemSelectionLabelEl instanceof HTMLElement)) return;
  if (!(platformItemSelectionList instanceof HTMLElement)) return;

  await loadBatchPlatformScopeIntoSelect(batchPlatformScopeSelect);

  const storedProgress = (await chrome.storage.local.get(BATCH_PROGRESS_STORAGE_KEY))[
    BATCH_PROGRESS_STORAGE_KEY
  ] as StoredBatchProgress | undefined;
  if (storedProgress) {
    renderBatchProgressLog(progressLog, storedProgress, storedProgress.requestId);
  }

  copyProgressLogButton.addEventListener("click", () => {
    void copyBatchProgressLog(progressLog);
  });

  const readBatchPlatformScope = (): BatchPlatformScope =>
    readBatchPlatformScopeSelect(batchPlatformScopeSelect);

  const refreshBatchPlatformScopeUi = (): void => {
    syncBatchPlatformScopeUi(
      readBatchPlatformScope(),
      batchPlatformScopeHelp,
      platformItemSelectionSection,
      platformItemSelectionLabelEl,
      uploadAndFillAllTabsButton,
    );
  };

  let browserSourceReady = false;

  const reloadPlatformItemSelection = (): void => {
    void refreshPlatformItemSelectionList(
      browserSourceReady ? BROWSER_JOB_FILE_PATH : "",
      readBatchPlatformScope(),
      platformItemSelectionList,
    );
  };

  const updateJobSourceStatus = async (redirectOnRestore = false): Promise<void> => {
    const source = await loadBrowserFileSource();
    if (!source) {
      browserSourceReady = false;
      browserFileSourceStatus.textContent = "尚未选择任务文件和素材文件夹。";
      openBrowserFileSourceButton.textContent = "选择任务与素材";
      return;
    }

    const summary = await loadBrowserFileSourceSummary();
    browserSourceReady = true;
    browserFileSourceStatus.textContent = formatBrowserFileSourceStatus(source, summary);
    openBrowserFileSourceButton.textContent = "更换文件";
    if (await browserFileSourceNeedsPermission(source)) {
      browserFileSourceStatus.textContent += "（需要恢复访问）";
      if (redirectOnRestore) openOptionsForPermissionRestore();
    }
  };

  openBrowserFileSourceButton.addEventListener("click", () => {
    void chrome.runtime.openOptionsPage();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !(BROWSER_FILE_SOURCE_SUMMARY_KEY in changes)) return;
    void updateJobSourceStatus()
      .then(reloadPlatformItemSelection)
      .catch((error: unknown) => {
        setOutcome(
          `读取任务文件状态失败：${error instanceof Error ? error.message : "unknown_error"}`,
          PopupOutcomeVariant.Danger,
        );
      });
  });

  await updateJobSourceStatus(true);
  refreshBatchPlatformScopeUi();
  reloadPlatformItemSelection();

  const readJobPath = (): string | null => {
    if (!browserSourceReady) {
      setOutcome(
        "请先在设置页选择任务文件和素材文件夹。",
        PopupOutcomeVariant.Secondary,
      );
      return null;
    }
    return BROWSER_JOB_FILE_PATH;
  };

  batchPlatformScopeSelect.addEventListener("change", () => {
    void persistBatchPlatformScope(readBatchPlatformScope());
    refreshBatchPlatformScopeUi();
    reloadPlatformItemSelection();
  });

  uploadAndFillAllTabsButton.addEventListener("click", () => {
    const jobFilePath = readJobPath();
    if (!jobFilePath) return;

    const batchPlatformScope = readBatchPlatformScope();
    void persistBatchPlatformScope(batchPlatformScope);

    let selectedPlatformItemIndices: number[] | undefined;
    if (isSinglePlatformScope(batchPlatformScope)) {
      if (!hasPlatformItemSelection(platformItemSelectionList)) {
        setOutcome(
          "请先加载待上传条目。",
          PopupOutcomeVariant.Secondary,
        );
        return;
      }
      selectedPlatformItemIndices = readSelectedPlatformItemIndices(
        platformItemSelectionList,
      );
      if (selectedPlatformItemIndices.length === 0) {
        setOutcome(
          "请至少选择一个待上传条目。",
          PopupOutcomeVariant.Secondary,
        );
        return;
      }
    }

    void (async () => {
      const fieldsSettleMs = DEFAULT_FIELDS_SETTLE_MS;
      uploadAndFillAllTabsButton.disabled = true;
      try {
        const { stage, result } = await startUploadFlow(
          () => openUploadTabsForJob(jobFilePath, batchPlatformScope),
          () =>
            runRuntimeBatchAction(
              uploadAndFillAllTabsButton,
              jobFilePath,
              {
                type: RuntimeMessageType.UploadAndFillAllTabs,
                jobFilePath,
                fieldsSettleMs,
                batchPlatformScope,
                selectedPlatformItemIndices,
                submitHorizontalCover:
                  submitHorizontalCoverCheckbox instanceof HTMLInputElement &&
                  submitHorizontalCoverCheckbox.checked === true,
              },
              batchPlatformScopeUploadBusyLabel(batchPlatformScope, fieldsSettleMs),
              batchPlatformScopeUploadSuccessLabel(batchPlatformScope),
              progressLog,
            ),
        );
        if (stage === "openTabs" && !result.ok) {
          setOutcome(`失败（${result.code}）：${result.message}`, PopupOutcomeVariant.Danger);
          if (isPermissionRestoreRequired(result.code)) openOptionsForPermissionRestore();
        }
      } catch (error: unknown) {
        const detail = error instanceof Error ? error.message : "unexpected_error";
        setOutcome(`失败：${detail}`, PopupOutcomeVariant.Danger);
      } finally {
        uploadAndFillAllTabsButton.disabled = false;
      }
    })();
  });

  const submitAllPlatformsButton = collectSubmitAllPlatformsButton();
  if (submitAllPlatformsButton) {
    void loadChannelsSubmitBatchConfig().then((channelsBatch) => {
      setSubmitAllPlatformsTitle(submitAllPlatformsButton, channelsBatch);
    });
    bindSubmitAllPlatformsButton(submitAllPlatformsButton, () => {
      void runSubmitAllPlatformsWithStoredSettings(submitAllPlatformsButton);
    });
  }
}

void bootstrap();
