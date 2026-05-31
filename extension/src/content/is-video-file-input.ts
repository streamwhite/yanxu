export function isVideoFileInput(input: HTMLInputElement): boolean {
	const accept = (input.accept ?? "").toLowerCase();
	if (accept.includes("image") && !accept.includes("video") && !accept.includes("mp4")) {
		return false;
	}
	if (accept.includes("video") || accept.includes("mp4")) return true;
	return accept.length === 0;
}
