import { collectSameOriginIframeDocuments } from "./collect-same-origin-iframe-documents.js";

function childRoots(node: ParentNode): Element[] {
	if (node instanceof Document) {
		return node.body ? [node.body] : [];
	}
	if (node instanceof DocumentFragment) {
		return Array.from(node.children).filter((child): child is Element => child instanceof Element);
	}
	if (node instanceof Element) {
		return Array.from(node.children).filter((child): child is Element => child instanceof Element);
	}
	return [];
}

function visitForSelector(root: ParentNode, selector: string, matches: HTMLElement[]): void {
	if (root instanceof Element || root instanceof Document || root instanceof DocumentFragment) {
		for (const match of Array.from(root.querySelectorAll(selector))) {
			if (match instanceof HTMLElement) matches.push(match);
		}
	}

	for (const child of childRoots(root)) {
		if (child.shadowRoot) visitForSelector(child.shadowRoot, selector, matches);
		visitForSelector(child, selector, matches);
	}
}

export function queryAllDeep(root: ParentNode, selector: string): HTMLElement[] {
	const matches: HTMLElement[] = [];
	visitForSelector(root, selector, matches);

	for (const iframeDocument of collectSameOriginIframeDocuments(root)) {
		visitForSelector(iframeDocument, selector, matches);
	}

	return matches;
}
