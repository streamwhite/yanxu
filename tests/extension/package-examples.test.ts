import { readFileSync } from "node:fs";

describe("extension package examples", () => {
	it("includes the supported JSON and XLSX batch examples in the package", () => {
		const packageScript = readFileSync("scripts/package-extension.mjs", "utf8");

		expect(packageScript).toContain('"examples/batch.job.example.json"');
		expect(packageScript).toContain('"examples/batch.job.example.xlsx"');
	});
});
