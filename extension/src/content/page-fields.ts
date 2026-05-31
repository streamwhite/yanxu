import { applyChannelsOriginalDeclare } from "./apply-channels-original-declare.js";
import {
	applyBilibiliCreativeStatement,
	bilibiliCreativeStatementMissingLabel,
} from "./apply-bilibili-creative-statement.js";
import { PageFieldKind } from "./page-field-apply.js";
import { locatorToCssSelector } from "./locator.js";
import { clickRadioOptionByLabel } from "./click-radio-by-label.js";
import { applyTagsWithEnter } from "./apply-tags-with-enter.js";
import { partitionFieldMissingLabel, selectPartitionValue } from "./select-partition-value.js";
import { isElementVisible } from "./is-element-visible.js";
import {
	isContentEditableElement,
	pickFirstVisibleElementDeep,
	setContentEditableText,
	setFormControlValue,
} from "./dom.js";
import type { PlatformId } from "@auto-upload/domain";
import type { ApplyPageField } from "./page-field-apply.js";
import { reportApplyProgress } from "./report-apply-progress.js";
import { BatchProgressKind } from "../shared/batch-progress.js";

export type ApplyPageFieldsProgressContext = {
	platform: PlatformId;
	itemIndex: number;
};

function applyValueToElement(element: HTMLElement, value: string): void {
	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		setFormControlValue(element, value);
		return;
	}

	if (isContentEditableElement(element)) {
		setContentEditableText(element, value);
	}
}

function findFieldElement(root: ParentNode, field: ApplyPageField): HTMLElement | null {
	if (field.selectorFallbacks?.length) {
		return pickFirstVisibleElementDeep(root, field.selectorFallbacks);
	}

	const selector = locatorToCssSelector(field.locator);
	const found = root.querySelector(selector);
	if (!(found instanceof HTMLElement)) return null;
	return isElementVisible(found) ? found : null;
}

function resolveFieldLabel(field: ApplyPageField): string {
	if (field.fieldLabel) return field.fieldLabel;

	if (field.kind === PageFieldKind.PartitionSelect) {
		return partitionFieldMissingLabel(field.value);
	}

	if (field.kind === PageFieldKind.TagsEnter) {
		const count = field.tagValues?.length ?? 0;
		return count > 0 ? `标签 (${String(count)})` : "标签";
	}

	if (field.kind === PageFieldKind.RadioByLabel) {
		return `来源 → ${field.value}`;
	}

	if (field.kind === PageFieldKind.OriginalDeclareCheckbox) {
		return field.originalDeclareLabelHint ?? "原创声明";
	}

	if (field.kind === PageFieldKind.BilibiliCreativeStatement) {
		return bilibiliCreativeStatementMissingLabel(
			field.statementOption ?? field.value,
			field.statementAuth ?? "",
		);
	}

	return locatorToCssSelector(field.locator);
}

function applyRadioField(root: ParentNode, field: ApplyPageField): boolean {
	const groupSelectors = field.radioGroupSelectors;
	if (!groupSelectors?.length) return false;
	return clickRadioOptionByLabel(root, groupSelectors, field.value);
}

function notifyFieldApplied(
	progress: ApplyPageFieldsProgressContext | undefined,
	label: string,
): void {
	if (!progress) return;
	reportApplyProgress({
		platform: progress.platform,
		itemIndex: progress.itemIndex,
		kind: BatchProgressKind.Field,
		label,
	});
}

export async function applyPageFields(
	root: ParentNode,
	fields: readonly ApplyPageField[],
	progress?: ApplyPageFieldsProgressContext,
): Promise<string[]> {
	const missing: string[] = [];

	for (const field of fields) {
		if (field.kind === PageFieldKind.PartitionSelect) {
			if (!(await selectPartitionValue(root, field.value))) {
				missing.push(resolveFieldLabel(field));
			} else {
				notifyFieldApplied(progress, resolveFieldLabel(field));
			}
			continue;
		}

		if (field.kind === PageFieldKind.TagsEnter) {
			const tagValues = field.tagValues ?? [];
			const selectors = field.selectorFallbacks ?? [];
			const applied =
				selectors.length > 0 && (await applyTagsWithEnter(root, selectors, tagValues));
			if (!applied) {
				missing.push(resolveFieldLabel(field));
			} else {
				notifyFieldApplied(progress, resolveFieldLabel(field));
			}
			continue;
		}

		if (field.kind === PageFieldKind.RadioByLabel) {
			if (!applyRadioField(root, field)) {
				missing.push(resolveFieldLabel(field));
			} else {
				notifyFieldApplied(progress, resolveFieldLabel(field));
			}
			continue;
		}

		if (field.kind === PageFieldKind.OriginalDeclareCheckbox) {
			const applied = await applyChannelsOriginalDeclare(root);
			if (!applied) {
				missing.push(resolveFieldLabel(field));
			} else {
				notifyFieldApplied(progress, resolveFieldLabel(field));
			}
			continue;
		}

		if (field.kind === PageFieldKind.BilibiliCreativeStatement) {
			const statementOption = field.statementOption ?? field.value;
			const statementAuth = field.statementAuth;
			if (!statementAuth) {
				missing.push(resolveFieldLabel(field));
				continue;
			}

			const applied = await applyBilibiliCreativeStatement(root, statementOption, statementAuth);
			if (!applied) {
				missing.push(resolveFieldLabel(field));
			} else {
				notifyFieldApplied(progress, resolveFieldLabel(field));
			}
			continue;
		}

		const found = findFieldElement(root, field);
		if (!found) {
			missing.push(resolveFieldLabel(field));
			continue;
		}

		if (typeof found.scrollIntoView === "function") {
			found.scrollIntoView({ block: "center", inline: "nearest" });
		}

		applyValueToElement(found, field.value);
		notifyFieldApplied(progress, resolveFieldLabel(field));
	}

	return missing;
}
