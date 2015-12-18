#!/usr/bin/env node

var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');
var Crawler = require('js-crawler');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var http = require('http');
var path = require('path');

var ERRORS = {
	ERROR_INVALID_URL: new Error('Please enter a valid URL'),
	ERROR_UNSPECIFIED_URL: new Error('A URL must be specified')
};

var OgCrawler = function(config) {
	this.url = config.url;

	if (!this.url) {
		throw ERRORS.ERROR_UNSPECIFIED_URL;
	}

	this.silent = !_.isUndefined(config.silent) ? config.silent : false;
	this.depth = config.depth || 3;
	this.finishedScrapes = 0;
	this.length = 0;
	this.maxParallel = config.maxParallel || 5;
	this.ogRequests = [];
	this.urls = [];

	EventEmitter.call(this);
};

OgCrawler.prototype = _.create(EventEmitter.prototype, {
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

		return instance;
	},

	_clearStdout: function() {
		if (!this.silent) {
			process.stdout.cursorTo(0);
			process.stdout.clearLine();
		}
	},

	_createOGReqest: function(url) {
		var instance = this;

		return function(cb) {
			instance._makeOGScrapeRequest(url, cb);
		};
	},

	_log: function(message) {
		if (!this.silent) {
			process.stdout.write(message);
		}
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

			instance.emit('scrape', {
				url: url
			});

			cb(null, url);
		});

		req.end();
	},

	_onCrawl: function(page) {
		var url = page.url;

		var urls = this.urls;

		if (_.startsWith(url, this.url) && !_.contains(urls, url)) {
			this.emit('crawl', {
				url: url,
				urls: urls
			});

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
			instance._log(chalk.bold('\nFinished!\n'));

			instance.emit('end', {
				urls: urls
			});
		});
	},

	_updateLoadingLabel: function() {
		this.length++;

		if (this.length > 1) {
			this._clearStdout();
		}

		this._log(chalk.bold('Unique URLs collected: ') + chalk.cyan(this.length));
	},

	_updateSrapeLabel: function(url) {
		var index = this.finishedScrapes;
		var length = this.urls.length;

		if (index == 1) {
			this._log('\n');
		}
		else {
			this._clearStdout();
		}

		var percent = (index / length * 100).toFixed(2) + '%';

		this._log(chalk.bold('URLs scraped: ') + chalk.cyan(percent));
	}
});

module.exports = OgCrawler;
