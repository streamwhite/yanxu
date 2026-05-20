import {
	HostOutboundMessageSchema,
	type AppliedJobPayload,
	type HostOutboundMessage,
} from "@auto-upload/domain";
import { mergeStreamsIntoApplyPayload } from "./merge-streams-into-payload.js";
import type { NativeSessionResult } from "./post-native-message-session.js";

export type ResolvedApplyJob =
	| { ok: true; payload: AppliedJobPayload }
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

	if (terminal.type !== "applyJobReady") {
		return { ok: false, code: "unexpected_response", message: terminal.type };
	}

	try {
		const payload = mergeStreamsIntoApplyPayload(batch, terminal.payload);
		return { ok: true, payload };
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : "stream_merge_failed";
		const code = msg.includes("cover_stream")
			? "cover_stream_incomplete"
			: "video_stream_incomplete";
		return { ok: false, code, message: msg };
	}
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
