const CONTENT_SCRIPT_FILE = "dist/content-bilibili-fill.js" as const;

const INJECT_RETRY_DELAY_MS = 150 as const;

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		globalThis.setTimeout(resolve, ms);
	});
}

export async function injectContentScriptIntoTab(tabId: number): Promise<void> {
	await chrome.scripting.executeScript({
		target: { tabId },
		files: [CONTENT_SCRIPT_FILE],
	});
	await delay(INJECT_RETRY_DELAY_MS);
}
