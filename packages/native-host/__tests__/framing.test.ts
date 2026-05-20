import { PassThrough } from "node:stream";
import { readNativeJsonMessage } from "../src/io/native-message-reader";
import { writeNativeJsonMessage } from "../src/io/write-native-message";

describe("native messaging framing", () => {
	it("roundtrips a JSON message", async () => {
		const captured: Buffer[] = [];
		const output = new PassThrough();
		output.on("data", (chunk: Buffer) => captured.push(chunk));

		await writeNativeJsonMessage(output, { type: "pong" });
		output.end();

		const written = Buffer.concat(captured);
		const input = new PassThrough();
		input.end(written);

		const decoded = await readNativeJsonMessage(input);
		expect(decoded).toEqual({ type: "pong" });
	});
});
