define('ajax', ['qwest'], function(qwest) {
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

	return {
		'get': function(url, data, callbacks, config){
			var callbacks = callbacks || {};
			var config = config || {};
			config.async = !!config.async;

			qwest.get(url, data, config)
				.then(function(data){
					if(callbacks.success && typeof callbacks.success === "function"){
						callbacks.success(data, this);
					}
				})
				['catch'](function(data){
					if(callbacks.error && typeof callbacks.error === "function"){
						callbacks.error(data, this);
					}
				})
				.complete(function(){
					if(callbacks.complete && typeof callbacks.complete === "function"){
						callbacks.complete(this);
					}
				});
		},

		'post': function(url, data, callbacks, config){
			var callbacks = callbacks || {};
			var config = config || {};
			config.async = !!config.async;

			qwest.post(url, data, config)
				.then(function(data){
					if(callbacks.success && typeof callbacks.success === "function"){
						callbacks.success(data, this);
					}
				})
				['catch'](function(data){
					if(callbacks.error && typeof callbacks.error === "function"){
						callbacks.error(data, this);
					}
				})
				.complete(function(){
					if(callbacks.complete && typeof callbacks.complete === "function"){
						callbacks.complete(this);
					}
				});
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
