import { BilibiliSourceType, type PlatformId } from "@yanxu/domain";

export const CSV_ASSETS_PARENT_FOLDER = "/yanxu-selected-assets" as const;

const CSV_EXTENSION = ".csv" as const;
const DEFAULT_JOB_VERSION = 3 as const;
const BOM = "\uFEFF" as const;

const HEADER_ALIASES = {
	name: ["name", "名称", "标题"],
	description: ["description", "描述", "简介"],
	tags: ["tags", "标签"],
	targets: ["targets", "目标平台", "平台"],
	includeCover: ["includecover", "include_cover", "需要封面", "封面"],
	sourceType: ["sourcetype", "source_type", "来源", "来源类型"],
	partition: ["partition", "分区"],
	creativeStatement: ["creativestatement", "creative_statement", "创作声明"],
	creativeStatementAuth: ["creativestatementauth", "creative_statement_auth", "创作声明授权"],
	markTag: ["marktag", "mark_tag", "视频号标注", "标注"],
} as const;

type CsvJobItem = {
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

type CsvHeaderKey = keyof typeof HEADER_ALIASES;

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

function isCsvFileName(fileName: string): boolean {
	return fileName.toLowerCase().endsWith(CSV_EXTENSION);
}

function parseCsvRows(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;

	for (let index = 0; index < text.length; index += 1) {
		const character = text[index];
		if (inQuotes) {
			if (character === '"') {
				if (text[index + 1] === '"') {
					field += '"';
					index += 1;
				} else {
					inQuotes = false;
				}
			} else {
				field += character;
			}
			continue;
		}

		if (character === '"') {
			inQuotes = true;
		} else if (character === ",") {
			row.push(field);
			field = "";
		} else if (character === "\n") {
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else if (character !== "\r") {
			field += character;
		}
	}

	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	rows[0] = rows[0].map((cell) => cell.replace(BOM, ""));
	return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));
}

function buildHeaderIndex(headerCells: string[]): Map<CsvHeaderKey, number> {
	const normalized = headerCells.map((cell) => cell.trim().toLowerCase());
	const indexByKey = new Map<CsvHeaderKey, number>();
	for (const key of Object.keys(HEADER_ALIASES) as CsvHeaderKey[]) {
		const aliases = HEADER_ALIASES[key];
		const index = normalized.findIndex((cell) => (aliases as readonly string[]).includes(cell));
		if (index >= 0) indexByKey.set(key, index);
	}
	return indexByKey;
}

function readCell(
	cells: string[],
	headerIndex: Map<CsvHeaderKey, number>,
	key: CsvHeaderKey,
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

function parseTargets(value: string, rowNumber: number): PlatformId[] | undefined {
	const parts = splitList(value);
	if (parts.length === 0) return undefined;
	return parts.map((part) => {
		const platform = PLATFORM_ALIASES[part.toLowerCase()];
		if (!platform) throw new Error(`CSV 第 ${String(rowNumber)} 行的目标平台无效：${part}`);
		return platform;
	});
}

function parseIncludeCover(value: string, rowNumber: number): boolean | undefined {
	if (value.length === 0) return undefined;
	const normalized = value.toLowerCase();
	if (TRUE_VALUES.has(normalized)) return true;
	if (FALSE_VALUES.has(normalized)) return false;
	throw new Error(`CSV 第 ${String(rowNumber)} 行的封面值无效：${value}`);
}

function parseSourceType(value: string, rowNumber: number): BilibiliSourceType | undefined {
	if (value.length === 0) return undefined;
	const sourceType = SOURCE_TYPE_ALIASES[value.toLowerCase()];
	if (!sourceType) throw new Error(`CSV 第 ${String(rowNumber)} 行的来源无效：${value}`);
	return sourceType;
}

function buildItem(
	cells: string[],
	headerIndex: Map<CsvHeaderKey, number>,
	rowNumber: number,
): CsvJobItem {
	const name = readCell(cells, headerIndex, "name");
	if (!name) throw new Error(`CSV 第 ${String(rowNumber)} 行缺少名称`);

	const description = readCell(cells, headerIndex, "description");
	const tags = splitList(readCell(cells, headerIndex, "tags"));
	const targets = parseTargets(readCell(cells, headerIndex, "targets"), rowNumber);
	const includeCover = parseIncludeCover(readCell(cells, headerIndex, "includeCover"), rowNumber);
	const sourceType = parseSourceType(readCell(cells, headerIndex, "sourceType"), rowNumber);
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

export function parseCsvJob(text: string): unknown {
	const rows = parseCsvRows(text);
	if (rows.length < 2) throw new Error("CSV 至少需要表头和一行任务");

	const headerIndex = buildHeaderIndex(rows[0]);
	if (!headerIndex.has("name")) throw new Error("CSV 缺少名称列（name / 名称）");

	const items = rows.slice(1).map((cells, index) => buildItem(cells, headerIndex, index + 2));
	const seenNames = new Set<string>();
	for (const item of items) {
		if (seenNames.has(item.name)) throw new Error(`CSV 名称重复：${item.name}`);
		seenNames.add(item.name);
	}

	const assetsParentFolder = CSV_ASSETS_PARENT_FOLDER;

	return {
		jobVersion: DEFAULT_JOB_VERSION,
		assetsParentFolder,
		items,
	};
}

export function parseJobFileText(fileName: string, text: string): unknown {
	if (!isCsvFileName(fileName)) return JSON.parse(text) as unknown;
	return parseCsvJob(text);
}
