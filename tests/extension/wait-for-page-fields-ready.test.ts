/**
 * @jest-environment jsdom
 */
import { Platform } from "@yanxu/domain";
import { waitForPageFieldsReady } from "../../extension/src/content/wait-for-page-fields-ready";

describe("waitForPageFieldsReady", () => {
	it("waits for visible bilibili title before fill", async () => {
		document.body.innerHTML = `
			<input id="title" style="display: none" placeholder="请输入稿件标题" />
		`;

		const job = {
			jobVersion: 2 as const,
			platform: Platform.Bilibili,
			targets: [Platform.Bilibili],
			publish: { mode: "semi" as const, submit: "manual" as const },
			assets: { localVideoPath: "/tmp/v.mp4" },
			bilibili: { title: "t", partition: "知识" },
		};

		setTimeout(() => {
			const title = document.querySelector("#title");
			if (title instanceof HTMLElement) title.style.display = "block";
		}, 30);

		await expect(waitForPageFieldsReady(job)).resolves.toBeUndefined();
	});
});
