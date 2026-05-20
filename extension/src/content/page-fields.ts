import { PageFieldKind } from "./page-field-apply.js";
import { locatorToCssSelector } from "./locator.js";
import { clickRadioOptionByLabel } from "./click-radio-by-label.js";
import { applyTagsWithEnter, tagsFieldMissingLabel } from "./apply-tags-with-enter.js";
import { partitionFieldMissingLabel, selectPartitionValue } from "./select-partition-value.js";
import { pickFirstElement, setContentEditableText, setFormControlValue } from "./dom.js";
import type { ApplyPageField } from "./page-field-apply.js";

function applyValueToElement(element: HTMLElement, value: string): void {
	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		setFormControlValue(element, value);
		return;
	}

	if (element.isContentEditable) {
		setContentEditableText(element, value);
	}
}

function findFieldElement(root: ParentNode, field: ApplyPageField): HTMLElement | null {
	if (field.selectorFallbacks?.length) {
		return pickFirstElement(root, field.selectorFallbacks);
	}

	const selector = locatorToCssSelector(field.locator);
	const found = root.querySelector(selector);
	return found instanceof HTMLElement ? found : null;
}

function missingFieldLabel(field: ApplyPageField): string {
	if (field.kind === PageFieldKind.PartitionSelect) {
		return partitionFieldMissingLabel(field.value);
	}

	if (field.kind === PageFieldKind.TagsEnter && field.selectorFallbacks?.length) {
		const count = field.tagValues?.length ?? 0;
		return tagsFieldMissingLabel(field.selectorFallbacks, count);
	}

	if (field.kind === PageFieldKind.RadioByLabel && field.radioGroupSelectors?.length) {
		return `${field.radioGroupSelectors.join(" | ")} → ${field.value}`;
	}

	if (field.selectorFallbacks?.length) {
		return field.selectorFallbacks.join(" | ");
	}

	return locatorToCssSelector(field.locator);
}

function applyRadioField(root: ParentNode, field: ApplyPageField): boolean {
	const groupSelectors = field.radioGroupSelectors;
	if (!groupSelectors?.length) return false;
	return clickRadioOptionByLabel(root, groupSelectors, field.value);
}

export function applyPageFields(root: ParentNode, fields: readonly ApplyPageField[]): string[] {
	const missing: string[] = [];

	for (const field of fields) {
		if (field.kind === PageFieldKind.PartitionSelect) {
			if (!selectPartitionValue(root, field.value)) {
				missing.push(missingFieldLabel(field));
			}
			continue;
		}

		if (field.kind === PageFieldKind.TagsEnter) {
			const tagValues = field.tagValues ?? [];
			const selectors = field.selectorFallbacks ?? [];
			if (!selectors.length || !applyTagsWithEnter(root, selectors, tagValues)) {
				missing.push(missingFieldLabel(field));
			}
			continue;
		}

		if (field.kind === PageFieldKind.RadioByLabel) {
			if (!applyRadioField(root, field)) {
				missing.push(missingFieldLabel(field));
			}
			continue;
		}

		const found = findFieldElement(root, field);
		if (!found) {
			missing.push(missingFieldLabel(field));
			continue;
		}

		applyValueToElement(found, field.value);
	}

	return missing;
}
