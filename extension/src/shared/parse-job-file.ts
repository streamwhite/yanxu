import { BilibiliSourceType, type PlatformId } from "@yanxu/domain";
import { readSheet } from "read-excel-file/universal";

export const JOB_ASSETS_PARENT_FOLDER = "/yanxu-selected-assets" as const;

const CSV_EXTENSION = ".csv" as const;
const XLSX_EXTENSION = ".xlsx" as const;
const DEFAULT_JOB_VERSION = 3 as const;
const BOM = "\uFEFF" as const;

const HEADER_ALIASES = {
	name: ["name", "名称", "标题"],
	description: ["description", "描述", "简介"],
	tags: ["tags", "标签"],
	targets: ["targets", "目标平台", "平台"],
	includeCover: ["includecover", "include_cover", "需要封面", "封面"],
	sourceType: ["sourcetype", "source_type", "来源", "来源类型"],
	partition: ["partition", "b站分区", "B站分区"],
	creativeStatement: ["creativestatement", "creative_statement", "创作声明"],
	creativeStatementAuth: ["creativestatementauth", "creative_statement_auth", "创作声明授权"],
	markTag: ["marktag", "mark_tag", "视频号标注", "标注"],
} as const;

type SpreadsheetJobItem = {
	name: string;
	description?: string;
	tags?: string[];
	targets?: PlatformId[];
	includeCover?: boolean;
	sourceType?: BilibiliSourceType;
	partition?: string;
	creativeStatement?: string;
	creativeStatementAuth?: string;
	markTag?: string;
};

type SpreadsheetHeaderKey = keyof typeof HEADER_ALIASES;

const CHINESE_JSON_ITEMS_KEY = "任务列表" as const;
const CHINESE_JSON_ITEM_FIELDS: Readonly<Record<SpreadsheetHeaderKey, string>> = {
	name: "名称",
	description: "描述",
	tags: "标签",
	targets: "目标平台",
	includeCover: "需要封面",
	sourceType: "来源",
	partition: "B站分区",
	creativeStatement: "创作声明",
	creativeStatementAuth: "创作声明授权",
	markTag: "视频号标注",
};

const PLATFORM_ALIASES: Readonly<Record<string, PlatformId>> = {
	bilibili: "bilibili",
	b站: "bilibili",
	哔哩哔哩: "bilibili",
	douyin: "douyin",
	抖音: "douyin",
	channels: "channels",
	视频号: "channels",
	微信视频号: "channels",
} as const;

const TRUE_VALUES = new Set(["1", "true", "yes", "y", "是", "需要"]);
const FALSE_VALUES = new Set(["0", "false", "no", "n", "否", "不需要"]);

const SOURCE_TYPE_ALIASES: Readonly<Record<string, BilibiliSourceType>> = {
	original: BilibiliSourceType.Original,
	原创: BilibiliSourceType.Original,
	自制: BilibiliSourceType.Original,
	repost: BilibiliSourceType.Repost,
	转载: BilibiliSourceType.Repost,
};

function isXlsxFileName(fileName: string): boolean {
	return fileName.toLowerCase().endsWith(XLSX_EXTENSION);
}

function rejectCsvFile(fileName: string): void {
	if (fileName.toLowerCase().endsWith(CSV_EXTENSION)) {
		throw new Error(`不支持的任务文件格式：${CSV_EXTENSION}`);
	}
}

function cellToString(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return String(value).trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildHeaderIndex(headerCells: string[]): Map<SpreadsheetHeaderKey, number> {
	const normalized = headerCells.map((cell) => cell.trim().toLowerCase());
	const indexByKey = new Map<SpreadsheetHeaderKey, number>();
	for (const key of Object.keys(HEADER_ALIASES) as SpreadsheetHeaderKey[]) {
		const aliases = HEADER_ALIASES[key];
		const index = normalized.findIndex((cell) => (aliases as readonly string[]).includes(cell));
		if (index >= 0) indexByKey.set(key, index);
	}
	return indexByKey;
}

function readCell(
	cells: string[],
	headerIndex: Map<SpreadsheetHeaderKey, number>,
	key: SpreadsheetHeaderKey,
): string {
	const index = headerIndex.get(key);
	return index === undefined ? "" : (cells[index] ?? "").trim();
}

function splitList(value: string): string[] {
	return value
		.split(/[|;、]/)
		.map((part) => part.trim())
		.filter((part) => part.length > 0);
}

function parseTargets(
	value: string,
	rowNumber: number,
	sourceLabel: string,
): PlatformId[] | undefined {
	const parts = splitList(value);
	if (parts.length === 0) return undefined;
	return parts.map((part) => {
		const platform = PLATFORM_ALIASES[part.toLowerCase()];
		if (!platform) {
			throw new Error(`${sourceLabel} 第 ${String(rowNumber)} 行的目标平台无效：${part}`);
		}
		return platform;
	});
}

function parseIncludeCover(
	value: string,
	rowNumber: number,
	sourceLabel: string,
): boolean | undefined {
	if (value.length === 0) return undefined;
	const normalized = value.toLowerCase();
	if (TRUE_VALUES.has(normalized)) return true;
	if (FALSE_VALUES.has(normalized)) return false;
	throw new Error(`${sourceLabel} 第 ${String(rowNumber)} 行的封面值无效：${value}`);
}

function parseSourceType(
	value: string,
	rowNumber: number,
	sourceLabel: string,
): BilibiliSourceType | undefined {
	if (value.length === 0) return undefined;
	const sourceType = SOURCE_TYPE_ALIASES[value.toLowerCase()];
	if (!sourceType) {
		throw new Error(`${sourceLabel} 第 ${String(rowNumber)} 行的来源无效：${value}`);
	}
	return sourceType;
}

function buildItem(
	cells: string[],
	headerIndex: Map<SpreadsheetHeaderKey, number>,
	rowNumber: number,
	sourceLabel: string,
): SpreadsheetJobItem {
	const name = readCell(cells, headerIndex, "name");
	if (!name) throw new Error(`${sourceLabel} 第 ${String(rowNumber)} 行缺少名称`);

	const description = readCell(cells, headerIndex, "description");
	const tags = splitList(readCell(cells, headerIndex, "tags"));
	const targets = parseTargets(readCell(cells, headerIndex, "targets"), rowNumber, sourceLabel);
	const includeCover = parseIncludeCover(
		readCell(cells, headerIndex, "includeCover"),
		rowNumber,
		sourceLabel,
	);
	const sourceType = parseSourceType(
		readCell(cells, headerIndex, "sourceType"),
		rowNumber,
		sourceLabel,
	);
	const partition = readCell(cells, headerIndex, "partition");
	const creativeStatement = readCell(cells, headerIndex, "creativeStatement");
	const creativeStatementAuth = readCell(cells, headerIndex, "creativeStatementAuth");
	const markTag = readCell(cells, headerIndex, "markTag");

	return {
		name,
		...(description ? { description } : {}),
		...(tags.length > 0 ? { tags } : {}),
		...(targets ? { targets } : {}),
		...(includeCover === undefined ? {} : { includeCover }),
		...(sourceType ? { sourceType } : {}),
		...(partition ? { partition } : {}),
		...(creativeStatement ? { creativeStatement } : {}),
		...(creativeStatementAuth ? { creativeStatementAuth } : {}),
		...(markTag ? { markTag } : {}),
	};
}

function buildJobFromRows(rows: string[][], sourceLabel: string): unknown {
	if (rows.length < 2) throw new Error(`${sourceLabel} 至少需要表头和一行任务`);

	const headerIndex = buildHeaderIndex(rows[0]);
	if (!headerIndex.has("name")) {
		throw new Error(`${sourceLabel} 缺少名称列（name / 名称）`);
	}

	const items = rows
		.slice(1)
		.map((cells, index) => buildItem(cells, headerIndex, index + 2, sourceLabel));
	const seenNames = new Set<string>();
	for (const item of items) {
		if (seenNames.has(item.name)) {
			throw new Error(`${sourceLabel} 名称重复：${item.name}`);
		}
		seenNames.add(item.name);
	}

	return {
		jobVersion: DEFAULT_JOB_VERSION,
		assetsParentFolder: JOB_ASSETS_PARENT_FOLDER,
		items,
	};
}

function normalizeJsonItem(value: unknown): unknown {
	if (!isRecord(value)) return value;
	const item = { ...value };
	for (const [field, chineseField] of Object.entries(CHINESE_JSON_ITEM_FIELDS)) {
		if (!(field in item) && chineseField in item) item[field] = item[chineseField];
		delete item[chineseField];
	}
	if (Array.isArray(item.targets)) {
		item.targets = item.targets.map((target) =>
			typeof target === "string"
				? (PLATFORM_ALIASES[target.toLowerCase()] ?? target)
				: target,
		);
	}
	if (typeof item.sourceType === "string") {
		item.sourceType = SOURCE_TYPE_ALIASES[item.sourceType.toLowerCase()] ?? item.sourceType;
	}
	return item;
}

function normalizeJsonJob(value: unknown): unknown {
	if (!isRecord(value) || !Array.isArray(value[CHINESE_JSON_ITEMS_KEY])) return value;
	const job = { ...value };
	const items = job[CHINESE_JSON_ITEMS_KEY] as unknown[];
	delete job[CHINESE_JSON_ITEMS_KEY];
	return {
		...job,
		jobVersion: job.jobVersion ?? DEFAULT_JOB_VERSION,
		assetsParentFolder: job.assetsParentFolder ?? JOB_ASSETS_PARENT_FOLDER,
		items: items.map(normalizeJsonItem),
	};
}

async function parseXlsxJob(file: File): Promise<unknown> {
	const rows = await readSheet(file);
	const normalized = rows
		.map((row) => row.map(cellToString))
		.filter((row) => row.some((cell) => cell.length > 0));
	normalized[0] = normalized[0]?.map((cell) => cell.replace(BOM, "")) ?? [];
	return buildJobFromRows(normalized, "Excel");
}

export async function parseJobFile(file: File): Promise<unknown> {
	rejectCsvFile(file.name);
	if (isXlsxFileName(file.name)) return parseXlsxJob(file);
	return normalizeJsonJob(JSON.parse(await file.text()) as unknown);
}

export function parseJobFileText(fileName: string, text: string): unknown {
	rejectCsvFile(fileName);
	return normalizeJsonJob(JSON.parse(text) as unknown);
}
