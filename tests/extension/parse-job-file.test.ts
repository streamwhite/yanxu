import { readFileSync } from "node:fs";
import { readSheet } from "read-excel-file/universal";
import { validateJobFile } from "@yanxu/domain";
import {
	JOB_ASSETS_PARENT_FOLDER,
	parseJobFile,
	parseJobFileText,
} from "../../extension/src/shared/parse-job-file";

const FULL_ITEM_NAME = "AI诈骗最可怕的地方" as const;
const COVER_DISABLED_ITEM_NAME = "苹果最怕的事来了" as const;
const MINIMAL_ITEM_NAME = "日本最强公司换人了" as const;

const EXPECTED_XLSX_HEADERS = [
	"名称",
	"描述",
	"标签",
	"来源",
	"B站分区",
	"创作声明",
	"创作声明授权",
	"视频号标注",
] as const;

type ParsedItem = {
	name: string;
	description?: string;
	tags?: string[];
	targets?: string[];
	includeCover?: boolean;
	sourceType?: string;
	partition?: string;
	creativeStatement?: string;
	creativeStatementAuth?: string;
	markTag?: string;
};

function readExampleFile(name: string): File {
	const bytes = readFileSync(`examples/${name}`);
	return new File([new Uint8Array(bytes)], name);
}

describe("job file parsing", () => {
	it("rejects CSV job files", async () => {
		const file = new File(["名称\none"], "batch.csv", { type: "text/csv" });
		await expect(parseJobFile(file)).rejects.toThrow("不支持的任务文件格式：.csv");
	});

	it("parses JSON unchanged", () => {
		const job = { jobVersion: 3, assetsParentFolder: "/tmp/assets", items: [{ name: "one" }] };
		expect(parseJobFileText("batch.json", JSON.stringify(job))).toEqual(job);
	});

	it("parses the complete Chinese JSON example", async () => {
		const source = readFileSync("examples/batch.job.example.json", "utf8");
		const sourceJob = JSON.parse(source) as Record<string, unknown>;
		const parsed = (await parseJobFile(readExampleFile("batch.job.example.json"))) as {
			jobVersion: number;
			assetsParentFolder: string;
			items: ParsedItem[];
		};

		expect(sourceJob).not.toHaveProperty("jobVersion");
		expect(sourceJob).not.toHaveProperty("assetsParentFolder");
		expect(sourceJob).toHaveProperty("任务列表");
		expect(parsed).toMatchObject({
			jobVersion: 3,
			assetsParentFolder: JOB_ASSETS_PARENT_FOLDER,
		});
		expect(parsed.items).toHaveLength(3);
		expect(parsed.items[0]).toMatchObject({
			name: FULL_ITEM_NAME,
			sourceType: "original",
			partition: "知识",
			creativeStatement: "含AI生成内容",
			creativeStatementAuth: "内容为自制：未经作者允许，禁止转载",
			markTag: "含AI生成内容",
		});
		expect(parsed.items[0]).not.toHaveProperty("targets");
		expect(parsed.items[0]).not.toHaveProperty("includeCover");
		expect(parsed.items[1]).toMatchObject({
			name: COVER_DISABLED_ITEM_NAME,
			sourceType: "repost",
			markTag: "内容为转载",
		});
		expect(parsed.items[1]).not.toHaveProperty("targets");
		expect(parsed.items[1]).not.toHaveProperty("includeCover");
		expect(parsed.items[2]).toEqual({ name: MINIMAL_ITEM_NAME });
		const validated = validateJobFile(parsed);
		expect(validated).toMatchObject({ ok: true, kind: "batch" });
		if (validated.ok && validated.kind === "batch") {
			expect(validated.job.items[0].targets).toEqual(["bilibili", "douyin", "channels"]);
		}
	});

	it("parses a complete multi-case XLSX workbook", async () => {
		const bytes = readFileSync("tests/fixtures/batch.job.example.xlsx");
		const file = new File([new Uint8Array(bytes)], "batch.job.example.xlsx");
		const rows = await readSheet(file);
		expect(rows[0]).toEqual([...EXPECTED_XLSX_HEADERS]);

		const parsed = (await parseJobFile(file)) as { items: ParsedItem[] };

		expect(parsed.items).toHaveLength(3);
		expect(parsed.items[0]).toMatchObject({
			name: FULL_ITEM_NAME,
			sourceType: "original",
			partition: "知识",
			creativeStatement: "含AI生成内容",
			creativeStatementAuth: "内容为自制：未经作者允许，禁止转载",
			markTag: "含AI生成内容",
		});
		expect(parsed.items[0].tags).toEqual(expect.arrayContaining(["AI诈骗", "反诈"]));
		expect(parsed.items[1]).toMatchObject({
			name: COVER_DISABLED_ITEM_NAME,
			sourceType: "repost",
			markTag: "内容为转载",
		});
		expect(parsed.items[2]).toEqual({ name: MINIMAL_ITEM_NAME });
		expect(validateJobFile({ jobVersion: 3, assetsParentFolder: "/tmp", items: parsed.items }))
			.toMatchObject({ ok: true, kind: "batch" });
	});
});
