import { PLATFORM_IDS, Platform } from "@auto-upload/domain";
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
  clampChannelsSubmitBatchIntervalMin,
  clampChannelsSubmitBatchSize,
  DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
  DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE,
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
  batchPlatformScopeOpenTabsButtonLabel,
  batchPlatformScopeOpenTabsHelp,
  batchPlatformScopeOpenedLabel,
  batchPlatformScopeOpeningLabel,
  batchPlatformScopeSinglePlatformHelp,
  batchPlatformScopeUploadBusyLabel,
  batchPlatformScopeUploadFillButtonLabel,
  batchPlatformScopeUploadFillHelp,
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

async function loadStoredPathIntoInput(input: HTMLInputElement): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY_SEMI_JOB_FILE_PATH);
  const value = stored[STORAGE_KEY_SEMI_JOB_FILE_PATH];
  if (typeof value === "string") input.value = value;
}

async function persistJobFilePath(path: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY_SEMI_JOB_FILE_PATH]: path });
}

async function loadFieldsSettleMsIntoInput(
  input: HTMLInputElement,
): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY_FIELDS_SETTLE_MS);
  const value = stored[STORAGE_KEY_FIELDS_SETTLE_MS];
  const ms =
    typeof value === "number"
      ? clampFieldsSettleMs(value)
      : DEFAULT_FIELDS_SETTLE_MS;
  input.value = String(ms);
}

async function persistFieldsSettleMs(ms: number): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY_FIELDS_SETTLE_MS]: clampFieldsSettleMs(ms),
  });
}

function readFieldsSettleMsInput(input: HTMLInputElement): number {
  return clampFieldsSettleMs(Number(input.value));
}

async function loadChannelsSubmitBatchSizeIntoInput(
  input: HTMLInputElement,
): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE);
  const value = stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE];
  const batchSize =
    typeof value === "number"
      ? clampChannelsSubmitBatchSize(value)
      : DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE;
  input.value = String(batchSize);
}

async function loadChannelsSubmitBatchIntervalMinIntoInput(
  input: HTMLInputElement,
): Promise<void> {
  const stored = await chrome.storage.local.get(
    STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
  );
  const value = stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN];
  const intervalMin =
    typeof value === "number"
      ? clampChannelsSubmitBatchIntervalMin(value)
      : DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN;
  input.value = String(intervalMin);
}

async function persistChannelsSubmitBatchSettings(
  batchSize: number,
  intervalMin: number,
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE]: clampChannelsSubmitBatchSize(batchSize),
    [STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN]:
      clampChannelsSubmitBatchIntervalMin(intervalMin),
  });
}

function readChannelsSubmitBatchConfig(
  batchSizeInput: HTMLInputElement,
  intervalMinInput: HTMLInputElement,
): ChannelsSubmitBatchConfig {
  return resolveChannelsSubmitBatchConfig({
    batchSize: clampChannelsSubmitBatchSize(Number(batchSizeInput.value)),
    batchIntervalMin: clampChannelsSubmitBatchIntervalMin(Number(intervalMinInput.value)),
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
      `Failed (${result.code}): ${result.message}`,
      PopupOutcomeVariant.Danger,
    );
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "unexpected_error";
    setOutcome(`Failed: ${detail}`, PopupOutcomeVariant.Danger);
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

    setOutcome(`Failed: ${failures.join("; ")}`, PopupOutcomeVariant.Danger);
  } finally {
    submitButton.disabled = false;
  }
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
  openTabsHelp: HTMLElement,
  uploadFillHelp: HTMLElement,
  batchPlatformScopeHelp: HTMLElement,
  platformItemSelectionSection: HTMLElement,
  platformItemSelectionLabelEl: HTMLElement,
  openAllTabsButton: HTMLButtonElement,
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
  openTabsHelp.textContent = batchPlatformScopeOpenTabsHelp(scope);
  uploadFillHelp.textContent = batchPlatformScopeUploadFillHelp(scope);
  openAllTabsButton.textContent = batchPlatformScopeOpenTabsButtonLabel(scope);
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

function bindOpenAllTabsButton(
  button: HTMLButtonElement,
  readJobPath: () => string | null,
  readBatchPlatformScope: () => BatchPlatformScope,
): void {
  button.addEventListener("click", () => {
    const jobFilePath = readJobPath();
    if (!jobFilePath) return;

    const batchPlatformScope = readBatchPlatformScope();
    void persistBatchPlatformScope(batchPlatformScope);

    void runRuntimeBatchAction(
      button,
      jobFilePath,
      {
        type: RuntimeMessageType.OpenAllPlatformTabs,
        jobFilePath,
        batchPlatformScope,
      },
      batchPlatformScopeOpeningLabel(batchPlatformScope),
      batchPlatformScopeOpenedLabel(batchPlatformScope),
      null,
    );
  });
}

async function bootstrap(): Promise<void> {
  const jobFilePathInput = byId("jobFilePathInput");
  const fieldsSettleMsInput = byId("fieldsSettleMsInput");
  const batchPlatformScopeSelect = byId("batchPlatformScopeSelect");
  const uploadAndFillAllTabsButton = byId("uploadAndFillAllTabsButton");
  const submitHorizontalCoverCheckbox = byId("submitHorizontalCoverCheckbox");
  const openAllTabsButton = byId("openAllTabsButton");
  const progressLog = byId("batchProgressLog");
  const openTabsHelp = byId("openTabsHelp");
  const uploadFillHelp = byId("uploadFillHelp");
  const batchPlatformScopeHelp = byId("batchPlatformScopeHelp");
  const platformItemSelectionSection = byId("platformItemSelectionSection");
  const platformItemSelectionLabelEl = byId("platformItemSelectionLabel");
  const platformItemSelectionList = byId("platformItemSelectionList");
  const channelsSubmitBatchSizeInput = byId("channelsSubmitBatchSizeInput");
  const channelsSubmitBatchIntervalMinInput = byId("channelsSubmitBatchIntervalMinInput");

  if (!(jobFilePathInput instanceof HTMLInputElement)) return;
  if (!(fieldsSettleMsInput instanceof HTMLInputElement)) return;
  if (!(batchPlatformScopeSelect instanceof HTMLSelectElement)) return;
  if (!(uploadAndFillAllTabsButton instanceof HTMLButtonElement)) return;
  if (!(openAllTabsButton instanceof HTMLButtonElement)) return;
  if (!(progressLog instanceof HTMLElement)) return;
  if (!(openTabsHelp instanceof HTMLElement)) return;
  if (!(uploadFillHelp instanceof HTMLElement)) return;
  if (!(batchPlatformScopeHelp instanceof HTMLElement)) return;
  if (!(platformItemSelectionSection instanceof HTMLElement)) return;
  if (!(platformItemSelectionLabelEl instanceof HTMLElement)) return;
  if (!(platformItemSelectionList instanceof HTMLElement)) return;
  if (!(channelsSubmitBatchSizeInput instanceof HTMLInputElement)) return;
  if (!(channelsSubmitBatchIntervalMinInput instanceof HTMLInputElement)) return;

  await loadStoredPathIntoInput(jobFilePathInput);
  await loadFieldsSettleMsIntoInput(fieldsSettleMsInput);
  await loadBatchPlatformScopeIntoSelect(batchPlatformScopeSelect);
  await loadChannelsSubmitBatchSizeIntoInput(channelsSubmitBatchSizeInput);
  await loadChannelsSubmitBatchIntervalMinIntoInput(channelsSubmitBatchIntervalMinInput);

  const readBatchPlatformScope = (): BatchPlatformScope =>
    readBatchPlatformScopeSelect(batchPlatformScopeSelect);

  const refreshBatchPlatformScopeUi = (): void => {
    syncBatchPlatformScopeUi(
      readBatchPlatformScope(),
      openTabsHelp,
      uploadFillHelp,
      batchPlatformScopeHelp,
      platformItemSelectionSection,
      platformItemSelectionLabelEl,
      openAllTabsButton,
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
        "Please enter an absolute path to batch job.json.",
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

  fieldsSettleMsInput.addEventListener("change", () => {
    void persistFieldsSettleMs(readFieldsSettleMsInput(fieldsSettleMsInput));
  });

  const persistChannelsSubmitBatchInputs = (): void => {
    void persistChannelsSubmitBatchSettings(
      Number(channelsSubmitBatchSizeInput.value),
      Number(channelsSubmitBatchIntervalMinInput.value),
    );
  };

  channelsSubmitBatchSizeInput.addEventListener("change", persistChannelsSubmitBatchInputs);
  channelsSubmitBatchIntervalMinInput.addEventListener("change", persistChannelsSubmitBatchInputs);

  const readChannelsSubmitBatch = (): ChannelsSubmitBatchConfig =>
    readChannelsSubmitBatchConfig(
      channelsSubmitBatchSizeInput,
      channelsSubmitBatchIntervalMinInput,
    );

  batchPlatformScopeSelect.addEventListener("change", () => {
    void persistBatchPlatformScope(readBatchPlatformScope());
    refreshBatchPlatformScopeUi();
    reloadPlatformItemSelection();
  });

  bindOpenAllTabsButton(openAllTabsButton, readJobPath, readBatchPlatformScope);

  uploadAndFillAllTabsButton.addEventListener("click", () => {
    const jobFilePath = readJobPath();
    if (!jobFilePath) return;

    const fieldsSettleMs = readFieldsSettleMsInput(fieldsSettleMsInput);
    const batchPlatformScope = readBatchPlatformScope();
    void persistFieldsSettleMs(fieldsSettleMs);
    void persistBatchPlatformScope(batchPlatformScope);

    let selectedPlatformItemIndices: number[] | undefined;
    if (isSinglePlatformScope(batchPlatformScope)) {
      if (!hasPlatformItemSelection(platformItemSelectionList)) {
        setOutcome(
          `Load ${formatPlatformItemSelectionLabel(batchPlatformScope).toLowerCase()} first — enter a valid batch job path.`,
          PopupOutcomeVariant.Secondary,
        );
        return;
      }
      selectedPlatformItemIndices = readSelectedPlatformItemIndices(
        platformItemSelectionList,
      );
      if (selectedPlatformItemIndices.length === 0) {
        setOutcome(
          `Select at least one ${formatPlatformItemSelectionLabel(batchPlatformScope).toLowerCase()} to upload.`,
          PopupOutcomeVariant.Secondary,
        );
        return;
      }
    }

    void runRuntimeBatchAction(
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
    );
  });

  const submitAllPlatformsButton = collectSubmitAllPlatformsButton();
  if (submitAllPlatformsButton) {
    bindSubmitAllPlatformsButton(submitAllPlatformsButton, () => {
      const channelsBatch = readChannelsSubmitBatch();
      persistChannelsSubmitBatchInputs();
      void runRuntimeSubmitAllPlatformsAction(submitAllPlatformsButton, channelsBatch);
    });
  }
}

void bootstrap();
