import {
	clampFieldsSettleMs,
	DEFAULT_FIELDS_SETTLE_MS,
	STORAGE_KEY_FIELDS_SETTLE_MS,
} from "../shared/fields-settle-config.js";
import {
	FIELDS_SETTLE_MS_INPUT_ID,
	FIELDS_SETTLE_SAVED_STATUS_ID,
	FIELDS_SETTLE_SAVED_TEXT,
} from "./fields-settle-ui.js";

const SAVED_STATUS_VISIBLE_MS = 1_500 as const;

function readStoredNumber(value: unknown): number | undefined {
	return typeof value === "number" ? value : undefined;
}

async function loadFieldsSettleMsIntoInput(
	input: HTMLInputElement,
): Promise<void> {
	const stored = await chrome.storage.local.get(STORAGE_KEY_FIELDS_SETTLE_MS);
	const ms =
		readStoredNumber(stored[STORAGE_KEY_FIELDS_SETTLE_MS]) ??
		DEFAULT_FIELDS_SETTLE_MS;
	input.value = String(clampFieldsSettleMs(ms));
}

function showSavedStatus(status: HTMLElement): void {
	status.textContent = FIELDS_SETTLE_SAVED_TEXT;
	status.classList.remove("d-none");
	window.setTimeout(() => status.classList.add("d-none"), SAVED_STATUS_VISIBLE_MS);
}

async function persistFieldsSettleMs(
	input: HTMLInputElement,
	status: HTMLElement,
): Promise<void> {
	const ms = clampFieldsSettleMs(Number(input.value));
	await chrome.storage.local.set({ [STORAGE_KEY_FIELDS_SETTLE_MS]: ms });
	input.value = String(ms);
	showSavedStatus(status);
}

export async function initFieldsSettleSettings(): Promise<void> {
	const input = document.getElementById(FIELDS_SETTLE_MS_INPUT_ID);
	const status = document.getElementById(FIELDS_SETTLE_SAVED_STATUS_ID);
	if (!(input instanceof HTMLInputElement)) return;
	if (!(status instanceof HTMLElement)) return;

	await loadFieldsSettleMsIntoInput(input);
	input.addEventListener("change", () => {
		void persistFieldsSettleMs(input, status);
	});
}
