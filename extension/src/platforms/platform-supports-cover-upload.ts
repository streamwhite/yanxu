import { PLATFORM_IDS, type PlatformId } from "@yanxu/domain";

const COVER_UPLOAD_PLATFORMS: ReadonlySet<PlatformId> = new Set(PLATFORM_IDS);

export function platformSupportsCoverUpload(platform: PlatformId): boolean {
	return COVER_UPLOAD_PLATFORMS.has(platform);
}
