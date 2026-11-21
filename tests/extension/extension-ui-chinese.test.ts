import {
	allPlatformsSubmitBusyLabel,
	allPlatformsSubmitSuccessLabel,
} from "../../extension/src/popup/platform-submit-controls";
import {
	batchPlatformScopeOpeningLabel,
	batchPlatformScopeUploadFillButtonLabel,
} from "../../extension/src/popup/batch-platform-scope-ui";
import { resolveChannelsSubmitBatchConfig } from "../../extension/src/shared/channels-submit-batch-config";

const CJK_UNIFIED_IDEOGRAPHS = /[\u4e00-\u9fff]/;

describe("popup user-facing text is Chinese", () => {
	const channelsBatch = resolveChannelsSubmitBatchConfig({
		batchSize: 4,
		batchIntervalSeconds: 3,
	});

	it("localizes the submit labels", () => {
		expect(allPlatformsSubmitBusyLabel(channelsBatch)).toMatch(CJK_UNIFIED_IDEOGRAPHS);
		expect(allPlatformsSubmitSuccessLabel(channelsBatch)).toMatch(CJK_UNIFIED_IDEOGRAPHS);
	});

	it("localizes the scope labels", () => {
		expect(batchPlatformScopeOpeningLabel("all")).toMatch(CJK_UNIFIED_IDEOGRAPHS);
		expect(batchPlatformScopeUploadFillButtonLabel("bilibili")).toMatch(CJK_UNIFIED_IDEOGRAPHS);
	});
});
