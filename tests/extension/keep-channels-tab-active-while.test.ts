import { withChannelsTabKeptActive } from "../../extension/src/sw/keep-channels-tab-active-while";
import * as activateModule from "../../extension/src/sw/activate-tab-for-apply";

describe("withChannelsTabKeptActive", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.restoreAllMocks();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("re-focuses the tab on an interval until the operation completes", async () => {
		const reactivateSpy = jest
			.spyOn(activateModule, "reactivateTabForApply")
			.mockResolvedValue();

		const operation = jest.fn().mockImplementation(
			() =>
				new Promise<string>((resolve) => {
					setTimeout(() => resolve("done"), 4_500);
				}),
		);

		const resultPromise = withChannelsTabKeptActive(42, operation);

		await jest.advanceTimersByTimeAsync(2_000);
		await jest.advanceTimersByTimeAsync(2_000);
		await jest.advanceTimersByTimeAsync(500);

		await expect(resultPromise).resolves.toBe("done");
		expect(operation).toHaveBeenCalledTimes(1);
		expect(reactivateSpy).toHaveBeenCalledWith(42);
		expect(reactivateSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
	});
});
