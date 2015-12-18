#og-crawler

Often when sharing a link on Facebook, the provided image/description is outdated and not what you actually want to share. One method for refreshing this information is to take the URL and pass it through Facebook's official [URL Debugger](https://developers.facebook.com/tools/debug/).

og-crawler will crawl your website and scrape it for og data using Facebook's Open Graph API so you don't have to manually run all of your site's URLs through the Debugger.

You can crawl your entire website, or just tell og-crawler to scrape a single page.

## Installation

```
<sudo> npm i -g og-crawler
```

## Usage

### CLI

```
og_crawl http://google.com
```

### Node.js

```javascript
var OgCrawler = require('og-crawler');

new OgCrawler({
	depth: 3,
	maxParallel: 5,
	silent: false,
	url: 'http://google.com'
}).crawl();
```

## Options

`-d, --depth` This will determine how deep the crawling will go. The larger the number, the more pages will be scraped. Set this to 1 to scrape only the url provided.

Default value: 3

`-s, --silent` Setting this to true will prevent any logging. It will always prevent og-crawler from asking if you'd like to create a log file at the end of the process.

Default value: false

`-m, --max-parallel` If your website is large, and it's taking a long time to scrape the og data, increase this number to make more parallel requests.

Default value: 5