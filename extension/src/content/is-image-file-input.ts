export function isImageFileInput(input: HTMLInputElement): boolean {
	const accept = (input.accept ?? "").toLowerCase();
	if (accept.includes("video") || accept.includes("mp4")) return false;
	if (
		accept.includes("image") ||
		accept.includes("png") ||
		accept.includes("jpeg") ||
		accept.includes("jpg")
	) {
		return true;
	}

	return accept.length === 0;
}
