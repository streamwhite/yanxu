/**
 * @jest-environment jsdom
 */
import { selectPartitionValue } from "../../extension/src/content/select-partition-value";

function wirePartitionOptionClick(option: Element): void {
	option.addEventListener("click", () => {
		const display = document.querySelector(".select-controller .select-item-cont-inserted");
		if (display) display.textContent = option.textContent;
		const panel = option.closest(".dropdown-panel, .sub-panel");
		panel?.remove();
	});
}

describe("selectPartitionValue", () => {
	it("sets partition display text inside selector-container without opening the dropdown", async () => {
		document.body.innerHTML = `
			<section>
				<h3 class="section-title-content-main">分区</h3>
				<div class="selector-container">
					<div><div><p class="select-item-cont select-item-cont-inserted">生活</p></div></div>
				</div>
			</section>
		`;

		await expect(selectPartitionValue(document, "人工智能")).resolves.toBe(true);
		expect(
			document.querySelector(".selector-container .select-item-cont-inserted")?.textContent?.trim(),
		).toBe("人工智能");
	});

	it("opens the 分区 dropdown and selects a matching option", async () => {
		document.body.innerHTML = `
			<section>
				<h3 class="section-title-content-main">分区</h3>
				<div class="select-controller">
					<p class="select-item-cont select-item-cont-inserted">生活</p>
				</div>
			</section>
			<div class="dropdown-panel">
				<p class="select-item-cont">生活</p>
				<p class="select-item-cont">vlog</p>
			</div>
		`;

		for (const option of Array.from(document.querySelectorAll(".dropdown-panel .select-item-cont"))) {
			wirePartitionOptionClick(option);
		}

		await expect(selectPartitionValue(document, "vlog")).resolves.toBe(true);
		const selected = document.querySelector(".select-controller .select-item-cont-inserted");
		expect(selected?.textContent?.trim()).toBe("vlog");
	});

	it("matches partition labels with middle dots", async () => {
		document.body.innerHTML = `
			<section>
				<h3 class="section-title-content-main">分区</h3>
				<div class="select-controller">
					<p class="select-item-cont select-item-cont-inserted">生活</p>
				</div>
			</section>
			<div class="dropdown-panel">
				<p class="select-item-cont">科技 · 数码</p>
			</div>
		`;

		for (const option of Array.from(document.querySelectorAll(".dropdown-panel .select-item-cont"))) {
			wirePartitionOptionClick(option);
		}

		await expect(selectPartitionValue(document, "科技数码")).resolves.toBe(true);
	});

	it("selects a sub-partition after opening a primary category", async () => {
		document.body.innerHTML = `
			<section>
				<h3 class="section-title-content-main">分区</h3>
				<div class="select-controller">
					<p class="select-item-cont select-item-cont-inserted">生活</p>
				</div>
			</section>
			<div class="dropdown-panel">
				<p class="select-item-cont">科技</p>
			</div>
			<div class="sub-panel" hidden>
				<p class="select-item-cont">人工智能</p>
			</div>
		`;

		const controller = document.querySelector(".select-controller");
		const primary = document.querySelector(".dropdown-panel .select-item-cont");
		const subPanel = document.querySelector(".sub-panel");
		const subOption = document.querySelector(".sub-panel .select-item-cont");

		primary?.addEventListener("click", () => {
			subPanel?.removeAttribute("hidden");
		});

		subOption?.addEventListener("click", () => {
			const display = document.querySelector(".select-controller .select-item-cont-inserted");
			if (display) display.textContent = subOption.textContent;
			subPanel?.remove();
			document.querySelector(".dropdown-panel")?.remove();
		});

		await expect(selectPartitionValue(document, "人工智能")).resolves.toBe(true);
		expect(controller?.querySelector(".select-item-cont-inserted")?.textContent?.trim()).toBe(
			"人工智能",
		);
	});

	it("selects a top-level primary without double-clicking it open as a category", async () => {
		document.body.innerHTML = `
			<section>
				<h3 class="section-title-content-main">分区</h3>
				<div class="select-controller">
					<p class="select-item-cont select-item-cont-inserted">生活</p>
				</div>
			</section>
			<div class="dropdown-panel">
				<p class="select-item-cont">生活</p>
				<p class="select-item-cont">知识</p>
				<p class="select-item-cont">科技</p>
			</div>
		`;

		for (const option of Array.from(document.querySelectorAll(".dropdown-panel .select-item-cont"))) {
			wirePartitionOptionClick(option);
		}

		await expect(selectPartitionValue(document, "知识")).resolves.toBe(true);
		const selected = document.querySelector(".select-controller .select-item-cont-inserted");
		expect(selected?.textContent?.trim()).toBe("知识");
	});

	it("does not treat preview text as a committed selection while the dropdown stays open", async () => {
		document.body.innerHTML = `
			<section>
				<h3 class="section-title-content-main">分区</h3>
				<div class="select-controller">
					<p class="select-item-cont select-item-cont-inserted">生活</p>
				</div>
			</section>
			<div class="dropdown-panel">
				<div class="select-item"><p class="select-item-cont">知识</p></div>
			</div>
			<div class="sub-panel">
				<p class="select-item-cont">科学科普</p>
			</div>
		`;

		const primary = document.querySelector(".dropdown-panel .select-item-cont");
		const subOption = document.querySelector(".sub-panel .select-item-cont");
		primary?.addEventListener("click", () => {
			const display = document.querySelector(".select-controller .select-item-cont-inserted");
			if (display) display.textContent = "知识";
		});
		subOption?.addEventListener("click", () => {
			const display = document.querySelector(".select-controller .select-item-cont-inserted");
			if (display) display.textContent = subOption.textContent;
			document.querySelector(".dropdown-panel")?.remove();
			document.querySelector(".sub-panel")?.remove();
		});

		await expect(selectPartitionValue(document, "科学科普")).resolves.toBe(true);
		const selected = document.querySelector(".select-controller .select-item-cont-inserted");
		expect(selected?.textContent?.trim()).toBe("科学科普");
	});
});
