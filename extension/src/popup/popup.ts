import { resolveActiveBilibiliTabId } from "./resolve-active-tab-id.js";
import { sendPingToServiceWorker, sendRuntimeMessageWithTimeout } from "./send-runtime-message.js";
import { RuntimeMessageType, type ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";

const STORAGE_KEY_SEMI_JOB_FILE_PATH = "semiAutoJobFilePath" as const;

function byId(elementId: string): HTMLElement | null {
	return document.getElementById(elementId);
}

function setOutcome(text: string): void {
	const out = byId("autoUploadOutcome");
	if (!out) return;
	out.textContent = text;
}

async function loadStoredPathIntoInput(input: HTMLInputElement): Promise<void> {
	const stored = await chrome.storage.local.get(STORAGE_KEY_SEMI_JOB_FILE_PATH);
	const value = stored[STORAGE_KEY_SEMI_JOB_FILE_PATH];
	if (typeof value === "string") input.value = value;
}

async function persistJobFilePath(path: string): Promise<void> {
	await chrome.storage.local.set({ [STORAGE_KEY_SEMI_JOB_FILE_PATH]: path });
}

async function wakeServiceWorker(): Promise<void> {
	await sendPingToServiceWorker();
}

async function runJobAction(
	button: HTMLButtonElement,
	jobFilePath: string,
	messageType:
		| typeof RuntimeMessageType.UploadVideoFirst
		| typeof RuntimeMessageType.FillFieldsFromFile,
	busyLabel: string,
	successLabel: string,
): Promise<void> {
	setOutcome(busyLabel);
	button.disabled = true;

	try {
		await persistJobFilePath(jobFilePath);
		const tabId = await resolveActiveBilibiliTabId();
		await wakeServiceWorker();

		const result = await sendRuntimeMessageWithTimeout<ApplyJobFromRuntimeResult>({
			type: messageType,
			jobFilePath,
			tabId,
		});

		if (result.ok === true) {
			setOutcome(successLabel);
			return;
		}

		setOutcome(`Failed (${result.code}): ${result.message}`);
	} catch (error: unknown) {
		const detail = error instanceof Error ? error.message : "unexpected_error";
		setOutcome(`Failed: ${detail}`);
	} finally {
		button.disabled = false;
	}
}

async function bootstrap(): Promise<void> {
	const jobFilePathInput = byId("jobFilePathInput");
	const uploadVideoButton = byId("uploadVideoButton");
	const fillFieldsButton = byId("fillFieldsButton");

	if (!(jobFilePathInput instanceof HTMLInputElement)) return;
	if (!(uploadVideoButton instanceof HTMLButtonElement)) return;
	if (!(fillFieldsButton instanceof HTMLButtonElement)) return;

	await loadStoredPathIntoInput(jobFilePathInput);

	const readJobPath = (): string | null => {
		const jobFilePath = jobFilePathInput.value.trim();
		if (!jobFilePath) {
			setOutcome("Please enter an absolute path to job.json.");
			return null;
		}
		return jobFilePath;
	};

	uploadVideoButton.addEventListener("click", () => {
		const jobFilePath = readJobPath();
		if (!jobFilePath) return;

		void runJobAction(
			uploadVideoButton,
			jobFilePath,
			RuntimeMessageType.UploadVideoFirst,
			"Uploading video via native host…",
			"Video attached (or manual banner shown). Wait for upload to finish, then use Fill fields.",
		);
	});

	fillFieldsButton.addEventListener("click", () => {
		const jobFilePath = readJobPath();
		if (!jobFilePath) return;

		void runJobAction(
			fillFieldsButton,
			jobFilePath,
			RuntimeMessageType.FillFieldsFromFile,
			"Filling fields via native host…",
			"Fields filled. Review the page, then publish manually.",
		);
	});
}

void bootstrap();
