import { NATIVE_MESSAGE_MAX_BYTES } from "@auto-upload/domain";

export async function writeNativeJsonMessage(
	output: NodeJS.WritableStream,
	message: unknown,
): Promise<void> {
	const payload = Buffer.from(JSON.stringify(message), "utf8");
	if (payload.length === 0 || payload.length > NATIVE_MESSAGE_MAX_BYTES) {
		throw new Error("native_message_payload_invalid");
	}

	const header = Buffer.alloc(4);
	header.writeUInt32LE(payload.length, 0);

	await writeBuffers(output, [header, payload]);
}

async function writeBuffers(output: NodeJS.WritableStream, chunks: Buffer[]): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const pending = [...chunks];

		const writeNext = () => {
			const next = pending.shift();
			if (!next) {
				resolve();
				return;
			}

			output.write(next, (err) => {
				if (err) reject(err);
				else writeNext();
			});
		};

		writeNext();
	});
}
