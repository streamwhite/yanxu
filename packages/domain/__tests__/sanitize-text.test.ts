import { sanitizeText } from "@yanxu/domain";

describe("sanitizeText", () => {
	it("trims and normalizes CRLF", () => {
		expect(sanitizeText("  a\r\nb  ")).toBe("a\nb");
	});
});
