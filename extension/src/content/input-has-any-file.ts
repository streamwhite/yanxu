export function inputHasAnyFile(input: HTMLInputElement): boolean {
	return (input.files?.length ?? 0) > 0;
}
