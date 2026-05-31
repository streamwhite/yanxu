import {
	CHANNELS_CONFIRM_BUTTON_HINTS,
	CHANNELS_ORIGINAL_PROTO_WRAPPER_SELECTOR,
	CHANNELS_ORIGINAL_SUBMIT_BUTTON_SELECTORS,
	CHANNELS_ORIGINAL_SUBMIT_BUTTON_TEXT,
} from "../platforms/channels/channels-selectors.js";
import { findChannelsOriginalDeclareLabel } from "../platforms/channels/find-channels-original-declare-label.js";
import {
	CHANNELS_ORIGINAL_MODAL_POLL_MS,
	CHANNELS_ORIGINAL_MODAL_WAIT_MS,
	CHANNELS_ORIGINAL_SETTLE_MS,
} from "./constants/channels-original-timing.js";
import { clickAntCheckboxLabel } from "./click-ant-checkbox-label.js";
import { dispatchClick } from "./dispatch-click.js";
import { findClickableByTextHint } from "./find-clickable-by-text-hint.js";
import { queryAllDeep } from "./query-all-deep.js";
import { waitMs } from "./wait-ms.js";

function findOriginalProtoWrapper(root: ParentNode): HTMLElement | null {
	return queryAllDeep(root, CHANNELS_ORIGINAL_PROTO_WRAPPER_SELECTOR)[0] ?? null;
}

function isAntCheckboxLabelChecked(label: HTMLElement): boolean {
	if (label.classList.contains("ant-checkbox-wrapper-checked")) return true;
	if (label.querySelector(".ant-checkbox-checked")) return true;
	const input = label.querySelector("input.ant-checkbox-input");
	return input instanceof HTMLInputElement && input.checked;
}

function ensureProtocolAgreementChecked(wrapper: HTMLElement): void {
	const unchecked = wrapper.querySelector(
		"label.ant-checkbox-wrapper:not(.ant-checkbox-wrapper-checked)",
	);
	if (!(unchecked instanceof HTMLElement)) return;
	clickAntCheckboxLabel(unchecked);
}

function clickOriginalSubmitButton(scope: ParentNode): boolean {
	for (const selector of CHANNELS_ORIGINAL_SUBMIT_BUTTON_SELECTORS) {
		for (const button of queryAllDeep(scope, selector)) {
			if (!button.textContent?.includes(CHANNELS_ORIGINAL_SUBMIT_BUTTON_TEXT)) continue;
			dispatchClick(button);
			return true;
		}
	}
	return false;
}

function clickModalConfirmByHint(scope: ParentNode): boolean {
	for (const hint of CHANNELS_CONFIRM_BUTTON_HINTS) {
		const button = findClickableByTextHint(scope, hint);
		if (!button) continue;
		dispatchClick(button);
		return true;
	}
	return false;
}

function clickModalConfirm(scope: ParentNode): boolean {
	return clickOriginalSubmitButton(scope) || clickModalConfirmByHint(scope);
}

async function confirmOriginalProtocolModal(root: ParentNode): Promise<boolean> {
	const wrapper = findOriginalProtoWrapper(root);
	if (!wrapper) return false;

	ensureProtocolAgreementChecked(wrapper);
	await waitMs(CHANNELS_ORIGINAL_SETTLE_MS);
	return clickModalConfirm(wrapper) || clickModalConfirm(root);
}

async function waitForOriginalProtocolModal(root: ParentNode): Promise<HTMLElement | null> {
	const deadline = Date.now() + CHANNELS_ORIGINAL_MODAL_WAIT_MS;

	while (Date.now() < deadline) {
		const wrapper = findOriginalProtoWrapper(root);
		if (wrapper) return wrapper;
		await waitMs(CHANNELS_ORIGINAL_MODAL_POLL_MS);
	}

	return findOriginalProtoWrapper(root);
}

export async function applyChannelsOriginalDeclare(root: ParentNode): Promise<boolean> {
	const label = findChannelsOriginalDeclareLabel(root);
	if (!label) return false;

	if (!isAntCheckboxLabelChecked(label)) {
		if (typeof label.scrollIntoView === "function") {
			label.scrollIntoView({ block: "center", inline: "nearest" });
		}
		clickAntCheckboxLabel(label);
		await waitMs(CHANNELS_ORIGINAL_SETTLE_MS);
	}

	const modal = await waitForOriginalProtocolModal(root);
	if (modal) {
		await confirmOriginalProtocolModal(root);
		await waitMs(CHANNELS_ORIGINAL_SETTLE_MS);
	}

	return isAntCheckboxLabelChecked(label);
}
