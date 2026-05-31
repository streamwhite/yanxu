let activeBatchRequestId: string | null = null;

export function setActiveBatchRequestId(requestId: string): void {
	activeBatchRequestId = requestId;
}

export function clearActiveBatchRequestId(requestId: string): void {
	if (activeBatchRequestId === requestId) activeBatchRequestId = null;
}

export function getActiveBatchRequestId(): string | null {
	return activeBatchRequestId;
}
