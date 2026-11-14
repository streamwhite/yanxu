#!/usr/bin/env node
import process from "node:process";
import { HostInboundMessageSchema, type HostOutboundMessage } from "@yanxu/domain";
import { NativeMessageReader } from "./io/native-message-reader.js";
import { writeNativeJsonMessage } from "./io/write-native-message.js";
import { handleHostInboundMessage } from "./router/handle-host-inbound-message.js";

const EOF_MESSAGE = "native_message_unexpected_eof" as const;

const FALLBACK_WRITE_ERROR_CODE = "native_message_write_failed" as const;

async function safeWriteOutbound(message: HostOutboundMessage): Promise<void> {
	try {
		await writeNativeJsonMessage(process.stdout, message);
	} catch (error: unknown) {
		const detail = error instanceof Error ? error.message : "write_failed";
		try {
			await writeNativeJsonMessage(process.stdout, {
				type: "error",
				code: FALLBACK_WRITE_ERROR_CODE,
				message: detail,
			});
		} catch {
			//
		}
	}
}

async function main(): Promise<void> {
	process.stdin.resume();
	const reader = new NativeMessageReader(process.stdin);

	while (true) {
		let raw: unknown;
		try {
			raw = await reader.readJson();
		} catch (error) {
			if (error instanceof Error && error.message === EOF_MESSAGE) break;

			await safeWriteOutbound({
				type: "error",
				code: "read_failure",
				message: error instanceof Error ? error.message : "unexpected_read_error",
			});
			continue;
		}

		const inbound = HostInboundMessageSchema.safeParse(raw);
		if (!inbound.success) {
			await safeWriteOutbound({
				type: "error",
				code: "invalid_inbound_message",
				message: inbound.error.message,
			});
			continue;
		}

		const outboundBatch = await handleHostInboundMessage(inbound.data);
		for (const outbound of outboundBatch) {
			await safeWriteOutbound(outbound);
		}
	}
}

void main();
