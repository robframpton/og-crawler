var chalk = require('chalk');
var fs = require('fs');
var path = require('path');

module.exports = function(urls) {
	var logHeader = 'URLs scraped: ' + urls.length + '\n';

	var logContents = logHeader + urls.join('\n');

	var fileName = 'url_log_' + new Date().getTime() + '.txt';

	fileName = path.join(process.cwd(), fileName);

	fs.writeFileSync(fileName, logContents, {
		encoding: 'utf8'
	});

	process.stdout.write(chalk.bold('\nLog file created: ') + chalk.cyan(fileName));
};