const KEEP_ALIVE_INTERVAL_MS = 15_000 as const;

let keepAliveCount = 0;
let intervalId: ReturnType<typeof setInterval> | undefined;

function startInterval(): void {
	if (intervalId !== undefined) return;
	intervalId = globalThis.setInterval(() => {
		void chrome.runtime.getPlatformInfo();
		void chrome.storage.local.get(null);
	}, KEEP_ALIVE_INTERVAL_MS);
}

function stopInterval(): void {
	if (intervalId === undefined) return;
	globalThis.clearInterval(intervalId);
	intervalId = undefined;
}

export function acquireServiceWorkerKeepAlive(): () => void {
	keepAliveCount += 1;
	if (keepAliveCount === 1) startInterval();
	return () => {
		keepAliveCount = Math.max(0, keepAliveCount - 1);
		if (keepAliveCount === 0) stopInterval();
	};
}
