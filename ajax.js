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

	function urlEncode(data) {
		if (data) {
			var encodedParams = [];
			for (var k in data) {
				encodedParams.push(encodeURIComponent(k) + "=" + encodeURIComponent(data[k]));
			}
			return encodedParams.join("&");
		}
		return null;
	}

	function getRequestObj() {
		if (window.XMLHttpRequest) {
			return new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
	}

	function isSuccess(status) {
		return status >= 200 && status < 300;
	}

	function isFunction(fn) {
		return fn && typeof fn === "function";
	}

	function handleResponse(requestObj, callbacks) {
		if (requestObj.readyState !== 4) {
			return;
		}

		var responseType = requestObj.getResponseHeader("Content-Type") || "";
		var responseContent = "";

		if (responseType.indexOf("json") !== -1) {
			responseContent = JSON.parse(requestObj.responseText);
		} else if (responseType.indexOf("xml") !== -1) {
			responseContent = (new DOMParser()).parseFromString(requestObj.responseText,"text/xml");
		} else {
			responseContent = requestObj.responseText;
		}

		if (isSuccess(requestObj.status) && isFunction(callbacks.success)) {
			callbacks.success(responseContent, requestObj);
		} else if (!isSuccess(requestObj.status) && isFunction(callbacks.error)) {
			callbacks.error(requestObj.statusText, requestObj);
		}

		if (isFunction(callbacks.complete)) {
			callbacks.complete(requestObj);
		}
	}

	function setHeaders(url, requestObj, method, configHeaders) {
		var headerValues = {};
		var host = url.match(/\/\/(.+?)\//);
		var crossOrigin = host && (host[1] ? host[1] != window.location.host : false);

		headerValues["Accept"] = configHeaders["Accept"] || "*/*";

		if (!crossOrigin) {
			headerValues["X-Requested-With"] = "XMLHttpRequest";
		}

		if (method === POST) {
			headerValues["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
		}

		for (var header in headerValues) {
			requestObj.setRequestHeader(header, headerValues[header]);
		}
	}

	function makeRequest(method, url, data, callbacks, config) {
		var callbacks = callbacks || {};
		var config = config || {};
		var requestObj = getRequestObj();
		config.async = !!config.async;

		if (requestObj) {
			requestObj.open(method, url, config.async);
			setHeaders(url, requestObj, method, config.headers || {});
			requestObj.onreadystatechange = function () {
				handleResponse(this, callbacks);
			}
			if (method === GET) {
				requestObj.send();
			} else {
				requestObj.send(urlEncode(data));
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
