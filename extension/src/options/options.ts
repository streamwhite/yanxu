import {
	clampChannelsSubmitBatchIntervalSeconds,
	clampChannelsSubmitBatchSize,
	DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS,
	DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE,
	STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS,
	STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE,
} from "../shared/channels-submit-batch-config.js";
import { initBrowserFileSourceUi } from "./browser-file-source-ui.js";
import {
	CHANNELS_BATCH_SETTINGS_SAVED_STATUS_ID,
	CHANNELS_BATCH_SETTINGS_SAVED_TEXT,
	CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS_INPUT_ID,
	CHANNELS_SUBMIT_BATCH_SIZE_INPUT_ID,
} from "./options-ui.js";

const SAVED_STATUS_VISIBLE_MS = 1_500 as const;

function byId(elementId: string): HTMLElement | null {
	return document.getElementById(elementId);
}

function readStoredNumber(value: unknown): number | undefined {
	return typeof value === "number" ? value : undefined;
}

async function loadSettingsIntoInputs(
	batchSizeInput: HTMLInputElement,
	intervalSecondsInput: HTMLInputElement,
): Promise<void> {
	const stored = await chrome.storage.local.get([
		STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE,
		STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS,
	]);
	const batchSize = readStoredNumber(stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE]);
	const intervalSeconds = readStoredNumber(
		stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS],
	);
	batchSizeInput.value = String(
		clampChannelsSubmitBatchSize(batchSize ?? DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE),
	);
	intervalSecondsInput.value = String(
		clampChannelsSubmitBatchIntervalSeconds(
			intervalSeconds ?? DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS,
		),
	);
}

function showSavedStatus(status: HTMLElement): void {
	status.textContent = CHANNELS_BATCH_SETTINGS_SAVED_TEXT;
	status.classList.remove("d-none");
	window.setTimeout(() => status.classList.add("d-none"), SAVED_STATUS_VISIBLE_MS);
}

async function persistSettings(
	batchSizeInput: HTMLInputElement,
	intervalSecondsInput: HTMLInputElement,
	status: HTMLElement,
): Promise<void> {
	const batchSize = clampChannelsSubmitBatchSize(Number(batchSizeInput.value));
	const intervalSeconds = clampChannelsSubmitBatchIntervalSeconds(
		Number(intervalSecondsInput.value),
	);
	await chrome.storage.local.set({
		[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE]: batchSize,
		[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS]: intervalSeconds,
	});
	batchSizeInput.value = String(batchSize);
	intervalSecondsInput.value = String(intervalSeconds);
	showSavedStatus(status);
}

async function bootstrap(): Promise<void> {
	await initBrowserFileSourceUi();

	const batchSizeInput = byId(CHANNELS_SUBMIT_BATCH_SIZE_INPUT_ID);
	const intervalSecondsInput = byId(CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS_INPUT_ID);
	const status = byId(CHANNELS_BATCH_SETTINGS_SAVED_STATUS_ID);

	if (!(batchSizeInput instanceof HTMLInputElement)) return;
	if (!(intervalSecondsInput instanceof HTMLInputElement)) return;
	if (!(status instanceof HTMLElement)) return;

	await loadSettingsIntoInputs(batchSizeInput, intervalSecondsInput);

	const save = (): void => {
		void persistSettings(batchSizeInput, intervalSecondsInput, status);
	};
	batchSizeInput.addEventListener("change", save);
	intervalSecondsInput.addEventListener("change", save);
}

void bootstrap();
