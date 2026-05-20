import type { Readable } from "node:stream";
import { once } from "node:events";
import { NATIVE_MESSAGE_MAX_BYTES } from "@auto-upload/domain";

export class NativeMessageReader {
	private carry = Buffer.alloc(0);

	constructor(private readonly input: Readable) {}

	async readJson(): Promise<unknown> {
		const header = await this.readBytes(4);
		const length = header.readUInt32LE(0);
		if (length === 0 || length > NATIVE_MESSAGE_MAX_BYTES) {
			throw new Error("native_message_invalid_length");
		}
		const body = await this.readBytes(length);
		return JSON.parse(body.toString("utf8")) as unknown;
	}

	private async readBytes(size: number): Promise<Buffer> {
		while (this.carry.length < size) {
			const chunk = await this.readNextChunk();
			this.carry = Buffer.concat([this.carry, chunk]);
		}

		const out = this.carry.subarray(0, size);
		this.carry = this.carry.subarray(size);
		return Buffer.from(out);
	}

	private async readNextChunk(): Promise<Buffer> {
		while (true) {
			const readable = this.input.read() as Buffer | string | null;
			if (readable) return Buffer.isBuffer(readable) ? readable : Buffer.from(readable);

			if (this.input.readableEnded) throw new Error("native_message_unexpected_eof");
			await once(this.input, "readable");
		}
	}
}

export async function readNativeJsonMessage(input: Readable): Promise<unknown> {
	const reader = new NativeMessageReader(input);
	return reader.readJson();
}
