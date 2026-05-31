export const PopupOutcomeVariant = {
	Info: "info",
	Success: "success",
	Danger: "danger",
	Secondary: "secondary",
} as const;

export type PopupOutcomeVariant = (typeof PopupOutcomeVariant)[keyof typeof PopupOutcomeVariant];

const ALERT_BASE_CLASS = "alert small mb-0 mt-3" as const;

const ALERT_VARIANT_CLASS: Record<PopupOutcomeVariant, string> = {
	[PopupOutcomeVariant.Info]: "alert-info",
	[PopupOutcomeVariant.Success]: "alert-success",
	[PopupOutcomeVariant.Danger]: "alert-danger",
	[PopupOutcomeVariant.Secondary]: "alert-secondary",
};

export function buildOutcomeAlertClass(variant: PopupOutcomeVariant): string {
	return `${ALERT_BASE_CLASS} ${ALERT_VARIANT_CLASS[variant]}`;
}

export function inferOutcomeVariant(message: string): PopupOutcomeVariant {
	if (message.startsWith("Failed")) return PopupOutcomeVariant.Danger;
	if (
		message.includes("filled") ||
		message.includes("attached") ||
		message.includes("Opened") ||
		message.includes("finished")
	) {
		return PopupOutcomeVariant.Success;
	}
	if (message.startsWith("Please enter")) return PopupOutcomeVariant.Secondary;
	return PopupOutcomeVariant.Info;
}
