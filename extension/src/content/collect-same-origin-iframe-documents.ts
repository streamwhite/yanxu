function iframeElementsIn(root: ParentNode): HTMLIFrameElement[] {
	if (root instanceof Document) {
		return Array.from(root.querySelectorAll("iframe"));
	}
	if (root instanceof Element) {
		return Array.from(root.querySelectorAll("iframe"));
	}
	return [];
}

function tryReadIframeDocument(iframe: HTMLIFrameElement): Document | null {
	try {
		return iframe.contentDocument;
	} catch {
		return null;
	}
}

export function collectSameOriginIframeDocuments(root: ParentNode): Document[] {
	const documents: Document[] = [];
	const queue = iframeElementsIn(root);

	for (const iframe of queue) {
		const doc = tryReadIframeDocument(iframe);
		if (!doc) continue;
		documents.push(doc);
		queue.push(...iframeElementsIn(doc));
	}

	return documents;
}
