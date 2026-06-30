import { PLATFORM_IDS, Platform } from "@auto-upload/domain";
import {
  RuntimeMessageType,
  type ApplyJobFromRuntimeResult,
} from "../runtime/runtime-message.js";
import { STORAGE_KEY_CHANNELS_ONLY } from "../shared/batch-platform-scope.js";
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
  hasChannelsItemSelection,
  loadChannelsItemSelectionEntries,
  readSelectedChannelsItemIndices,
  renderChannelsItemSelectionList,
} from "./channels-item-selection.js";
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
      setOutcome(successLabel, PopupOutcomeVariant.Success);
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

function readChannelsOnlyCheckbox(checkbox: HTMLInputElement): boolean {
  return checkbox.checked;
}

async function loadChannelsOnlyIntoCheckbox(
  checkbox: HTMLInputElement,
): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY_CHANNELS_ONLY);
  const value = stored[STORAGE_KEY_CHANNELS_ONLY];
  checkbox.checked = value === true;
}

async function persistChannelsOnly(channelsOnly: boolean): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY_CHANNELS_ONLY]: channelsOnly });
}

function syncChannelsOnlyUi(
  channelsOnly: boolean,
  openTabsHelp: HTMLElement,
  uploadFillHelp: HTMLElement,
  channelsOnlyHelp: HTMLElement,
  channelsItemSelectionSection: HTMLElement,
  openAllTabsButton: HTMLButtonElement,
  uploadAndFillAllTabsButton: HTMLButtonElement,
): void {
  channelsOnlyHelp.classList.toggle("d-none", !channelsOnly);
  channelsItemSelectionSection.classList.toggle("d-none", !channelsOnly);
  openTabsHelp.textContent = channelsOnly
    ? "Opens 视频号 tabs only — one per job item targeting channels."
    : "Opens bilibili, douyin, and 视频号 tabs — one per job item per platform.";
  uploadFillHelp.textContent = channelsOnly
    ? "Uploads videos on 视频号 tabs only, waits, then fills fields and cover."
    : "Uploads videos on all tabs, waits for pages to settle, then fills fields and cover.";
  openAllTabsButton.textContent = channelsOnly
    ? "Open 视频号 tabs"
    : "Open all upload tabs";
  uploadAndFillAllTabsButton.textContent = channelsOnly
    ? "Upload and fill (视频号 only)"
    : "Upload and fill (all tabs)";
}

async function refreshChannelsItemSelectionList(
  jobFilePath: string,
  channelsOnly: boolean,
  listContainer: HTMLElement,
): Promise<void> {
  if (!channelsOnly || !jobFilePath) {
    listContainer.replaceChildren();
    return;
  }

  try {
    const entries = await loadChannelsItemSelectionEntries(jobFilePath);
    if (!entries) {
      renderChannelsItemSelectionList(listContainer, []);
      return;
    }
    renderChannelsItemSelectionList(listContainer, entries);
  } catch {
    renderChannelsItemSelectionList(listContainer, []);
  }
}

function bindOpenAllTabsButton(
  button: HTMLButtonElement,
  readJobPath: () => string | null,
  readChannelsOnly: () => boolean,
): void {
  button.addEventListener("click", () => {
    const jobFilePath = readJobPath();
    if (!jobFilePath) return;

    const channelsOnly = readChannelsOnly();
    void persistChannelsOnly(channelsOnly);

    void runRuntimeBatchAction(
      button,
      jobFilePath,
      {
        type: RuntimeMessageType.OpenAllPlatformTabs,
        jobFilePath,
        channelsOnly,
      },
      channelsOnly
        ? "Opening 视频号 upload tabs…"
        : "Opening upload tabs for all platforms…",
      channelsOnly
        ? "Opened 视频号 upload tabs for this job."
        : "Opened upload tabs for this job.",
      null,
    );
  });
}

async function bootstrap(): Promise<void> {
  const jobFilePathInput = byId("jobFilePathInput");
  const fieldsSettleMsInput = byId("fieldsSettleMsInput");
  const channelsOnlyCheckbox = byId("channelsOnlyCheckbox");
  const uploadAndFillAllTabsButton = byId("uploadAndFillAllTabsButton");
  const openAllTabsButton = byId("openAllTabsButton");
  const progressLog = byId("batchProgressLog");
  const openTabsHelp = byId("openTabsHelp");
  const uploadFillHelp = byId("uploadFillHelp");
  const channelsOnlyHelp = byId("channelsOnlyHelp");
  const channelsItemSelectionSection = byId("channelsItemSelectionSection");
  const channelsItemSelectionList = byId("channelsItemSelectionList");
  const channelsSubmitBatchSizeInput = byId("channelsSubmitBatchSizeInput");
  const channelsSubmitBatchIntervalMinInput = byId("channelsSubmitBatchIntervalMinInput");

  if (!(jobFilePathInput instanceof HTMLInputElement)) return;
  if (!(fieldsSettleMsInput instanceof HTMLInputElement)) return;
  if (!(channelsOnlyCheckbox instanceof HTMLInputElement)) return;
  if (!(uploadAndFillAllTabsButton instanceof HTMLButtonElement)) return;
  if (!(openAllTabsButton instanceof HTMLButtonElement)) return;
  if (!(progressLog instanceof HTMLElement)) return;
  if (!(openTabsHelp instanceof HTMLElement)) return;
  if (!(uploadFillHelp instanceof HTMLElement)) return;
  if (!(channelsOnlyHelp instanceof HTMLElement)) return;
  if (!(channelsItemSelectionSection instanceof HTMLElement)) return;
  if (!(channelsItemSelectionList instanceof HTMLElement)) return;
  if (!(channelsSubmitBatchSizeInput instanceof HTMLInputElement)) return;
  if (!(channelsSubmitBatchIntervalMinInput instanceof HTMLInputElement)) return;

  await loadStoredPathIntoInput(jobFilePathInput);
  await loadFieldsSettleMsIntoInput(fieldsSettleMsInput);
  await loadChannelsOnlyIntoCheckbox(channelsOnlyCheckbox);
  await loadChannelsSubmitBatchSizeIntoInput(channelsSubmitBatchSizeInput);
  await loadChannelsSubmitBatchIntervalMinIntoInput(channelsSubmitBatchIntervalMinInput);

  const readChannelsOnly = (): boolean =>
    readChannelsOnlyCheckbox(channelsOnlyCheckbox);

  const refreshChannelsOnlyUi = (): void => {
    syncChannelsOnlyUi(
      readChannelsOnly(),
      openTabsHelp,
      uploadFillHelp,
      channelsOnlyHelp,
      channelsItemSelectionSection,
      openAllTabsButton,
      uploadAndFillAllTabsButton,
    );
  };

  const reloadChannelsItemSelection = (): void => {
    const jobFilePath = jobFilePathInput.value.trim();
    void refreshChannelsItemSelectionList(
      jobFilePath,
      readChannelsOnly(),
      channelsItemSelectionList,
    );
  };

  refreshChannelsOnlyUi();
  reloadChannelsItemSelection();

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
    reloadChannelsItemSelection();
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

  channelsOnlyCheckbox.addEventListener("change", () => {
    void persistChannelsOnly(readChannelsOnly());
    refreshChannelsOnlyUi();
    reloadChannelsItemSelection();
  });

  bindOpenAllTabsButton(openAllTabsButton, readJobPath, readChannelsOnly);

  uploadAndFillAllTabsButton.addEventListener("click", () => {
    const jobFilePath = readJobPath();
    if (!jobFilePath) return;

    const fieldsSettleMs = readFieldsSettleMsInput(fieldsSettleMsInput);
    const channelsOnly = readChannelsOnly();
    void persistFieldsSettleMs(fieldsSettleMs);
    void persistChannelsOnly(channelsOnly);

    let selectedChannelsItemIndices: number[] | undefined;
    if (channelsOnly) {
      if (!hasChannelsItemSelection(channelsItemSelectionList)) {
        setOutcome(
          "Load 视频号 job items first — enter a valid batch job path.",
          PopupOutcomeVariant.Secondary,
        );
        return;
      }
      selectedChannelsItemIndices = readSelectedChannelsItemIndices(channelsItemSelectionList);
      if (selectedChannelsItemIndices.length === 0) {
        setOutcome(
          "Select at least one 视频号 job item to upload.",
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
        channelsOnly,
        selectedChannelsItemIndices,
      },
      channelsOnly
        ? `Uploading 视频号 videos, waiting ${String(fieldsSettleMs)} ms, then filling fields…`
        : `Uploading videos, waiting ${String(fieldsSettleMs)} ms, then filling fields…`,
      channelsOnly
        ? "视频号 upload and fill finished. Review progress below, then publish manually."
        : "Upload and fill finished. Review progress below, then publish manually.",
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
