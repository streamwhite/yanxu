export const BatchAssetKind = {
	Video: "video",
	Cover: "cover",
	HorizontalCover: "horizontalCover",
} as const;


export type BatchAssetKind = (typeof BatchAssetKind)[keyof typeof BatchAssetKind];
