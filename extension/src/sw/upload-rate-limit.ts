import { PLATFORM_IDS, type PlatformId } from "@yanxu/domain";

export const UPLOAD_DAILY_WINDOW_MS = 24 * 60 * 60 * 1_000;
export const UPLOAD_DAILY_LIMIT = 30 as const;

export const UPLOAD_RATE_LIMIT_STORAGE_KEY = "yanxuUploadRateLimit" as const;

export type UploadRateLimitState = {
	platformUploadTimes?: Partial<Record<PlatformId, number[]>>;
};

export type UploadRateLimitDecision =
	| { kind: "allowed"; state: UploadRateLimitState }
	| { kind: "blocked"; retryAt: number };

export type UploadPermitResult = { allowed: true } | { allowed: false; retryAt: number };

let reservationQueue: Promise<unknown> = Promise.resolve();

function recentUploadTimes(times: readonly number[], now: number): number[] {
	return times
		.filter((timestamp) => Number.isFinite(timestamp) && timestamp > now - UPLOAD_DAILY_WINDOW_MS)
		.sort((a, b) => a - b);
}

export function evaluateUploadRateLimit(
	state: UploadRateLimitState,
	platform: PlatformId,
	now: number,
): UploadRateLimitDecision {
	const platformTimes = recentUploadTimes(state.platformUploadTimes?.[platform] ?? [], now);
	if (platformTimes.length >= UPLOAD_DAILY_LIMIT) {
		return {
			kind: "blocked",
			retryAt: (platformTimes[0] ?? now) + UPLOAD_DAILY_WINDOW_MS,
		};
	}

	return {
		kind: "allowed",
		state: {
			...state,
			platformUploadTimes: {
				...state.platformUploadTimes,
				[platform]: [...platformTimes, now],
			},
		},
	};
}

function parsePlatformUploadTimes(value: unknown): Partial<Record<PlatformId, number[]>> {
	if (!value || typeof value !== "object") return {};
	const raw = value as Partial<Record<PlatformId, unknown>>;
	const parsed: Partial<Record<PlatformId, number[]>> = {};
	for (const platform of PLATFORM_IDS) {
		const times = raw[platform];
		if (!Array.isArray(times)) continue;
		parsed[platform] = times.filter(
			(timestamp): timestamp is number => typeof timestamp === "number" && Number.isFinite(timestamp),
		);
	}
	return parsed;
}

function parseUploadRateLimitState(value: unknown): UploadRateLimitState {
	if (!value || typeof value !== "object") return {};
	return { platformUploadTimes: parsePlatformUploadTimes((value as UploadRateLimitState).platformUploadTimes) };
}

function withReservationLock<T>(run: () => Promise<T>): Promise<T> {
	const current = reservationQueue.then(run, run);
	reservationQueue = current.then(
		() => undefined,
		() => undefined,
	);
	return current;
}

export function acquireVideoUploadPermit(platform: PlatformId): Promise<UploadPermitResult> {
	return withReservationLock(async () => {
		const stored = await chrome.storage.local.get(UPLOAD_RATE_LIMIT_STORAGE_KEY);
		const state = parseUploadRateLimitState(stored[UPLOAD_RATE_LIMIT_STORAGE_KEY]);
		const decision = evaluateUploadRateLimit(state, platform, Date.now());

		if (decision.kind === "blocked") return { allowed: false, retryAt: decision.retryAt };

		await chrome.storage.local.set({ [UPLOAD_RATE_LIMIT_STORAGE_KEY]: decision.state });
		return { allowed: true };
	});
}
