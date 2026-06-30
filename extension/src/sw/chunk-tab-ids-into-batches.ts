export function chunkTabIdsIntoBatches<T>(items: readonly T[], batchSize: number): T[][] {
	if (batchSize <= 0) {
		throw new Error("batch_size_must_be_positive");
	}

	const batches: T[][] = [];
	for (let index = 0; index < items.length; index += batchSize) {
		batches.push(items.slice(index, index + batchSize));
	}
	return batches;
}
