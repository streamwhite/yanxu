export function assignFileViaDragDrop(target: HTMLElement, file: File): void {
	if (typeof DataTransfer === "undefined") return;

	const dataTransfer = new DataTransfer();
	dataTransfer.items.add(file);

	const eventInit: DragEventInit = {
		bubbles: true,
		cancelable: true,
		dataTransfer,
	};

	target.dispatchEvent(new DragEvent("dragenter", eventInit));
	target.dispatchEvent(new DragEvent("dragover", eventInit));
	target.dispatchEvent(new DragEvent("drop", eventInit));
}
