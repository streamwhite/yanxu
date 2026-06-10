import type { ZodError } from "zod";

function formatIssuePath(path: readonly (string | number)[]): string {
	return path.length > 0 ? path.join(".") : "(root)";
}

export function formatZodValidationError(error: ZodError): string {
	return error.issues
		.map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`)
		.join("; ");
}
