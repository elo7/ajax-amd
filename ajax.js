define('ajax', [], function() {
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

			if(value===null || value===undefined || value.trim()==="") {
				return true;
			}

			return false;
		};
	}

	function urlEncode(data) {
		if (data) {
			return Object.keys(data).map(function(k) {
				return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
			}).join('&');
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

	function handleResponse(requestObj, callbacks) {
		if (requestObj.readyState !== 4) {
			return;
		}

		var responseType = requestObj.getResponseHeader("Content-Type") || "";
		var responseContent = "";
		if(responseType.indexOf("json") !== -1) {
			responseContent = JSON.parse(requestObj.responseText);
		} else if(responseType.indexOf("xml") !== -1) {
			responseContent = (new DOMParser()).parseFromString(requestObj.responseText,'text/xml');
		} else {
			responseContent = requestObj.responseText;
		}

		if(requestObj.status === 200 && callbacks.success && typeof callbacks.success === "function") {
			callbacks.success(responseContent, requestObj);
		} else if (callbacks.error && typeof callbacks.error === "function") {
			callbacks.error(requestObj.statusText, requestObj);
		}
		if (callbacks.complete && typeof callbacks.complete === "function") {
			callbacks.complete(requestObj);
		}
	}

	function setHeaders(requestObj, method, configHeaders) {
		var headerValues = {};

		headerValues['X-Requested-With'] = 'XMLHttpRequest';
		headerValues["Accept"] = configHeaders["Accept"] || "*/*";

		if(method === "POST") {
			headerValues["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
		}

		for(var header in headerValues) {
			requestObj.setRequestHeader(header, headerValues[header]);
		}
	}

	return {
		'get': function(url, data, callbacks, config){
			var callbacks = callbacks || {};
			var config = config || {};
			config.async = !!config.async;

			var requestObj = getRequestObj();

			if (requestObj) {
				requestObj.open("GET", url, config.async);
				setHeaders(requestObj, "GET", config.headers || {});
				requestObj.onreadystatechange = function () {
					handleResponse(this, callbacks);
				}
				requestObj.send();
			}
		},

		'post': function(url, data, callbacks, config){
			var callbacks = callbacks || {};
			var config = config || {};
			config.async = !!config.async;

			var requestObj = getRequestObj();

			if (requestObj) {
				requestObj.open("POST", url, config.async);
				setHeaders(requestObj, "POST", config.headers || {});
				requestObj.onreadystatechange = function () {
					handleResponse(this, callbacks);
				}
				requestObj.send(urlEncode(data));
			}
		},

		'serializeObject': function(form){
			var inputs = Array.prototype.slice.call(form.getElementsByTagName("input")),
				textareas = Array.prototype.slice.call(form.getElementsByTagName("textarea")),
				selects = Array.prototype.slice.call(form.getElementsByTagName("select")),
				formElements = inputs.concat(textareas).concat(selects),
				serialize = {},
				total = formElements.length;

			for(i=0;i<total;i++){
				if(!formElements[i].disabled && !formElements[i].name.isEmpty()){
					if(formElements[i].type === 'radio' || formElements[i].type === 'checkbox'){
						if(formElements[i].checked){
							serialize[formElements[i].getAttribute('name')] = formElements[i].value;
						}
					} else {
						serialize[formElements[i].getAttribute('name')] = formElements[i].value;
					}
				}
			}

			return serialize;
		}
	}
});
