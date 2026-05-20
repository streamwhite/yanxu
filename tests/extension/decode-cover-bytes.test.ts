import { decodeCoverAttachmentBytes } from "../../extension/src/content/decode-cover-bytes";

describe("decodeCoverAttachmentBytes", () => {
	it("decodes each streamed chunk separately then concatenates bytes", () => {
		const bytes = decodeCoverAttachmentBytes({
			kind: "inlineBase64Chunks",
			mimeType: "image/png",
			chunks: ["AA==", "AQ=="],
		});

		expect(bytes.length).toBe(2);
		expect(bytes[0]).toBe(0);
		expect(bytes[1]).toBe(1);
	});
});
