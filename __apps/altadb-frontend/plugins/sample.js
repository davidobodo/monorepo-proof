import { Plugin } from "release-it";
import fs from "fs";
import path from "path";

export default class MyPlugin extends Plugin {
	constructor(payload) {
		const { config, logger } = payload;
		super();

		// console.log(payload.container, "TEH PAYLOAD");
		// console.log(config, "======TEH CONFIG");
		// console.log(logger, "======TEH LOGGER");
		this.config = payload.container.config;
		this.logger = payload.container.log;
		// this.config = config;
		// this.logger = logger;
	}

	async beforeRelease() {
		this.logger.log("MyPlugin: beforeRelease");
		const filePath = path.resolve("release-info.txt");
		fs.writeFileSync(filePath, `Release version: ${this.config.getContext().version}\n`);
		this.logger.log(`Created ${filePath}`);
	}

	// "changelog": "npx auto-changelog --stdout --commit-limit false -u --breaking-pattern BREAKING CHANGE:feat --template ./changelog-compact-commit-list.hbs "

	// getLatestVersion() {
	// 	// TODO: Read version from package.json
	// 	return fs.readFileSync("./VERSION", "utf8").trim();
	// }

	// bump(version) {
	// 	// TODO: Upate version in package json
	// 	this.version = version;
	// 	fs.writeFileSync("./VERSION", version);
	// }
}
