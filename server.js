var http = require('http'),
	static = require('node-static'),
	sleep = require('sleep');

var file = new(static.Server)({
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET,POST',
		'Access-Control-Allow-Headers': 'X-Requested-With'
	}
});

var countdownPerURI = {};

http.createServer(function (req, res) {
	file.serve(req, res, function(e) {
		if (e && req.url.indexOf('slow') !== -1) {
			// slooooow mooootioon
			if (countdownPerURI[req.url] === undefined) {
				var urlCount = req.url.match(/count=(\d+)/)[1];
				countdownPerURI[req.url] = parseInt(urlCount, 10);
			}
			if (countdownPerURI[req.url] > 0) {
				countdownPerURI[req.url]--;
				if (countdownPerURI[req.url] > 0) {
					sleep.sleep(1);
				}
			}
			res.end();
		} else if (e) {
			res.writeHead(e.status, e.headers);
			res.end();
		}
	});
}).listen(8888);
console.log("Server starts on port 8888");
