import {
	RUNTIME_REQUEST_TIMEOUT_BATCH_MS,
	RUNTIME_REQUEST_TIMEOUT_OPEN_TABS_MS,
	resolveRuntimeRequestTimeoutMs,
} from "../../extension/src/shared/constants/runtime-request-timing";

describe("resolveRuntimeRequestTimeoutMs", () => {
	it("uses a long timeout for batch upload and fill actions", () => {
		expect(
			resolveRuntimeRequestTimeoutMs({
				type: "runtime.uploadAndFillAllTabs",
				requestId: "r1",
				jobFilePath: "/tmp/job.json",
			}),
		).toBe(RUNTIME_REQUEST_TIMEOUT_BATCH_MS);
	});

	it("uses a short timeout for open-tabs actions", () => {
		expect(
			resolveRuntimeRequestTimeoutMs({
				type: "runtime.openPlatformTabs",
				requestId: "r2",
				jobFilePath: "/tmp/job.json",
				platform: "bilibili",
			}),
		).toBe(RUNTIME_REQUEST_TIMEOUT_OPEN_TABS_MS);

		expect(
			resolveRuntimeRequestTimeoutMs({
				type: "runtime.openAllPlatformTabs",
				requestId: "r3",
				jobFilePath: "/tmp/job.json",
			}),
		).toBe(RUNTIME_REQUEST_TIMEOUT_OPEN_TABS_MS);
	});
});
