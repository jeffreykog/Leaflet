// Config file for running Rollup

import rollupGitVersion from 'rollup-plugin-git-version';
import json from '@rollup/plugin-json';
import gitRev from 'git-rev-sync';
import pkg from '../package.json';
import {createBanner} from './banner';
import {copyFileSync, existsSync} from 'fs';

const release = process.env.NODE_ENV === 'release';
const watch = process.argv.indexOf('-w') > -1 || process.argv.indexOf('--watch') > -1;
// Skip the git branch+rev in the banner when doing a release build
const version = release ? pkg.version : `${pkg.version}+${gitRev.branch()}.${gitRev.short()}`;
const banner = createBanner(version);

const outro = `if (typeof window !== 'undefined') {
	var oldL = window.L;
	exports.noConflict = function() {
		window.L = oldL;
		return this;
	}
	
	// Always export us to window global (see #2364)
	window.L = exports;
}`;

// Plugin to copy TypeScript definitions
const copyTypesPlugin = {
	name: 'copy-types',
	writeBundle() {
		// Copy main leaflet definitions
		const sourceFile = 'src/leaflet.d.ts';
		const targetFile = 'dist/leaflet.d.ts';

		if (existsSync(sourceFile)) {
			copyFileSync(sourceFile, targetFile);
			console.log(`Copied ${sourceFile} to ${targetFile}`);
		} else {
			console.warn(`Warning: ${sourceFile} not found`);
		}

		// Copy index file for bundler compatibility
		const indexSourceFile = 'src/index.d.ts';
		const indexTargetFile = 'dist/index.d.ts';

		if (existsSync(indexSourceFile)) {
			copyFileSync(indexSourceFile, indexTargetFile);
			console.log(`Copied ${indexSourceFile} to ${indexTargetFile}`);
		} else {
			console.warn(`Warning: ${indexSourceFile} not found`);
		}
	}
};

/** @type {import('rollup').RollupOptions} */
const config = {
	input: 'src/Leaflet.js',
	output: [
		{
			file: pkg.main,
			format: 'umd',
			name: 'leaflet',
			banner: banner,
			outro: outro,
			sourcemap: true,
			freeze: false,
			esModule: false
		}
	],
	plugins: [
		release ? json() : rollupGitVersion(),
		copyTypesPlugin
	]
};

if (!watch) {
	config.output.push(
		{
			file: 'dist/leaflet-src.esm.js',
			format: 'es',
			banner: banner,
			sourcemap: true,
			freeze: false
		}
	);
}
export default config;
