import {
	allPlatformsSubmitBusyLabel,
	allPlatformsSubmitSuccessLabel,
} from "../../extension/src/popup/platform-submit-controls";
import {
	batchPlatformScopeOpenTabsHelp,
	batchPlatformScopeUploadFillHelp,
} from "../../extension/src/popup/batch-platform-scope-ui";
import { resolveChannelsSubmitBatchConfig } from "../../extension/src/shared/channels-submit-batch-config";

const CJK_UNIFIED_IDEOGRAPHS = /[\u4e00-\u9fff]/;

describe("popup user-facing text is Chinese", () => {
	const channelsBatch = resolveChannelsSubmitBatchConfig({
		batchSize: 5,
		batchIntervalMin: 5,
	});

	it("localizes the submit labels", () => {
		expect(allPlatformsSubmitBusyLabel(channelsBatch)).toMatch(CJK_UNIFIED_IDEOGRAPHS);
		expect(allPlatformsSubmitSuccessLabel(channelsBatch)).toMatch(CJK_UNIFIED_IDEOGRAPHS);
	});

	it("localizes the scope help text", () => {
		expect(batchPlatformScopeOpenTabsHelp("all")).toMatch(CJK_UNIFIED_IDEOGRAPHS);
		expect(batchPlatformScopeUploadFillHelp("all")).toMatch(CJK_UNIFIED_IDEOGRAPHS);
	});
});
