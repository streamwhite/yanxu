import { readFileSync } from "node:fs";
import {
	JOB_ASSETS_PARENT_FOLDER,
	parseJobFile,
	parseJobFileText,
} from "../../extension/src/shared/parse-job-file";

describe("job file parsing", () => {
	it("parses CSV with Chinese headers and quoted commas", () => {
		const parsed = parseJobFileText(
			"batch.csv",
			[
				"名称,描述,标签,目标平台,需要封面",
				'"第一条, 含逗号",描述文字,标签A|标签B,抖音|视频号,是',
			].join("\n"),
		) as {
			jobVersion: number;
			assetsParentFolder: string;
			items: {
				name: string;
				description: string;
				tags: string[];
				targets: string[];
				includeCover: boolean;
			}[];
		};

		expect(parsed.jobVersion).toBe(3);
		expect(parsed.assetsParentFolder).toBe(JOB_ASSETS_PARENT_FOLDER);
		expect(parsed.items[0]).toMatchObject({
			name: "第一条, 含逗号",
			description: "描述文字",
			tags: ["标签A", "标签B"],
			targets: ["douyin", "channels"],
			includeCover: true,
		});
	});

	it("parses JSON unchanged", () => {
		const job = { jobVersion: 3, assetsParentFolder: "/tmp/assets", items: [{ name: "one" }] };
		expect(parseJobFileText("batch.json", JSON.stringify(job))).toEqual(job);
	});

	it("parses XLSX files", async () => {
		const bytes = readFileSync("tests/fixtures/batch.job.example.xlsx");
		const file = new File([new Uint8Array(bytes)], "batch.xlsx", {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		const parsed = (await parseJobFile(file)) as {
			items: { name: string; targets: string[]; tags: string[] }[];
		};

		expect(parsed.items[0]).toMatchObject({
			name: "one",
			targets: ["douyin"],
			tags: ["标签A", "标签B"],
		});
	});

	it("rejects unknown platforms with the row number", () => {
		expect(() =>
			parseJobFileText("batch.csv", ["名称,目标平台", "one,unknown"].join("\n")),
		).toThrow("CSV 第 2 行");
	});

	it("rejects duplicate names", () => {
		expect(() => parseJobFileText("batch.csv", ["名称", "one", "one"].join("\n"))).toThrow(
			"CSV 名称重复",
		);
	});
});
