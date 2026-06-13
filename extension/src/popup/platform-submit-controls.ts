import { Platform, PLATFORM_IDS, type PlatformId } from "@auto-upload/domain";

export type PlatformSubmitUi = {
	platform: PlatformId;
	reviewedCheckbox: HTMLInputElement;
	submitButton: HTMLButtonElement;
};

const PLATFORM_SUBMIT_LABELS: Record<PlatformId, string> = {
	[Platform.Bilibili]: "bilibili",
	[Platform.Douyin]: "douyin",
	[Platform.Channels]: "视频号",
};

const PLATFORM_SUBMIT_ELEMENT_IDS: Record<
	PlatformId,
	{ reviewedCheckbox: string; submitButton: string }
> = {
	[Platform.Bilibili]: {
		reviewedCheckbox: "reviewedBilibiliCheckbox",
		submitButton: "submitBilibiliButton",
	},
	[Platform.Douyin]: {
		reviewedCheckbox: "reviewedDouyinCheckbox",
		submitButton: "submitDouyinButton",
	},
	[Platform.Channels]: {
		reviewedCheckbox: "reviewedChannelsCheckbox",
		submitButton: "submitChannelsButton",
	},
};

function byId(elementId: string): HTMLElement | null {
	return document.getElementById(elementId);
}

export function collectPlatformSubmitUi(): PlatformSubmitUi[] | null {
	const rows: PlatformSubmitUi[] = [];

	for (const platform of PLATFORM_IDS) {
		const ids = PLATFORM_SUBMIT_ELEMENT_IDS[platform];
		const reviewedCheckbox = byId(ids.reviewedCheckbox);
		const submitButton = byId(ids.submitButton);
		if (!(reviewedCheckbox instanceof HTMLInputElement)) return null;
		if (!(submitButton instanceof HTMLButtonElement)) return null;
		rows.push({ platform, reviewedCheckbox, submitButton });
	}

	return rows;
}

function syncSubmitButtonState(ui: PlatformSubmitUi): void {
	ui.submitButton.disabled = !ui.reviewedCheckbox.checked;
}

export function bindPlatformSubmitRow(
	ui: PlatformSubmitUi,
	onSubmit: (platform: PlatformId) => void,
): void {
	ui.reviewedCheckbox.addEventListener("change", () => {
		syncSubmitButtonState(ui);
	});
	syncSubmitButtonState(ui);

	ui.submitButton.addEventListener("click", () => {
		if (!ui.reviewedCheckbox.checked) return;
		onSubmit(ui.platform);
	});
}

export function platformSubmitBusyLabel(platform: PlatformId): string {
	return `Submitting ${PLATFORM_SUBMIT_LABELS[platform]} tabs…`;
}

export function platformSubmitSuccessLabel(platform: PlatformId): string {
	return `${PLATFORM_SUBMIT_LABELS[platform]} submit clicked on all tabs. Confirm any dialogs manually.`;
}
