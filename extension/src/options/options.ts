import {
	clampChannelsSubmitBatchIntervalMin,
	clampChannelsSubmitBatchSize,
	DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
	DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE,
	STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
	STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE,
} from "../shared/channels-submit-batch-config.js";
import { initBrowserFileSourceUi } from "./browser-file-source-ui.js";
import { initFieldsSettleSettings } from "./fields-settle-settings.js";
import {
	CHANNELS_BATCH_SETTINGS_SAVED_STATUS_ID,
	CHANNELS_BATCH_SETTINGS_SAVED_TEXT,
	CHANNELS_SUBMIT_BATCH_INTERVAL_MIN_INPUT_ID,
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
	intervalMinInput: HTMLInputElement,
): Promise<void> {
	const stored = await chrome.storage.local.get([
		STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE,
		STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
	]);
	const batchSize = readStoredNumber(stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE]);
	const intervalMin = readStoredNumber(
		stored[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN],
	);
	batchSizeInput.value = String(
		clampChannelsSubmitBatchSize(batchSize ?? DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE),
	);
	intervalMinInput.value = String(
		clampChannelsSubmitBatchIntervalMin(
			intervalMin ?? DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
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
	intervalMinInput: HTMLInputElement,
	status: HTMLElement,
): Promise<void> {
	const batchSize = clampChannelsSubmitBatchSize(Number(batchSizeInput.value));
	const intervalMin = clampChannelsSubmitBatchIntervalMin(
		Number(intervalMinInput.value),
	);
	await chrome.storage.local.set({
		[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE]: batchSize,
		[STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN]: intervalMin,
	});
	batchSizeInput.value = String(batchSize);
	intervalMinInput.value = String(intervalMin);
	showSavedStatus(status);
}

async function bootstrap(): Promise<void> {
	await initBrowserFileSourceUi();
	await initFieldsSettleSettings();

	const batchSizeInput = byId(CHANNELS_SUBMIT_BATCH_SIZE_INPUT_ID);
	const intervalMinInput = byId(CHANNELS_SUBMIT_BATCH_INTERVAL_MIN_INPUT_ID);
	const status = byId(CHANNELS_BATCH_SETTINGS_SAVED_STATUS_ID);

	if (!(batchSizeInput instanceof HTMLInputElement)) return;
	if (!(intervalMinInput instanceof HTMLInputElement)) return;
	if (!(status instanceof HTMLElement)) return;

	await loadSettingsIntoInputs(batchSizeInput, intervalMinInput);

	const save = (): void => {
		void persistSettings(batchSizeInput, intervalMinInput, status);
	};
	batchSizeInput.addEventListener("change", save);
	intervalMinInput.addEventListener("change", save);
}

void bootstrap();
