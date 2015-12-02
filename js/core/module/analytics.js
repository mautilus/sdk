/**
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * File Analytics class Google Analytics handling
 * 
 * @author Mautilus s.r.o.
 * @class Analytics
 * @singleton
 * @mixins Events
 */

/*
 * USAGE: Account number has to be set in CONFIG.account.GA = number;
 *        Better is using "aplication" instead of webpage (you have to set Google analytics to tracking mobile application during creating tracking account) 
 *        You can track: 1) pages      - Analytics.trackPageview('/app/homepage', {optional_params_object});
 *                       2) screens    - Analytics.trackScreenview('homepage', {optional_params_object});  
 *                       3) events     - Analytics.trackEvent('category', 'action', 'label');
 *                       4) exceptions - Analytics.trackException('exception', {optional_params_object})
 *                       Other interaction are not supported yet in SDK  
 */
Analytics = (function(Events) {
	var Analytics = {
		/**
		 * @property {Object} config General config hash
		 */
		config: null,
		/**
		 * @property {Boolean} General information if app is tracking as website or as application (this flag can enable measurement some other parameters)
		 */
		application: true,
		/**
		 * @property {string} requestType default type of request GET|POST
		 */
		requestType: 'POST',
		/**
		 * @property {String} URL absolute path to the analytics 
		 */
		URL: '',
		/**
		 * @property {String} no SSL URL absolute path to the analytics 
		 */
		URLnoSSL: 'http://www.google-analytics.com/collect',
		/**
		 * @property {String} SSL URL absolute path to the analytics 
		 */
		URLSSL: 'https://ssl.google-analytics.com/collect',
		/**
		 * @property {Number} How long is cookie available (s)
		 */
		YEARS_2: 63115200,
		/**
		 * @property {Object} Required values for all hits
		 */

		params: {
			v: '1',			// The protocol version. The value should be 1.
			tid: '',		// The ID that distinguishes to which Google Analytics property to send data.
			cid: '',		// An ID unique to a particular user.
			t: '',			// The type of interaction collected for a particular user. ('pageview'|'screenview'|'event'|'transaction'|'item'|'social'|'exception'|'timing')
			// ua: '',		// OPTIONAL The User Agent of the browser. Note that Google has libraries to identify real user agents. Hand crafting your own agent could break at any time.
			// ds: '',		// OPTIONAL Indicates the data source of the hit.
			sr: '1280x720',	// OPTIONAL Specifies the screen resolution.
			cd1: '',		// OPTIONAL Custom variable 1
			cd2: '',		// OPTIONAL Custom variable 2
			cd3: '',		// OPTIONAL Custom variable 3
			cd4: '',		// OPTIONAL Custom variable 4
			cd5: '',		// OPTIONAL Custom variable 5
		},

		appParams: {
			an: '',			// OPTIONAL Specifies the application name.
			aid: '',		// OPTIONAL Application identifier..
			av: '',			// OPTIONAL Specifies the application version.
			aiid: '',		// OPTIONAL Application installer identifier.
		}
	};

	$.extend(true, Analytics, Events, {
		init: function(config) {
			this.configure(config);
			this.on('timeout', function(){
			//console.log('request timeout');
			}, this);
		},
		/**
		 * Set class config hash
		 * 
		 * @param {Object} config Hash of parameters
		 */
		configure: function(config) {
			this.requestTimeout = CONFIG.ajax.timeout;
			this.config = $.extend(true, this.config || {}, config);
			if(this.config.ssl){
				this.URL = this.URLSSL;
			}
			else{
				this.URL = this.URLnoSSL;
			}
			if(typeof this.config.application == 'boolean'){
				this.application = this.config.application;
			}
			if(typeof this.config.params){
				this.params = $.extend(true, this.params || {}, this.config.params);
			}

			if(this.application){
				this.appParams.an = this.config.applicationName || '';
				this.appParams.aid = this.config.applicationId || '';
				this.appParams.av = this.config.applicationVersion || '';
				this.appParams.aiid = this.config.applicationInstallId || '';
			}
			this.setUUID();

			this.params.tid = this.config.ACCOUNT_CODE;
			this.params.cid = this.UUID;
			//this.params.ua = navigator.userAgent;
		},

		/**
		 * Set and returns current UUID it should be valid for 2 years
		 *
		 *  @returns {string} UUID
		 **/
		setUUID: function(){
			// UUID should be valid for the 2 years
			this.UUID = Storage.get('device_uuid');
			if(!this.UUID){
				this.UUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});
			}
			Storage.set('device_uuid' , this.UUID, this.YEARS_2);

			return this.UUID;
		},

		/**
		 * Track page view
		 * @private
		 * @param {String} site - required
		 * @param {String} description - optional
		 */
		trackPageview: function (site, description) {
			if(!this.config.ACCOUNT_CODE){
				return;
			}

			var params = {};
			$.extend(true, params, this.params, description || {}, {'t': 'pageview', 'dp': site});

			this.collect(this.URL, params, this.requestType, function(resp) {
				if(resp){
					var img = new Image();
					img.src = resp;
				}
			}, this);
		},

		/**
		 * Track page view
		 * @private
		 * @param {String} site - required
		 * @param {String} description - optional
		 */
		trackScreenview: function (site, description) {
			if(!this.config.ACCOUNT_CODE){
				return;
			}

			var params = {};
			$.extend(true, params, this.params, this.application ? this.appParams : {}, description || {}, {'t': 'screenview', 'cd': site});

			this.collect(this.URL, params, this.requestType, function(resp) {
				if(resp){
					var img = new Image();
					img.src = resp;
				}
			}, this);

		},

		/**
		 * Track events
		 * @private
		 * @param {String} category - required
		 * @param {String} action - required
		 * @param {String} label - optional
		 * @param {String} value - optional
		 * @param {Object} value - optional overwrite some query params
		 */
		trackEvent: function (category, action, label, value, description) {
			if(!this.config.ACCOUNT_CODE){
				return;
			}
			if(typeof label == 'object'){
				var d = description; 
				description = label;
				label = value;
				value = d;
			}

			var params = {};
			$.extend(true, params, this.params, this.application ? this.appParams : {}, description || {}, {'t': 'event', 'ec': category, 'ea': action});

			if(label){
				params.el = label;
			}
			if(value){
				params.ev = value;
			}

			this.collect(this.URL, params, this.requestType, function(resp) {
				if(resp){
					var img = new Image();
					img.src = resp;
				}
			}, this);
		},

		/**
		 * Track page view
		 * @private
		 * @param {String} exception - required which exception occurs
		 * @param {String} description - optional
		 */
		trackException: function (exception, description) {
			if(!this.config.ACCOUNT_CODE){
				return;
			}

			var params = {};
			$.extend(true, params, this.params, this.application ? this.appParams : {}, description || {}, {'t': 'exception', 'exf': '1', 'exd': exception});

			this.collect(this.URL, params, this.requestType, function(resp) {
				if(resp){
					var img = new Image();
					img.src = resp;
				}
			}, this);

		},

		collect: function(url, data, requestType, callback, cbscope) {

			if(typeof requestType == 'function'){
				cbscope = callback;
				callback = requestType;
				requestType = this.requestType;
			}
			var scope = this;
			var dataArr = [];

			for (var i in data) {
				if (data.hasOwnProperty(i)) {
					if (typeof data[i] == 'object' || (data[i] instanceof Array)) {
						for (var j in data[i]) {
							dataArr.push(i + '=' + encodeURIComponent(data[i][j]));
						}

					} else {
						dataArr.push(i + '=' + encodeURIComponent(data[i]));
					}
				}
			}

			var cb = function(resp, status, xhr){
				if (callback) {
					callback.call(cbscope || scope, resp || null, status, xhr, url);
				}
			};
			var cbfail = function(resp, status, xhr){
				if (callback) {
					callback.call(cbscope || scope, false, xhr.status, xhr, url);
				}
			};
			
			Ajax.request(url, {
				method: requestType,
				data: dataArr.join('&'),
				processData: false,
				timeout: scope.requestTimeout}
			).done(cb).fail(cbfail);
		}

	});

	// Initialize this class when Main is ready
	Main.ready(function(){
//     Analytics.init(CONFIG.GA ? {ACCOUNT_CODE:CONFIG.GA.account, ssl:CONFIG.GA.ssl, application: true, applicationName: 'applicationname', applicationId: 'application.tv', applicationVersion: CONFIG.version, applicationInstallId:'application.tv.installid'} : {});
		Analytics.init(CONFIG.GA ? {ACCOUNT_CODE:CONFIG.GA.account, ssl:CONFIG.GA.ssl} : {});
	});

	return Analytics;

})(Events);
