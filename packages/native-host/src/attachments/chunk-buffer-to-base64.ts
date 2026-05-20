export function chunkBufferToBase64(buffer: Buffer, chunkBytes: number): string[] {
	if (chunkBytes <= 0) throw new Error("chunk_bytes_must_be_positive");
	const chunks: string[] = [];
	for (let offset = 0; offset < buffer.length; offset += chunkBytes) {
		chunks.push(buffer.subarray(offset, offset + chunkBytes).toString("base64"));
	}
	return chunks;
}
