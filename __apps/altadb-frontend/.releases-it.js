import fs from "fs";
const commitTemplate = fs.readFileSync("./changelog-compact-commit-list").toString();
const version = "${version}";
const packageName = process.env.npm_package_name;
const scope = packageName.split("/")[1];
// const fs = require("fs");
// const commitTemplate = fs.readFileSync("./changelog-compact-commit-list").toString();
// const version = "${version}";
// const packageName = process.env.npm_package_name;
// const scope = packageName.split("/")[1];

export default {
	plugins: {
		// "@release-it/conventional-changelog": {
		// 	writerOpts: {
		// 		commitPartial: commitTemplate,
		// 	},
		// 	path: ".",
		// 	infile: "CHANGELOG.md",
		// 	gitRawCommitsOpts: {
		// 		path: ".",
		// 	},
		// },
	},
	git: {
		push: true,
		tagName: `${packageName}-v${version}`,
		commitsPath: ".",
		commitMessage: `front - :zap: released versions v${version} [no ci]`,
		requireCommits: true,
		requireCommitsFail: false,
		requireCleanWorkingDir: false,
		changelog:
			"npx auto-changelog --stdout --commit-limit false -u --breaking-pattern BREAKING CHANGE:feat --template ./changelog-compact-commit-list.hbs ",
	},
	npm: {
		publish: false,
		versionArgs: ["--workspaces false"],
	},
	github: {
		release: true,
		releaseName: `${packageName}-v${version}`,
	},
	hooks: {
		"before:init": ["git update-index -q --refresh"],
		// "before:git:release": ["mvm-update", "git add --all"],
	},
};
