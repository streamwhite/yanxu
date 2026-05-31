const POPUP_HTML_PATH = "popup.html" as const;
const POPUP_WINDOW_WIDTH_PX = 420 as const;
const POPUP_WINDOW_HEIGHT_PX = 640 as const;

function popupPageUrl(): string {
	return chrome.runtime.getURL(POPUP_HTML_PATH);
}

async function findExistingPopupWindow(): Promise<chrome.windows.Window | undefined> {
	const popupUrl = popupPageUrl();
	const windows = await chrome.windows.getAll({ populate: true });
	return windows.find((win) => win.tabs?.some((tab) => tab.url === popupUrl));
}

export async function openOrFocusPopupWindow(): Promise<void> {
	const existing = await findExistingPopupWindow();
	if (existing?.id !== undefined) {
		await chrome.windows.update(existing.id, { focused: true });
		return;
	}

	await chrome.windows.create({
		url: popupPageUrl(),
		type: "popup",
		width: POPUP_WINDOW_WIDTH_PX,
		height: POPUP_WINDOW_HEIGHT_PX,
		focused: true,
	});
}
