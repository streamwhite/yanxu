import {
	HostOutboundMessageSchema,
	type HostInboundMessage,
	type HostOutboundMessage,
} from "@yanxu/domain";
import { loadBrowserFileSource, queryReadPermission } from "../shared/browser-file-source.js";
import { handleBrowserHostInboundMessage } from "./browser-host.js";
import type { NativeSessionResult } from "./post-native-message-session.js";

export async function postBrowserHostSession(
	message: HostInboundMessage,
): Promise<NativeSessionResult> {
	try {
		const source = await loadBrowserFileSource();
		if (!source) {
			return {
				ok: false,
				code: "browser_source_missing",
				message: "请先在设置页选择任务文件和素材目录。",
			};
		}

		const [jobPermission, assetsPermission] = await Promise.all([
			queryReadPermission(source.jobFile),
			queryReadPermission(source.assetsDir),
		]);
		if (jobPermission !== "granted" || assetsPermission !== "granted") {
			return {
				ok: false,
				code: "browser_source_permission_required",
				message: "请在设置页重新授权文件访问。",
			};
		}

		const batch = await handleBrowserHostInboundMessage(message, source);
		const messages: HostOutboundMessage[] = [];
		for (const item of batch) {
			const parsed = HostOutboundMessageSchema.safeParse(item);
			if (!parsed.success) {
				return {
					ok: false,
					code: "invalid_browser_response",
					message: parsed.error.message,
				};
			}
			messages.push(parsed.data);
		}
		return { ok: true, batch: messages };
	} catch (error: unknown) {
		return {
			ok: false,
			code: "browser_source_error",
			message: error instanceof Error ? error.message : "browser_source_error",
		};
	}
}
