/**
 * @jest-environment jsdom
 */
import type { CanonicalJob } from "@auto-upload/domain";
import { waitForFieldsReadyBeforeCover } from "../../extension/src/content/wait-for-fields-ready-before-cover";

describe("waitForFieldsReadyBeforeCover", () => {
	it("resolves when bilibili cover trigger appears", async () => {
		const job: CanonicalJob = {
			jobVersion: 2,
			platform: "bilibili",
			targets: ["bilibili"],
			bilibili: { title: "T", description: "D" },
			publish: { mode: "semi", submit: "manual" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		};

		setTimeout(() => {
			document.body.innerHTML = `
				<div class="cover-img"><span class="edit-text">封面设置</span></div>
			`;
		}, 30);

		await expect(waitForFieldsReadyBeforeCover(job)).resolves.toBeUndefined();
	});

	it("resolves when douyin cover trigger appears", async () => {
		const job: CanonicalJob = {
			jobVersion: 2,
			platform: "douyin",
			targets: ["douyin"],
			publish: { mode: "semi", submit: "manual" },
			douyin: { title: "T" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		};

		setTimeout(() => {
			document.body.innerHTML = `
				<div class="filter-k_CjvJ">
					<div class="title-wA45Xd">选择封面</div>
				</div>
			`;
		}, 30);

		await expect(waitForFieldsReadyBeforeCover(job)).resolves.toBeUndefined();
	});
});
