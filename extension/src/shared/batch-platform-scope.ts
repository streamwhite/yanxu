import { Platform, PLATFORM_IDS, type PlatformId } from "@auto-upload/domain";

export const STORAGE_KEY_CHANNELS_ONLY = "semiAutoChannelsOnly" as const;

export function resolveBatchPlatformIds(channelsOnly: boolean): readonly PlatformId[] {
	return channelsOnly ? [Platform.Channels] : PLATFORM_IDS;
}
