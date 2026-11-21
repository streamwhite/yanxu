import {
	clampFieldsSettleMs,
	DEFAULT_FIELDS_SETTLE_MS,
	MAX_FIELDS_SETTLE_MS,
	MIN_FIELDS_SETTLE_MS,
} from "../../extension/src/shared/fields-settle-config";

describe("fields settle config", () => {
	it("defaults the upload-to-fill delay to one second", () => {
		expect(DEFAULT_FIELDS_SETTLE_MS).toBe(1_000);
	});

	it("clamps settle ms to allowed range", () => {
		expect(clampFieldsSettleMs(-1)).toBe(MIN_FIELDS_SETTLE_MS);
		expect(clampFieldsSettleMs(999_999)).toBe(MAX_FIELDS_SETTLE_MS);
		expect(clampFieldsSettleMs(Number.NaN)).toBe(DEFAULT_FIELDS_SETTLE_MS);
		expect(clampFieldsSettleMs(2500)).toBe(2500);
	});
});
