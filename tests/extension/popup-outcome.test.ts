import {
	buildOutcomeAlertClass,
	inferOutcomeVariant,
	PopupOutcomeVariant,
} from "../../extension/src/popup/popup-outcome.js";

describe("popup outcome", () => {
	it("builds bootstrap alert classes", () => {
		expect(buildOutcomeAlertClass(PopupOutcomeVariant.Success)).toContain("alert-success");
	});

	it("infers danger for failures", () => {
		expect(inferOutcomeVariant("Failed (x): y")).toBe(PopupOutcomeVariant.Danger);
	});
});
