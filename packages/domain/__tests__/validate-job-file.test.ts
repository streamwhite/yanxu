import { validateJobFile } from "@auto-upload/domain";

describe("validateJobFile error messages", () => {
	it("reports missing batch fields instead of canonical union errors", () => {
		const result = validateJobFile({
			jobVersion: 3,
			items: [{ name: "clip-a" }],
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.errorMessage).toContain("assetsParentFolder");
		expect(result.errorMessage).not.toContain("invalid_union");
	});

	it("reports missing batch items for an empty object shaped like batch", () => {
		const result = validateJobFile({ items: [] });

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.errorMessage).toContain("jobVersion");
	});
});
