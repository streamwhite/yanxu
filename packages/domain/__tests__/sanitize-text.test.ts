import { sanitizeText } from "@auto-upload/domain";

describe("sanitizeText", () => {
	it("trims and normalizes CRLF", () => {
		expect(sanitizeText("  a\r\nb  ")).toBe("a\nb");
	});
});
