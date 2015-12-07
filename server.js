var http = require('http'),
  static = require('node-static');

var file = new(static.Server)();

http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8888);
console.log("Server starts on port 8888");
