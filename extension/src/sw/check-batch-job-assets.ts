import { postNativeMessageSession } from "./post-native-message-session.js";

export type CheckBatchJobAssetsResult = { ok: true } | { ok: false; code: string; message: string };

export async function checkBatchJobAssets(jobFilePath: string): Promise<CheckBatchJobAssetsResult> {
	const session = await postNativeMessageSession({
		type: "checkBatchJobAssetsFromFile",
		jobFilePath,
	});

	if (!session.ok) {
		return { ok: false, code: session.code, message: session.message };
	}

	const terminal = session.batch[session.batch.length - 1];
	if (!terminal || terminal.type === "error") {
		return {
			ok: false,
			code: terminal?.type === "error" ? terminal.code : "asset_check_failed",
			message: terminal?.type === "error" ? terminal.message : "asset_check_failed",
		};
	}

	if (terminal.type !== "batchAssetsReady") {
		return { ok: false, code: "unexpected_host_reply", message: terminal.type };
	}

	return { ok: true };
}
