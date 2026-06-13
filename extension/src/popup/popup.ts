import {
	buildOutcomeAlertClass,
	inferOutcomeVariant,
	PopupOutcomeVariant,
} from "./popup-outcome.js";
import { listenBatchProgressLog, renderBatchProgressLog } from "./batch-progress-log.js";
import {
	createRuntimeRequestId,
	sendPingToServiceWorker,
	sendRuntimeMessageWithTimeout,
} from "./send-runtime-message.js";
import { RuntimeMessageType, type ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import { BATCH_PROGRESS_STORAGE_KEY, type StoredBatchProgress } from "../shared/batch-progress.js";
import {
	clampFieldsSettleMs,
	DEFAULT_FIELDS_SETTLE_MS,
	STORAGE_KEY_FIELDS_SETTLE_MS,
} from "../shared/fields-settle-config.js";
import {
	bindPlatformSubmitRow,
	collectPlatformSubmitUi,
	platformSubmitBusyLabel,
	platformSubmitSuccessLabel,
	type PlatformSubmitUi,
} from "./platform-submit-controls.js";

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

async function loadFieldsSettleMsIntoInput(input: HTMLInputElement): Promise<void> {
	const stored = await chrome.storage.local.get(STORAGE_KEY_FIELDS_SETTLE_MS);
	const value = stored[STORAGE_KEY_FIELDS_SETTLE_MS];
	const ms = typeof value === "number" ? clampFieldsSettleMs(value) : DEFAULT_FIELDS_SETTLE_MS;
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
		progressContainer === null ? () => {} : listenBatchProgressLog(progressContainer, requestId);

	if (progressContainer) {
		progressContainer.textContent = "";
		progressContainer.classList.remove("d-none");
	}

	try {
		await persistJobFilePath(jobFilePath);
		await wakeServiceWorker();

		const { result } = await sendRuntimeMessageWithTimeout<ApplyJobFromRuntimeResult>(
			message,
			requestId,
		);

		if (result.ok === true) {
			setOutcome(successLabel, PopupOutcomeVariant.Success);
			return;
		}

		setOutcome(`Failed (${result.code}): ${result.message}`, PopupOutcomeVariant.Danger);
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

async function runRuntimeSubmitAction(row: PlatformSubmitUi): Promise<void> {
	const { platform, submitButton } = row;
	setOutcome(platformSubmitBusyLabel(platform), PopupOutcomeVariant.Info);
	submitButton.disabled = true;

	const requestId = createRuntimeRequestId();

	try {
		await wakeServiceWorker();

		const { result } = await sendRuntimeMessageWithTimeout<ApplyJobFromRuntimeResult>(
			{
				type: RuntimeMessageType.SubmitPlatformTabs,
				platform,
			},
			requestId,
		);

		if (result.ok === true) {
			setOutcome(platformSubmitSuccessLabel(platform), PopupOutcomeVariant.Success);
			return;
		}

		setOutcome(`Failed (${result.code}): ${result.message}`, PopupOutcomeVariant.Danger);
	} catch (error: unknown) {
		const detail = error instanceof Error ? error.message : "unexpected_error";
		setOutcome(`Failed: ${detail}`, PopupOutcomeVariant.Danger);
	} finally {
		submitButton.disabled = !row.reviewedCheckbox.checked;
	}
}

function bindOpenAllTabsButton(button: HTMLButtonElement, readJobPath: () => string | null): void {
	button.addEventListener("click", () => {
		const jobFilePath = readJobPath();
		if (!jobFilePath) return;

		void runRuntimeBatchAction(
			button,
			jobFilePath,
			{
				type: RuntimeMessageType.OpenAllPlatformTabs,
				jobFilePath,
			},
			"Opening upload tabs for all platforms…",
			"Opened upload tabs for this job.",
			null,
		);
	});
}

async function bootstrap(): Promise<void> {
	const jobFilePathInput = byId("jobFilePathInput");
	const fieldsSettleMsInput = byId("fieldsSettleMsInput");
	const uploadAndFillAllTabsButton = byId("uploadAndFillAllTabsButton");
	const openAllTabsButton = byId("openAllTabsButton");
	const progressLog = byId("batchProgressLog");

	if (!(jobFilePathInput instanceof HTMLInputElement)) return;
	if (!(fieldsSettleMsInput instanceof HTMLInputElement)) return;
	if (!(uploadAndFillAllTabsButton instanceof HTMLButtonElement)) return;
	if (!(openAllTabsButton instanceof HTMLButtonElement)) return;
	if (!(progressLog instanceof HTMLElement)) return;

	await loadStoredPathIntoInput(jobFilePathInput);
	await loadFieldsSettleMsIntoInput(fieldsSettleMsInput);

	const readJobPath = (): string | null => {
		const jobFilePath = jobFilePathInput.value.trim();
		if (!jobFilePath) {
			setOutcome("Please enter an absolute path to batch job.json.", PopupOutcomeVariant.Secondary);
			return null;
		}
		return jobFilePath;
	};

	jobFilePathInput.addEventListener("input", () => {
		void persistJobFilePath(jobFilePathInput.value.trim());
	});

	fieldsSettleMsInput.addEventListener("change", () => {
		void persistFieldsSettleMs(readFieldsSettleMsInput(fieldsSettleMsInput));
	});

	bindOpenAllTabsButton(openAllTabsButton, readJobPath);

	uploadAndFillAllTabsButton.addEventListener("click", () => {
		const jobFilePath = readJobPath();
		if (!jobFilePath) return;

		const fieldsSettleMs = readFieldsSettleMsInput(fieldsSettleMsInput);
		void persistFieldsSettleMs(fieldsSettleMs);

		void runRuntimeBatchAction(
			uploadAndFillAllTabsButton,
			jobFilePath,
			{
				type: RuntimeMessageType.UploadAndFillAllTabs,
				jobFilePath,
				fieldsSettleMs,
			},
			`Uploading videos, waiting ${String(fieldsSettleMs)} ms, then filling fields…`,
			"Upload and fill finished. Review progress below, then publish manually.",
			progressLog,
		);
	});

	const platformSubmitUi = collectPlatformSubmitUi();
	if (platformSubmitUi) {
		for (const row of platformSubmitUi) {
			bindPlatformSubmitRow(row, () => {
				void runRuntimeSubmitAction(row);
			});
		}
	}
}

void bootstrap();
