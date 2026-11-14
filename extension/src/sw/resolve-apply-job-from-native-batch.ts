import { HostOutboundMessageSchema, type HostOutboundMessage } from "@yanxu/domain";
import type { NativeSessionResult } from "./post-native-message-session.js";

export type ResolvedApplyJob =
	| { ok: true; batch: HostOutboundMessage[] }
	| { ok: false; code: string; message: string };

function parseOutboundBatch(batch: HostOutboundMessage[]): ResolvedApplyJob {
	const parsed = batch.map((message) => HostOutboundMessageSchema.safeParse(message));
	for (const item of parsed) {
		if (!item.success) {
			return { ok: false, code: "invalid_host_response", message: item.error.message };
		}
	}

	if (batch.length === 0) {
		return { ok: false, code: "empty_host_batch", message: "empty_host_batch" };
	}

	const terminal = batch[batch.length - 1];
	if (!terminal) {
		return { ok: false, code: "empty_host_batch", message: "empty_host_batch" };
	}

	if (terminal.type === "pong") {
		return { ok: false, code: "unexpected_response", message: "pong_not_apply" };
	}

	if (terminal.type === "error") {
		return { ok: false, code: terminal.code, message: terminal.message };
	}

	if (terminal.type !== "applyJobReady") {
		return { ok: false, code: "unexpected_response", message: terminal.type };
	}

	return { ok: true, batch };
}

export function resolveApplyJobFromNativeSession(session: NativeSessionResult): ResolvedApplyJob {
	if (!session.ok) return session;

	const messages: HostOutboundMessage[] = [];
	for (const raw of session.batch) {
		const parsed = HostOutboundMessageSchema.safeParse(raw);
		if (!parsed.success) {
			return { ok: false, code: "invalid_host_response", message: parsed.error.message };
		}
		messages.push(parsed.data);
	}

	return parseOutboundBatch(messages);
}
