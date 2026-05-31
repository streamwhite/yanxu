import { normalizeUiText } from "../../content/normalize-ui-text.js";

const PARTITION_LABEL_SEPARATOR_PATTERN = /[\s·•]/g;

function compactPartitionLabel(text: string): string {
	return normalizeUiText(text).replace(PARTITION_LABEL_SEPARATOR_PATTERN, "");
}

export function partitionLabelsMatch(optionLabel: string, targetValue: string): boolean {
	const option = normalizeUiText(optionLabel);
	const target = normalizeUiText(targetValue);
	if (option.length === 0 || target.length === 0) return false;
	if (option === target) return true;
	return compactPartitionLabel(option) === compactPartitionLabel(target);
}
