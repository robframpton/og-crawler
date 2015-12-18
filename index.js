#!/usr/bin/env node

var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');
var Crawler = require('js-crawler');
var fs = require('fs');
var http = require('http');
var path = require('path');

var ERRORS = {
	ERROR_INVALID_URL: new Error('Please enter a valid url'),
	ERROR_UNSPECIFIED_URL: new Error('A url must be specified')
};

var OgCrawler = function(config) {
	this.url = config.url;

	if (!this.url) {
		throw ERRORS.ERROR_UNSPECIFIED_URL;
	}

	this.depth = config.depth;
	this.finishedScrapes = 0;
	this.length = 0;
	this.maxParallel = config.maxParallel;
	this.ogRequests = [];
	this.urls = [];
};

OgCrawler.prototype = {
	crawl: function() {
		var instance = this;

		var crawler = new Crawler().configure({
			depth: instance.depth,
			ignoreRelative: false
		});

		crawler.crawl({
			finished: _.bind(instance._onFinish, instance),
			success: _.bind(instance._onCrawl, instance),
			url: instance.url
		});

		instance._crawler = crawler;
	},

	_clearStdout: function() {
		process.stdout.cursorTo(0);
		process.stdout.clearLine();
	},

	_createLogFile: function(urls) {
		var logHeader = 'Urls visited: ' + urls.length + '\n';

		var logContents = logHeader + urls.join('\n');

		var fileName = 'url_log_' + new Date().getTime() + '.txt';

		fileName = path.join(process.cwd(), fileName);

		fs.writeFileSync(fileName, logContents, {
			encoding: 'utf8'
		});

		process.stdout.write(chalk.bold('\nLog file created: ') + chalk.cyan(fileName));
	},

	_createOGReqest: function(url) {
		var instance = this;

		return function(cb) {
			instance._makeOGScrapeRequest(url, cb);
		};
	},

	_makeOGScrapeRequest: function(url, cb) {
		var instance = this;

		var options = {
			hostname: 'graph.facebook.com',
			path: '/?id=' + encodeURIComponent(url) + '&scrape=true',
			method: 'POST'
		};

		var req = http.request(options, function(res) {
			instance.finishedScrapes++;

			instance._updateSrapeLabel(url);

			cb(null, url);
		});

		req.end();
	},

	_onCrawl: function(page) {
		var url = page.url;

		var urls = this.urls;

		if (_.startsWith(url, this.url) && !_.contains(urls, url)) {
			this._updateLoadingLabel();

			this.ogRequests.push(this._createOGReqest(url));

			this.urls.push(url);
		}
	},

	_onFinish: function() {
		var instance = this;

		if (!instance.urls.length) {
			throw ERRORS.ERROR_INVALID_URL;
		}

		var urls = this.urls.sort();

		this.urls = urls;

		async.parallelLimit(this.ogRequests, instance.maxParallel, function(err, results) {
			instance._createLogFile(urls);
		});
	},

	_updateLoadingLabel: function() {
		this.length++;

		if (this.length > 1) {
			this._clearStdout();
		}

		process.stdout.write(chalk.bold('Unique urls collected: ') + chalk.cyan(this.length));
	},

	_updateSrapeLabel: function(url) {
		var index = this.finishedScrapes;
		var length = this.urls.length;

		if (index == 1) {
			process.stdout.write('\n');
		}
		else {
			this._clearStdout();
		}

		var percent = (index / length * 100).toFixed(2) + '%';

		process.stdout.write(chalk.bold('Urls scraped: ') + chalk.cyan(percent));
	}
};

module.exports = OgCrawler;
