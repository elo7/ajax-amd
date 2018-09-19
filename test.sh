#!/bin/bash

function serverRunning {
	kill -0 $server_pid 2>/dev/null
	echo $?
}

function tearDown {
	if [[ "$server_pid" != "" && $(serverRunning) -eq 0 ]]; then
		kill -9 $server_pid
		echo "server stopped"
	else
		echo "server was not running"
	fi
}

trap tearDown EXIT

node server.js &
server_pid=$!

sleep 3

if [ $(serverRunning) -ne 0 ]; then
	echo "server did not start"
	exit 255
fi

./node_modules/mocha-phantomjs/bin/mocha-phantomjs -p ./node_modules/.bin/phantomjs -R spec "http://localhost:8888/test/ajaxTest.js.html" && \
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs -p ./node_modules/.bin/phantomjs -R spec "http://localhost:8888/test/ajaxGetTest.js.html" && \
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs -p ./node_modules/.bin/phantomjs -R spec "http://localhost:8888/test/ajaxPostTest.js.html" && \
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs -p ./node_modules/.bin/phantomjs -R spec "http://localhost:8888/test/ajaxSerializeTest.js.html"
