import { buildDefaultBilibiliPageFields } from "../../extension/src/content/bilibili-default-fields";
import { PageFieldKind } from "../../extension/src/content/page-field-apply";

describe("buildDefaultBilibiliPageFields", () => {
	it("ignores blank tags instead of requiring the tag input", () => {
		const fields = buildDefaultBilibiliPageFields({
			jobVersion: 2,
			platform: "bilibili",
			targets: ["bilibili"],
			publish: { mode: "semi", submit: "manual" },
			bilibili: { title: "Title", description: "", tags: [""] },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields.some((field) => field.kind === PageFieldKind.TagsEnter)).toBe(false);
		expect(fields.some((field) => field.fieldLabel === "简介")).toBe(false);
	});
});
