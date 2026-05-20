import { sanitizeBase64ForAtob } from "./sanitize-base64.js";

export function decodeBase64ToUint8(b64: string): Uint8Array {
	const normalized = sanitizeBase64ForAtob(b64);
	const binary = globalThis.atob(normalized);
	const out = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index++) {
		out[index] = binary.charCodeAt(index);
	}
	return out;
}

export function concatUint8Arrays(parts: readonly Uint8Array[]): Uint8Array {
	const total = parts.reduce((acc, part) => acc + part.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const part of parts) {
		out.set(part, offset);
		offset += part.length;
	}
	return out;
}

export function decodeBase64ChunksToUint8(chunks: readonly string[]): Uint8Array {
	const parts = chunks.map((chunk) => decodeBase64ToUint8(chunk));
	return concatUint8Arrays(parts);
}
