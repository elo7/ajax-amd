#!/bin/bash

function tearDown {
	if [[ "$server_pid" != "" && $(serverRunning) -gt 0 ]]; then
		kill -9 $server_pid
		echo "server stopped"
	else
		echo "server was not running"
	fi
}

function serverRunning {
	let count=`ps | grep -c $server_pid`-1
	echo $count
}

trap tearDown EXIT

node server.js &
server_pid=$!

sleep 3

if [ $(serverRunning) -eq 0 ]; then
	echo "server did not start"
	exit 255
fi

./node_modules/mocha-phantomjs/bin/mocha-phantomjs -p ./node_modules/.bin/phantomjs -R spec "http://localhost:8888/test/ajaxTest.js.html" && \
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs -p ./node_modules/.bin/phantomjs -R spec "http://localhost:8888/test/ajaxGetTest.js.html" && \
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs -p ./node_modules/.bin/phantomjs -R spec "http://localhost:8888/test/ajaxPostTest.js.html" && \
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs -p ./node_modules/.bin/phantomjs -R spec "http://localhost:8888/test/ajaxSerializeTest.js.html"
