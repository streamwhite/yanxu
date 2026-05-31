import { buildDefaultDouyinPageFields } from "../../extension/src/platforms/douyin/douyin-default-fields";
import {
	DOUYIN_DESCRIPTION_PLACEHOLDER,
	DOUYIN_TITLE_PLACEHOLDER,
} from "../../extension/src/platforms/douyin/douyin-selectors";

describe("buildDefaultDouyinPageFields", () => {
	it("uses creator upload page selectors for title and description", () => {
		const fields = buildDefaultDouyinPageFields({
			jobVersion: 2,
			platform: "douyin",
			targets: ["douyin"],
			publish: { mode: "semi", submit: "manual" },
			douyin: { title: "My title", description: "My desc" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields[0]?.locator).toEqual({
			css: `input.semi-input[type="text"][placeholder="${DOUYIN_TITLE_PLACEHOLDER}"]`,
		});
		expect(fields[1]?.locator).toEqual({
			css: `div[contenteditable="true"][data-placeholder="${DOUYIN_DESCRIPTION_PLACEHOLDER}"]`,
		});
	});
});
