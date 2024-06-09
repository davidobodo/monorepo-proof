import { EOL } from "os";
import fs from "fs";
import { Plugin } from "release-it";
import { Bumper } from "conventional-recommended-bump";
import conventionalChangelog from "conventional-changelog";
import semver from "semver";
import concat from "concat-stream";
import { Console } from "console";

class ConventionalChangelog extends Plugin {
	// constructor(payload) {
	// 	const { config, logger } = payload;
	// 	super();

	// 	// console.log(payload.container, "TEH PAYLOAD");
	// 	// console.log(config, "======TEH CONFIG");
	// 	// console.log(logger, "======TEH LOGGER");
	// 	this.config = payload.container.config;
	// 	this.logger = payload.container.log;
	// 	// this.config = config;
	// 	// this.logger = logger;
	// }

	// static disablePlugin(options) {
	// 	// return "version";
	// 	return options.ignoreRecommendedBump ? null : "version";
	// }

	getInitialOptions(options, namespace) {
		const tagName = options.git ? options.git.tagName : null;
		options[namespace].tagPrefix = tagName ? tagName.replace(/v?\$\{version\}$/, "") : "";
		return options[namespace];
	}

	async getChangelog(latestVersion) {
		console.log(latestVersion, "==== THE LATEST");
		if (!latestVersion) latestVersion = "0.0.0";
		if (!this.config.isIncrement) {
			this.setContext({ version: latestVersion });
		} else {
			const { increment, isPreRelease, preReleaseId } = this.config.getContext("version");
			const version = await this.getRecommendedVersion({ increment, latestVersion, isPreRelease, preReleaseId });
			this.setContext({ version });
		}
		return this.generateChangelog();
	}

	async getRecommendedVersion({ increment, latestVersion, isPreRelease, preReleaseId }) {
		const { version } = this.getContext();
		if (version) return version;
		const { options } = this;
		this.debug({ increment, latestVersion, isPreRelease, preReleaseId });
		this.debug("Bumper", { options });
		try {
			const result = await new Bumper(options, options?.parserOpts);
			this.debug({ result });
			let { releaseType } = result;
			if (increment) {
				this.log.warn(`The recommended bump is "${releaseType}", but is overridden with "${increment}".`);
				releaseType = increment;
			}
			if (increment && semver.valid(increment)) {
				return increment;
			} else if (isPreRelease) {
				const type =
					releaseType && (options.strictSemVer || !semver.prerelease(latestVersion)) ? `pre${releaseType}` : "prerelease";
				return semver.inc(latestVersion, type, preReleaseId);
			} else if (releaseType) {
				return semver.inc(latestVersion, releaseType, preReleaseId);
			} else {
				return null;
			}
		} catch (err) {
			this.logger("Errrp");
			this.debug({ err });
			throw err;
		}
	}

	getChangelogStream(rawOptions = {}) {
		console.log("TRYING TO GENERATE", process.env.npm_package_name);
		const { version } = this.getContext();
		const { isIncrement } = this.config;
		console.log(this.config.getContext(), "=== CONFIG CONTEXT");
		const { latestTag, secondLatestTag, tagTemplate } = this.config.getContext();
		const currentTag = isIncrement ? (tagTemplate ? tagTemplate.replace("${version}", version) : null) : latestTag;
		const previousTag = isIncrement ? latestTag : secondLatestTag;
		console.log(currentTag, previousTag, "=== THE TAGS");
		const releaseCount = rawOptions.releaseCount === 0 ? 0 : isIncrement ? 1 : 2;
		const debug = this.config.isDebug ? this.debug : null;
		const mergedOptions = Object.assign({}, { releaseCount }, this.options);

		const { context, gitRawCommitsOpts, parserOpts, writerOpts, ...options } = mergedOptions;

		const mergedContext = Object.assign({ version, previousTag, currentTag }, context);
		const mergedGitRawCommitsOpts = Object.assign({ debug, from: previousTag }, gitRawCommitsOpts);

		console.log(writerOpts, "=== TEH OPTIONS");
		this.debug("Hello");
		this.debug("conventionalChangelog", {
			options,
			context: mergedContext,
			gitRawCommitsOpts: mergedGitRawCommitsOpts,
			parserOpts,
			writerOpts,
		});

		const resp = conventionalChangelog(options, mergedContext, mergedGitRawCommitsOpts, parserOpts, writerOpts);

		console.log(resp, "==THE RESOI");
		return conventionalChangelog(options, mergedContext, mergedGitRawCommitsOpts, parserOpts, writerOpts);
	}

	generateChangelog(options) {
		return new Promise((resolve, reject) => {
			const resolver = (result) => resolve(result.toString().trim());
			const changelogStream = this.getChangelogStream(options);
			changelogStream.pipe(concat(resolver));
			changelogStream.on("error", reject);
		});
	}

	getPreviousChangelog() {
		const { infile } = this.options;
		return new Promise((resolve, reject) => {
			const readStream = fs.createReadStream(infile);
			const resolver = (result) => resolve(result.toString().trim());
			readStream.pipe(concat(resolver));
			readStream.on("error", reject);
		});
	}

	async writeChangelog() {
		console.log("BEFORE WRITING CHANGE");
		const { infile, header: _header = "" } = this.options;
		let { changelog } = this.config.getContext();
		const header = _header.split(/\r\n|\r|\n/g).join(EOL);

		let hasInfile = false;
		console.log("AT TRHIS POINT");
		try {
			fs.accessSync(infile);
			hasInfile = true;
		} catch (err) {
			this.debug(err);
		}

		let previousChangelog = "";
		try {
			previousChangelog = await this.getPreviousChangelog();
			console.log("=========PREVIOUS LOG", previousChangelog);
			previousChangelog = previousChangelog.replace(header, "");
		} catch (err) {
			this.debug(err);
		}

		if (!hasInfile) {
			changelog = await this.generateChangelog({ releaseCount: 0 });
			this.debug({ changelog });
		}

		fs.writeFileSync(
			infile,
			header +
				(changelog ? EOL + EOL + changelog.trim() : "") +
				(previousChangelog ? EOL + EOL + previousChangelog.trim() : "") +
				EOL
		);

		if (!hasInfile) {
			await this.exec(`git add ${infile}`);
		}
	}

	getIncrementedVersion(options) {
		const { ignoreRecommendedBump } = this.options;
		return ignoreRecommendedBump ? null : this.getRecommendedVersion(options);
	}

	getIncrementedVersionCI(options) {
		return this.getIncrementedVersion(options);
	}

	async bump(version) {
		const recommendedVersion = this.getContext("version");

		this.setContext({ version });

		if (this.options.ignoreRecommendedBump && recommendedVersion !== version) {
			const changelog = await this.generateChangelog();
			this.config.setContext({ changelog });
		}
	}

	async beforeRelease() {
		const { infile } = this.options;
		const { isDryRun } = this.config;
		console.log("==== BEFORE MY RELEASE");

		this.log.exec(`Writing changelog to ${infile}`, isDryRun);

		if (infile && !isDryRun) {
			await this.writeChangelog();
		}
	}
}

export default ConventionalChangelog;
