import type { PlatformId } from "@auto-upload/domain";
import { listPlatformOutlineItems } from "../shared/list-platform-outline-items.js";
import { PLATFORM_TAB_LABELS } from "../sw/constants/platform-tab-labels.js";
import { inspectJobFileFromPopup } from "./inspect-job-file-from-popup.js";

export type PlatformItemSelectionEntry = {
	itemIndex: number;
	name: string;
};

const CHECKBOX_CLASS = "platform-item-checkbox" as const;

export async function loadPlatformItemSelectionEntries(
	jobFilePath: string,
	platform: PlatformId,
): Promise<PlatformItemSelectionEntry[] | null> {
	const inspected = await inspectJobFileFromPopup(jobFilePath);
	if (!inspected.ok) return null;
	return listPlatformOutlineItems(inspected.outline, platform);
}

function createItemCheckbox(entry: PlatformItemSelectionEntry): HTMLDivElement {
	const row = document.createElement("div");
	row.className = "form-check mb-1";

	const input = document.createElement("input");
	input.type = "checkbox";
	input.className = `form-check-input ${CHECKBOX_CLASS}`;
	input.id = `platformItem${String(entry.itemIndex)}`;
	input.checked = true;
	input.dataset.itemIndex = String(entry.itemIndex);

	const label = document.createElement("label");
	label.className = "form-check-label small";
	label.htmlFor = input.id;
	label.textContent = entry.name;

	row.append(input, label);
	return row;
}

export function renderPlatformItemSelectionList(
	container: HTMLElement,
	entries: PlatformItemSelectionEntry[],
	platform: PlatformId,
): void {
	container.replaceChildren();
	if (entries.length === 0) {
		const empty = document.createElement("p");
		empty.className = "small text-muted mb-0";
		empty.textContent = `没有指向 ${PLATFORM_TAB_LABELS[platform]} 的任务条目。`;
		container.append(empty);
		return;
	}

	for (const entry of entries) {
		container.append(createItemCheckbox(entry));
	}
}

export function readSelectedPlatformItemIndices(container: HTMLElement): number[] {
	const checkboxes = container.querySelectorAll<HTMLInputElement>(
		`input.${CHECKBOX_CLASS}:checked`,
	);
	return [...checkboxes]
		.map((checkbox) => Number(checkbox.dataset.itemIndex))
		.filter((itemIndex) => Number.isInteger(itemIndex) && itemIndex >= 0);
}

export function hasPlatformItemSelection(container: HTMLElement): boolean {
	return container.querySelectorAll(`input.${CHECKBOX_CLASS}`).length > 0;
}

