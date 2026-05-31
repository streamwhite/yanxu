import { selectBilibiliCreativeStatementValue } from "../platforms/bilibili/select-bilibili-creative-statement-value.js";

export async function applyBilibiliCreativeStatement(
	root: ParentNode,
	statementOption: string,
	statementAuth: string,
): Promise<boolean> {
	return selectBilibiliCreativeStatementValue(root, statementOption, statementAuth);
}

export function bilibiliCreativeStatementMissingLabel(
	statementOption: string,
	statementAuth: string,
): string {
	return `创作声明 → ${statementOption} + ${statementAuth}`;
}
