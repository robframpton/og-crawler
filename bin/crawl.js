#!/usr/bin/env node

var chalk = require('chalk');
var inquirer = require('inquirer');
var log = require('../lib/log');
var minimist = require('minimist');
var OgCrawler = require('../index');

var minimistConfig = {
	alias: {
		d: 'depth',
		m: 'max-parallel',
		s: 'silent'
	}
};

var argv = minimist(process.argv.slice(2), minimistConfig);

var ogCrawler = new OgCrawler({
	depth: argv.depth,
	maxParallel: argv['max-parallel'],
	silent: argv.silent,
	url: argv._[0]
}).crawl();

ogCrawler.on('end', function(event) {
	var urls = event.urls;

	if (argv.silent) {
		return;
	}

	if (!urls || urls.length < 1) {
		process.stdout.write(chalk.yellow('\nWarning:'), 'No URLs found');
	}

	inquirer.prompt(
		[
			{
				message: 'Would you like to create a log file listing scraped URLs in your current working directory?',
				name: 'log',
				type: 'confirm'
			}
		],
		function(answers) {
			if (answers.log) {
				log(event.urls);
			}
		}
	)
});
