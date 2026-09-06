import { BilibiliSourceType, CHANNELS_DEFAULT_MARK_TAG_OPTION } from "@auto-upload/domain";
import { buildDefaultChannelsPageFields } from "../../extension/src/platforms/channels/channels-default-fields";
import {
	CHANNELS_DESCRIPTION_PLACEHOLDER,
	CHANNELS_MARK_TAG_SELECT_SELECTOR,
	CHANNELS_TITLE_PLACEHOLDER,
} from "../../extension/src/platforms/channels/channels-selectors";
import { PageFieldKind } from "../../extension/src/content/page-field-apply";

describe("buildDefaultChannelsPageFields", () => {
	it("always pushes the mark-tag field first with the default option", () => {
		const fields = buildDefaultChannelsPageFields({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: "semi", submit: "manual" },
			channels: { title: "My title", description: "My desc" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields[0]?.kind).toBe(PageFieldKind.ChannelsMarkTag);
		expect(fields[0]?.locator).toEqual({ css: CHANNELS_MARK_TAG_SELECT_SELECTOR });
		expect(fields[0]?.markTagOption).toBe(CHANNELS_DEFAULT_MARK_TAG_OPTION);
	});

	it("uses wechat creator selectors for title and description", () => {
		const fields = buildDefaultChannelsPageFields({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: "semi", submit: "manual" },
			channels: { title: "My title", description: "My desc" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields[1]?.locator).toEqual({
			css: `input.weui-desktop-form__input[type="text"][placeholder="${CHANNELS_TITLE_PLACEHOLDER}"]`,
		});
		expect(fields[2]?.locator).toEqual({
			css: `.post-desc-box div.input-editor[data-placeholder="${CHANNELS_DESCRIPTION_PLACEHOLDER}"]`,
		});
	});

	it("adds short title field when shortTitle is set", () => {
		const fields = buildDefaultChannelsPageFields({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: "semi", submit: "manual" },
			channels: { title: "T", shortTitle: "Short" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields.some((field) => field.fieldLabel === "短标题")).toBe(true);
	});

	it("adds original declare field when sourceType is original", () => {
		const fields = buildDefaultChannelsPageFields({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: "semi", submit: "manual" },
			channels: { title: "T", sourceType: BilibiliSourceType.Original },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields.some((field) => field.kind === PageFieldKind.OriginalDeclareCheckbox)).toBe(
			true,
		);
	});

	it("uses channels.markTag to override the default mark-tag option", () => {
		const fields = buildDefaultChannelsPageFields({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: "semi", submit: "manual" },
			channels: { title: "T", markTag: "含AI生成内容" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields[0]?.markTagOption).toBe("含AI生成内容");
	});
});

