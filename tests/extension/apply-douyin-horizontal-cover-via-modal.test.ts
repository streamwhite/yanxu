/**
 * @jest-environment jsdom
 */
import { applyDouyinCoverViaModal } from "../../extension/src/platforms/douyin/apply-douyin-cover-via-modal";

const PAGE_HTML = `
	<div class="coverControl-CjlzqC">
		<div class="filter-k_CjvJ">
			<div class="title-wA45Xd">选择封面</div>
		</div>
		<div class="cover-tip-YkBvmu">竖封面3:4</div>
	</div>
	<div id="dy-creator-content-modal-body">
		<div class="semi-upload upload-BvM5FF">
			<div class="semi-upload-drag-area">
				<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
			</div>
			<input type="file" accept="image/png" />
		</div>
		<button type="button"><span class="semi-button-content">设置横封面</span></button>
	</div>
`;

describe("applyDouyinCoverViaModal with horizontal file", () => {
	jest.setTimeout(60_000);

	it("uploads the -4x3 horizontal file into the modal after switching", async () => {
		document.body.innerHTML = PAGE_HTML;

		const vertical = new File(["x"], "cover.png", { type: "image/png" });
		const horizontal = new File(["xy"], "cover-4x3.png", { type: "image/png" });

		await expect(applyDouyinCoverViaModal(document, vertical, horizontal)).resolves.toBe(true);

		const input = document.querySelector<HTMLInputElement>("#dy-creator-content-modal-body input[type=file]");
		expect(input?.files?.item(0)?.name).toBe("cover-4x3.png");
		expect(document.querySelector("#dy-creator-content-modal-body")).not.toBeNull();
	});

	it("keeps the vertical-only behaviour when no horizontal file is given", async () => {
		document.body.innerHTML = PAGE_HTML;

		const vertical = new File(["x"], "cover.png", { type: "image/png" });
		await expect(applyDouyinCoverViaModal(document, vertical)).resolves.toBe(true);

		const input = document.querySelector<HTMLInputElement>("#dy-creator-content-modal-body input[type=file]");
		expect(input?.files?.item(0)?.name).toBe("cover.png");
	});
});
