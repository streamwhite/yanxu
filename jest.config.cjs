/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: "node",
	roots: ["<rootDir>"],
	testMatch: ["<rootDir>/packages/**/__tests__/**/*.test.ts", "<rootDir>/tests/**/*.test.ts"],
	moduleNameMapper: {
		"^zod$": "<rootDir>/packages/domain/node_modules/zod",

		"^@auto-upload/domain$": "<rootDir>/packages/domain/src/index.ts",
		"^@auto-upload/domain/(.*)$": "<rootDir>/packages/domain/src/$1",
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tsconfig.test.json",
			},
		],
	},
};
