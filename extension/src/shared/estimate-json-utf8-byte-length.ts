export function estimateJsonUtf8ByteLength(value: unknown): number {
	return new TextEncoder().encode(JSON.stringify(value)).length;
}
