import { computeRandomStaggerMs } from "../../extension/src/sw/compute-random-stagger-ms";

describe("computeRandomStaggerMs", () => {
	it("returns min when random is 0", () => {
		expect(computeRandomStaggerMs(1000, 3000, () => 0)).toBe(1000);
	});

	it("returns max when random approaches 1", () => {
		expect(computeRandomStaggerMs(1000, 3000, () => 0.999999)).toBe(3000);
	});
});
