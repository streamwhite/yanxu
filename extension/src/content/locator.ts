import type { FieldLocator } from "@auto-upload/domain";

export function locatorToCssSelector(locator: FieldLocator): string {
	if (locator.css) return locator.css;
	if (locator.id) return `#${locator.id}`;
	if (locator.name) return `[name="${locator.name.replaceAll('"', String.raw`\"`)}"]`;
	throw new Error("locator_requires_css_id_or_name");
}
