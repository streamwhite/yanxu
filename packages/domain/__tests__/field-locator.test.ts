import { FieldLocatorSchema } from "@auto-upload/domain";

describe("FieldLocatorSchema", () => {
	it("accepts css locator", () => {
		const parsed = FieldLocatorSchema.safeParse({ css: "#title" });
		expect(parsed.success).toBe(true);
	});

	it("rejects empty locator", () => {
		const parsed = FieldLocatorSchema.safeParse({});
		expect(parsed.success).toBe(false);
	});
});
