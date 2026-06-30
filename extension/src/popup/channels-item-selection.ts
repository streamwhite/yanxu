import { listChannelsOutlineItems } from "../shared/list-channels-outline-items.js";
import {
	RuntimeMessageType,
	type InspectJobFileRuntimeResult,
} from "../runtime/runtime-message.js";
import { sendPingToServiceWorker } from "./send-runtime-message.js";

export type ChannelsItemSelectionEntry = {
	itemIndex: number;
	name: string;
};

const CHECKBOX_CLASS = "channels-item-checkbox" as const;

export async function inspectJobFileFromPopup(
	jobFilePath: string,
): Promise<InspectJobFileRuntimeResult> {
	await sendPingToServiceWorker();
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{ type: RuntimeMessageType.InspectJobFile, jobFilePath },
			(response: InspectJobFileRuntimeResult | undefined) => {
				const lastError = chrome.runtime.lastError;
				if (lastError?.message) {
					reject(new Error(lastError.message));
					return;
				}
				if (!response || typeof response !== "object" || !("ok" in response)) {
					reject(new Error("inspect_failed"));
					return;
				}
				resolve(response);
			},
		);
	});
}

export async function loadChannelsItemSelectionEntries(
	jobFilePath: string,
): Promise<ChannelsItemSelectionEntry[] | null> {
	const inspected = await inspectJobFileFromPopup(jobFilePath);
	if (!inspected.ok) return null;
	return listChannelsOutlineItems(inspected.outline);
}

function createItemCheckbox(entry: ChannelsItemSelectionEntry): HTMLDivElement {
	const row = document.createElement("div");
	row.className = "form-check mb-1";

	const input = document.createElement("input");
	input.type = "checkbox";
	input.className = `form-check-input ${CHECKBOX_CLASS}`;
	input.id = `channelsItem${String(entry.itemIndex)}`;
	input.checked = true;
	input.dataset.itemIndex = String(entry.itemIndex);

	const label = document.createElement("label");
	label.className = "form-check-label small";
	label.htmlFor = input.id;
	label.textContent = entry.name;

	row.append(input, label);
	return row;
}

export function renderChannelsItemSelectionList(
	container: HTMLElement,
	entries: ChannelsItemSelectionEntry[],
): void {
	container.replaceChildren();
	if (entries.length === 0) {
		const empty = document.createElement("p");
		empty.className = "small text-muted mb-0";
		empty.textContent = "No job items target 视频号.";
		container.append(empty);
		return;
	}

	for (const entry of entries) {
		container.append(createItemCheckbox(entry));
	}
}

export function readSelectedChannelsItemIndices(container: HTMLElement): number[] {
	const checkboxes = container.querySelectorAll<HTMLInputElement>(
		`input.${CHECKBOX_CLASS}:checked`,
	);
	return [...checkboxes]
		.map((checkbox) => Number(checkbox.dataset.itemIndex))
		.filter((itemIndex) => Number.isInteger(itemIndex) && itemIndex >= 0);
}

export function hasChannelsItemSelection(container: HTMLElement): boolean {
	return container.querySelectorAll(`input.${CHECKBOX_CLASS}`).length > 0;
}
