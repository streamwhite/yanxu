export const BatchAssetKind = {
	Video: "video",
	Cover: "cover",
} as const;

export type BatchAssetKind = (typeof BatchAssetKind)[keyof typeof BatchAssetKind];
