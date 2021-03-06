/* eslint no-warning-comments: "off" */
/* TODO: remove the comment above after merging update-deps PR */
'use strict';

var http = require('http'),
	nStatic = require('node-static');

var file = new(nStatic.Server)({
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
		'Access-Control-Allow-Headers': 'X-Requested-With',
	},
});

var countdownPerURI = {};

var sleep = function(ms) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

http.createServer(function(req, res) {
	if (req.url.indexOf('parameter') !== -1) {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		let parameters = {};
		if (req.url.indexOf('?') === -1) {
			res.end(JSON.stringify(parameters));
		} else {
			req.url
				.split('?')[1]
				.split('&')
				.map(param => param.split('='))
				.forEach(param => parameters[param[0]] = param[1]);
			res.end(JSON.stringify(parameters));
		}

	} else {
		file.serve(req, res, function(e) {
			if (req.url.indexOf('jsonData') !== -1) {
				var body = '';
				req.on('data', function (data) {
					body += data;
					if (body.length > 1e6) {
						req.connection.destroy();
					}
				});
				req.on('end', function () {
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(body);
				});
			} else if (e && req.url.indexOf('slow') !== -1) {
				// slooooow mooootioon
				if (countdownPerURI[req.url] === undefined) {
					var urlCount;
					if (req.url.match(/count\.type/)) {
						urlCount = req.url.match(/count\.number=(\d+)/)[1];
					} else {
						urlCount = req.url.match(/count=(\d+)/)[1];
					}
					countdownPerURI[req.url] = parseInt(urlCount, 10);
				}
				if (countdownPerURI[req.url] > 0) {
					countdownPerURI[req.url]--;
					if (countdownPerURI[req.url] > 0) {
						sleep(1000);
					}
				}
				res.end();
			} else if (e) {
				res.writeHead(e.status, e.headers);
				res.end();
			}
		});
	}

}).listen(8888);
console.log('Server starts on port 8888');
