import { sanitizeBase64ForAtob } from "../../extension/src/content/sanitize-base64";

describe("sanitizeBase64ForAtob", () => {
	it("strips whitespace and adds padding", () => {
		expect(sanitizeBase64ForAtob("YQ ")).toBe("YQ==");
	});
});
