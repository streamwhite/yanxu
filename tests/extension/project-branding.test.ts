import { existsSync, readFileSync } from "node:fs";

describe("雁序 project branding", () => {
	it("uses the product name in extension surfaces", () => {
		const manifest = readFileSync("extension/manifest.json", "utf8");
		const popup = readFileSync("extension/popup.html", "utf8");
		const options = readFileSync("extension/options.html", "utf8");

		expect(manifest).toContain("雁序");
		expect(popup).toContain("雁序");
		expect(options).toContain("雁序");
	});

	it("ships toolbar icons for every manifest size", () => {
		const manifest = JSON.parse(readFileSync("extension/manifest.json", "utf8")) as {
			icons?: Record<string, string>;
			action?: { default_icon?: Record<string, string> };
		};
		const iconPaths = new Set([
			...Object.values(manifest.icons ?? {}),
			...Object.values(manifest.action?.default_icon ?? {}),
		]);

		expect([...iconPaths].sort()).toEqual([
			"icons/icon-128.png",
			"icons/icon-16.png",
			"icons/icon-32.png",
			"icons/icon-48.png",
		]);
		for (const iconPath of iconPaths) {
			expect(existsSync(`extension/${iconPath}`)).toBe(true);
		}
	});
});
