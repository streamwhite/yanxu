import { Platform, type PlatformId } from "@yanxu/domain";
import {
	BILIBILI_FULL_PHASE_VIDEO_TO_FIELDS_SETTLE_MS,
	CHANNELS_FULL_PHASE_VIDEO_TO_FIELDS_SETTLE_MS,
} from "./constants/platform-video-upload-timing.js";

const FULL_PHASE_VIDEO_TO_FIELDS_SETTLE_MS: Partial<Record<PlatformId, number>> = {
	[Platform.Bilibili]: BILIBILI_FULL_PHASE_VIDEO_TO_FIELDS_SETTLE_MS,
	[Platform.Channels]: CHANNELS_FULL_PHASE_VIDEO_TO_FIELDS_SETTLE_MS,
};

export function platformFullPhaseVideoToFieldsSettleMs(platform: PlatformId): number {
	return FULL_PHASE_VIDEO_TO_FIELDS_SETTLE_MS[platform] ?? 0;
}
