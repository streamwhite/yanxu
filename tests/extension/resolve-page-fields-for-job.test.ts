import { resolvePageFieldsForJob } from "../../extension/src/platforms/resolve-page-fields-for-job";
import { CHANNELS_DEFAULT_MARK_TAG_OPTION } from "@yanxu/domain";

describe("resolvePageFieldsForJob", () => {
	it("maps douyin title and description", () => {
		const fields = resolvePageFieldsForJob({
			jobVersion: 2,
			platform: "douyin",
			targets: ["douyin"],
			publish: { mode: "semi", submit: "manual" },
			douyin: { title: "T", description: "D" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields).toHaveLength(2);
		expect(fields[0]?.value).toBe("T");
		expect(fields[1]?.value).toBe("D");
	});

	it("maps channels title with default mark tag first", () => {
		const fields = resolvePageFieldsForJob({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: "semi", submit: "manual" },
			channels: { title: "CT" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields).toHaveLength(2);
		expect(fields[0]?.kind).toBe("channelsMarkTag");
		expect(fields[0]?.value).toBe(CHANNELS_DEFAULT_MARK_TAG_OPTION);
		expect(fields[1]?.value).toBe("CT");
	});

	it("maps channels explicit mark tag override", () => {
		const fields = resolvePageFieldsForJob({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: "semi", submit: "manual" },
			channels: { title: "CT", markTag: "含AI生成内容" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields[0]?.value).toBe("含AI生成内容");
	});
});
