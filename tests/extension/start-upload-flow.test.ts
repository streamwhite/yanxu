import { startUploadFlow } from "../../extension/src/popup/start-upload-flow";

describe("startUploadFlow", () => {
	it("opens the tab set before applying video and fields", async () => {
		const calls: string[] = [];
		const outcome = await startUploadFlow(
			async () => {
				calls.push("openTabs");
				return { ok: true };
			},
			async () => {
				calls.push("apply");
				return { ok: true };
			},
		);

		expect(outcome).toEqual({ stage: "apply", result: { ok: true } });
		expect(calls).toEqual(["openTabs", "apply"]);
	});

	it("skips upload and fill when opening tabs fails", async () => {
		const apply = jest.fn(async () => ({ ok: true as const }));
		const failure = { ok: false as const, code: "insufficient_tabs", message: "short" };

		expect(await startUploadFlow(async () => failure, apply)).toEqual({
			stage: "openTabs",
			result: failure,
		});
		expect(apply).not.toHaveBeenCalled();
	});
});
