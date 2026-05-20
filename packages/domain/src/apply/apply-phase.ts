export const ApplyPhase = {
	Full: "full",
	VideoOnly: "videoOnly",
	FieldsOnly: "fieldsOnly",
} as const;

export type ApplyPhase = (typeof ApplyPhase)[keyof typeof ApplyPhase];
