define("ajax", [], function() {
	"use strict";

	var GET = "GET";
	var POST = "POST";

	if (!String.prototype.trim) {
		(function(){
			// Make sure we trim BOM and NBSP
			var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
			String.prototype.trim = function () {
				return this.replace(rtrim, "");
			}
		})();
	}

	if (!String.prototype.isEmpty) {
		String.prototype.isEmpty = function() {
			var value;

			if(this !== null && this !== undefined){
				value = this.toString();
			}

			if(value === null || value === undefined || value.trim() === "") {
				return true;
			}

			return false;
		};
	}

	function isEmptyData(data) {
		for(var prop in data) {
			if(data.hasOwnProperty(prop)) return false;
		}
		return true;
	}

	function urlEncodeParams(data, prefix) {
		prefix = prefix || "";
		if (!isEmptyData(data)) {
			var encodedParams = [];
			for (var k in data) {
				if (typeof data[k] === "object") {
					var encodedObject = urlEncodeParams(data[k], prefix + encodeURIComponent(k) + ".");
					encodedParams = encodedParams.concat(encodedObject.split("&"));
				} else {
					encodedParams.push(prefix + encodeURIComponent(k) + "=" + encodeURIComponent(data[k]));
				}
			}
			return encodedParams.join("&");
		}
		return null;
	}

	function urlEncode(url, data) {
		var encodedParams = urlEncodeParams(data);
		if( (encodedParams == null || url.indexOf(encodedParams)) >= 0 || (/(\&$)/).test(url) ) {
			return url;
		}
		url += ((/(\?)/).test(url) ? "&" : "?")  + encodedParams;
		return url;
	}

	function getRequestObj(url) {
		return new XMLHttpRequest();
	}

	function isSuccess(status) {
		return status >= 200 && status < 300;
	}

	function isFunction(fn) {
		return fn && typeof fn === "function";
	}

	function handleResponse(requestObj, callbacks, timeoutHandler, lastChance) {
		if (requestObj.readyState !== 4) {
			return;
		}

		if (lastChance && timeoutHandler !== undefined) {
			clearTimeout(timeoutHandler);
		}

		var responseType = requestObj.getResponseHeader("Content-Type") || "";
		var responseContent = "";
		var parseError = false;

		try {
			if (responseType.indexOf("json") !== -1) {
				responseContent = JSON.parse(requestObj.responseText);
			} else if (responseType.indexOf("xml") !== -1) {
				responseContent = (new DOMParser()).parseFromString(requestObj.responseText,"text/xml");
			} else {
				responseContent = requestObj.responseText;
			}
		} catch (err) {
			parseError = true;
		}

		if (!parseError && isSuccess(requestObj.status) && isFunction(callbacks.success)) {
			callbacks.success(responseContent, requestObj);
			if (timeoutHandler) {
				clearTimeout(timeoutHandler);
				timeoutHandler = null;
			}
		} else if ((parseError || !isSuccess(requestObj.status)) && isFunction(callbacks.error)) {
			if (lastChance) {
				callbacks.error(requestObj.statusText, requestObj);
			}
		}

		if ((!parseError || lastChance) && isFunction(callbacks.complete)) {
			callbacks.complete(requestObj);
			if (timeoutHandler) {
				clearTimeout(timeoutHandler);
			}
		}
	}

	function setHeaders(url, requestObj, method, configHeaders) {
		configHeaders["Accept"] = configHeaders["Accept"] || "*/*";

		if (!isCORS(url)) {
			configHeaders["X-Requested-With"] = configHeaders["X-Requested-With"] || "XMLHttpRequest";
		}

		if (method === POST) {
			configHeaders["Content-Type"] = configHeaders["Content-Type"] || "application/x-www-form-urlencoded; charset=UTF-8";
		}

		for (var header in configHeaders) {
			requestObj.setRequestHeader(header, configHeaders[header]);
		}
	}

	function isCORS(url) {
		var host = url.match(/\/\/(.+?)\//);
		return host && (host[1] ? host[1] != window.location.host : false);
	}

	function setCache(url, hasCache) {
		if (hasCache || (/(\?|&)_t=/).test(url)) {
			return url;
		}

		if ((/\?/).test(url)) {
			return url + (!(/(\&$)/).test(url) ? "&_t=" : "_t=") + (+ new Date());
		}

		return url + "?_t=" + (+ new Date());
	}

	function makeRequest(method, url, data, callbacks, config) {
		callbacks = callbacks || {};
		config = config || {};
		config.retries = config.retries ? parseInt(config.retries) : 0;
		config.timeout = config.timeout ? parseInt(config.timeout) : 10000;
		config.cache = !!config.cache;
		var requestObj = getRequestObj(url);
		var timeoutHandler;
		config.async = !!config.async;

		if (method === GET) {
			url = urlEncode(url, data);
		}

		url = setCache(url, config.cache);

		if (requestObj) {
			requestObj.open(method, url, config.async);
			setHeaders(url, requestObj, method, config.headers || {});

			if (config.timeout) {
				timeoutHandler = setTimeout(function() {
					requestObj.abort();
					if (config.retries > 0) {
						config.retries--;
						makeRequest(method, url, data, callbacks, config);
					}
				}, config.timeout);
			}

			requestObj.onreadystatechange = function() {
				handleResponse(this, callbacks, timeoutHandler, config.retries === 0);
			};
			if (method === GET) {
				requestObj.send();
			} else {
				requestObj.send(urlEncodeParams(data));
			}
		}
	}

	return {
		"get": function(url, data, callbacks, config){
			makeRequest(GET, url, data, callbacks, config);
		},

		"post": function(url, data, callbacks, config){
			makeRequest(POST, url, data, callbacks, config);
		},

		"serializeObject": function(form){
			var inputs = Array.prototype.slice.call(form.getElementsByTagName("input")),
				textareas = Array.prototype.slice.call(form.getElementsByTagName("textarea")),
				selects = Array.prototype.slice.call(form.getElementsByTagName("select")),
				formElements = inputs.concat(textareas).concat(selects),
				serialize = {},
				total = formElements.length;

			for (var i = 0; i < total; i++) {
				if (!formElements[i].disabled && !formElements[i].name.isEmpty()) {
					if (formElements[i].type === "radio" || formElements[i].type === "checkbox") {
						if (formElements[i].checked) {
							serialize[formElements[i].getAttribute("name")] = formElements[i].value;
						}
					} else {
						serialize[formElements[i].getAttribute("name")] = formElements[i].value;
					}
				}
			}
			return serialize;
		}
	}
});
