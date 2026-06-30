import { Platform, type JobFileOutlinePayload } from "@auto-upload/domain";

export type ChannelsOutlineItem = {
	itemIndex: number;
	name: string;
};

export function listChannelsOutlineItems(outline: JobFileOutlinePayload): ChannelsOutlineItem[] {
	return outline.items
		.filter((item) => item.targets.includes(Platform.Channels))
		.map((item) => ({
			itemIndex: item.itemIndex,
			name: item.name ?? `Item ${String(item.itemIndex + 1)}`,
		}));
}
