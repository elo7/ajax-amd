#!/bin/bash

./node_modules/mocha-phantomjs/bin/mocha-phantomjs -R spec "http://localhost:8888/test/ajaxTest.js.html";
./node_modules/mocha-phantomjs/bin/mocha-phantomjs -R spec "http://localhost:8888/test/ajaxGetTest.js.html";
./node_modules/mocha-phantomjs/bin/mocha-phantomjs -R spec "http://localhost:8888/test/ajaxPostTest.js.html";
./node_modules/mocha-phantomjs/bin/mocha-phantomjs -R spec "http://localhost:8888/test/ajaxSerializeTest.js.html";
