import { acquireServiceWorkerKeepAlive } from "./service-worker-keep-alive.js";

export async function runWithServiceWorkerKeepAlive<T>(work: () => Promise<T>): Promise<T> {
	const releaseKeepAlive = acquireServiceWorkerKeepAlive();
	try {
		return await work();
	} finally {
		releaseKeepAlive();
	}
}
