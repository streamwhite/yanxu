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
  resolveChannelsSubmitBatchConfig,
  STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
  STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE,
  type ChannelsSubmitBatchConfig,
} from "../shared/channels-submit-batch-config.js";
import {
  clampFieldsSettleMs,
  DEFAULT_FIELDS_SETTLE_MS,
  STORAGE_KEY_FIELDS_SETTLE_MS,
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

const STORAGE_KEY_SEMI_JOB_FILE_PATH = "semiAutoJobFilePath" as const;

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

function setSubmitAllPlatformsTitle(button: HTMLButtonElement, channelsBatch: ChannelsSubmitBatchConfig): void {
  button.title = allPlatformsSubmitBusyLabel(channelsBatch);
}

async function loadStoredPathIntoInput(input: HTMLInputElement): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY_SEMI_JOB_FILE_PATH);
  const value = stored[STORAGE_KEY_SEMI_JOB_FILE_PATH];
  if (typeof value === "string") input.value = value;
}

async function persistJobFilePath(path: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY_SEMI_JOB_FILE_PATH]: path });
}

async function loadFieldsSettleMsFromStorage(): Promise<number> {
  const stored = await chrome.storage.local.get(STORAGE_KEY_FIELDS_SETTLE_MS);
  const value = stored[STORAGE_KEY_FIELDS_SETTLE_MS];
  return typeof value === "number"
    ? clampFieldsSettleMs(value)
    : DEFAULT_FIELDS_SETTLE_MS;
}

function readStoredNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

async function loadChannelsSubmitBatchConfig(): Promise<ChannelsSubmitBatchConfig> {
  const stored = await chrome.storage.local.get([
    STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE,
    STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
  ]);
  return resolveChannelsSubmitBatchConfig({
    batchSize: readStoredNumber(stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE]),
    batchIntervalMin: readStoredNumber(
      stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN],
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

  if (progressContainer) {
    progressContainer.textContent = "";
    progressContainer.classList.remove("d-none");
  }

  try {
    await persistJobFilePath(jobFilePath);
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
  const jobFilePathInput = byId("jobFilePathInput");
  const batchPlatformScopeSelect = byId("batchPlatformScopeSelect");
  const uploadAndFillAllTabsButton = byId("uploadAndFillAllTabsButton");
  const submitHorizontalCoverCheckbox = byId("submitHorizontalCoverCheckbox");
  const progressLog = byId("batchProgressLog");
  const batchPlatformScopeHelp = byId("batchPlatformScopeHelp");
  const platformItemSelectionSection = byId("platformItemSelectionSection");
  const platformItemSelectionLabelEl = byId("platformItemSelectionLabel");
  const platformItemSelectionList = byId("platformItemSelectionList");
  if (!(jobFilePathInput instanceof HTMLInputElement)) return;
  if (!(batchPlatformScopeSelect instanceof HTMLSelectElement)) return;
  if (!(uploadAndFillAllTabsButton instanceof HTMLButtonElement)) return;
  if (!(progressLog instanceof HTMLElement)) return;
  if (!(batchPlatformScopeHelp instanceof HTMLElement)) return;
  if (!(platformItemSelectionSection instanceof HTMLElement)) return;
  if (!(platformItemSelectionLabelEl instanceof HTMLElement)) return;
  if (!(platformItemSelectionList instanceof HTMLElement)) return;

  await loadStoredPathIntoInput(jobFilePathInput);
  await loadBatchPlatformScopeIntoSelect(batchPlatformScopeSelect);

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

  const reloadPlatformItemSelection = (): void => {
    const jobFilePath = jobFilePathInput.value.trim();
    void refreshPlatformItemSelectionList(
      jobFilePath,
      readBatchPlatformScope(),
      platformItemSelectionList,
    );
  };

  refreshBatchPlatformScopeUi();
  reloadPlatformItemSelection();

  const readJobPath = (): string | null => {
    const jobFilePath = jobFilePathInput.value.trim();
    if (!jobFilePath) {
      setOutcome(
        "请输入批量任务 job.json 的绝对路径。",
        PopupOutcomeVariant.Secondary,
      );
      return null;
    }
    return jobFilePath;
  };

  jobFilePathInput.addEventListener("input", () => {
    void persistJobFilePath(jobFilePathInput.value.trim());
    reloadPlatformItemSelection();
  });

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
          `请先加载 ${formatPlatformItemSelectionLabel(batchPlatformScope).toLowerCase()} —— 输入有效的批量任务路径。`,
          PopupOutcomeVariant.Secondary,
        );
        return;
      }
      selectedPlatformItemIndices = readSelectedPlatformItemIndices(
        platformItemSelectionList,
      );
      if (selectedPlatformItemIndices.length === 0) {
        setOutcome(
          `请至少选择一个要上传的${formatPlatformItemSelectionLabel(batchPlatformScope)}。`,
          PopupOutcomeVariant.Secondary,
        );
        return;
      }
    }

    void (async () => {
      const fieldsSettleMs = await loadFieldsSettleMsFromStorage();
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
