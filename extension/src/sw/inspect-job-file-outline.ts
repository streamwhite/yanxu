import { JobFileOutlineSchema } from "@auto-upload/domain";
import { postNativeMessageSession } from "./post-native-message-session.js";

export type InspectJobOutlineResult =
	| { ok: true; outline: { jobVersion: number; items: { itemIndex: number; targets: string[] }[] } }
	| { ok: false; code: string; message: string };

export async function inspectJobFileOutline(jobFilePath: string): Promise<InspectJobOutlineResult> {
	const session = await postNativeMessageSession({
		type: "inspectJobFromFile",
		jobFilePath,
	});

	if (!session.ok) {
		return { ok: false, code: session.code, message: session.message };
	}

	const terminal = session.batch[session.batch.length - 1];
	if (!terminal || terminal.type === "error") {
		return { ok: false, code: "inspect_failed", message: "inspect_failed" };
	}
	if (terminal.type !== "jobFileOutline") {
		return { ok: false, code: "unexpected_host_reply", message: terminal.type };
	}

	const parsed = JobFileOutlineSchema.safeParse(terminal.outline);
	if (!parsed.success) {
		return { ok: false, code: "invalid_outline", message: parsed.error.message };
	}

	return { ok: true, outline: parsed.data };
}
