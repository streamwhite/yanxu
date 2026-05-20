export function clickCoverUploadArea(uploadArea: HTMLElement): void {
	const uploadText = uploadArea.querySelector(".upload-text");
	if (uploadText instanceof HTMLElement) {
		uploadText.click();
		return;
	}

	const mainText = uploadArea.querySelector(".main-text");
	if (mainText instanceof HTMLElement) {
		mainText.click();
		return;
	}

	uploadArea.click();
}
