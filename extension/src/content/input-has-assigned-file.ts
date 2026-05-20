export function inputHasAssignedFile(input: HTMLInputElement, expected: File): boolean {
	const files = input.files;
	if (!files || files.length === 0) return false;

	const assigned = files.item(0);
	if (!assigned) return false;

	return assigned.name === expected.name && assigned.size === expected.size;
}
