#!/usr/bin/env node

var minimistConfig = {
	alias: {
		d: 'depth',
		m: 'max-parallel'
	},
	default: {
		depth: 3,
		'max-parallel': 5
	}
};

var argv = require('minimist')(process.argv.slice(2), minimistConfig);
var OgCrawler = require('../index');

new OgCrawler({
	depth: argv.depth,
	maxParallel: argv['max-parallel'],
	url: argv._[0]
}).crawl();