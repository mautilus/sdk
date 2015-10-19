/*
 * Mautilus, s.r.o., 2013
 * This file is part of MAUTILUS SMART TV SDK
 * 
 * Questions and comments should be directed to info@mautilus.com 
 * 
 * ======================================================================
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 * PARTICULAR PURPOSE.
 * ===================
 */

/** 
 * Application bootstrap, device detection and driver loading
 * 
 * @author Mautilus s.r.o.
 * @class Main 
 * @singleton
 */

Main = (function(global) {
	var Main = {
		init: function() {
			var scope = this;

			/**
			 * @property {Boolean} isReady TRUE if the whole environment is ready
			 */
			this.isReady = false;

			/**
			 * @private
			 * @property {Array} stack Callback stack for events
			 */
			this.stack = [];

			if (typeof jQuery === 'undefined') {
				throw new Error('jQuery is not loaded');
			}

			jQuery(document).ready(function() {
				scope.onLoad();
			});

			jQuery(window).unload(function() {
				scope.onUnload();
			});
		},
		/**
		 * Push new callback to the onReady event
		 * 
		 * @chainable
		 * @param {Function} callback
		 * @param {Object} scope
		 */
		ready: function(callback, scope) {
			this.stack.push(['ready', callback, scope]);

			if (this.isReady) {
				this.onReady();
			}

			return this;
		},
		/**
		 * Push new callback to the onUnload event
		 * 
		 * @chainable
		 * @param {Function} callback
		 * @param {Object} scope
		 */
		unload: function(callback, scope) {
			this.stack.push(['unload', callback, scope]);
			return this;
		},
		/**
		 * Detects runtime platform and it's version, e.g. ['samsung', '2013']
		 * 
		 * @returns {Array}
		 */
		getDevice: function() {

			if (navigator.userAgent.indexOf('Maple 5') >= 0) {
				return ['samsung', '2010'];
			}
			else if (navigator.userAgent.indexOf('Maple 6') >= 0) {
				return ['samsung', '2011'];
			}
			else if (navigator.userAgent.indexOf('SmartTV; Maple2012') >= 0) {
				return ['samsung', '2012'];
			}
			else if (navigator.userAgent.indexOf('Maple') >= 0) {
				return ['samsung', '2013'];
			}
			else if (navigator.userAgent.indexOf('SmartTV+2014; Maple2012') >= 0) {
				return ['samsung', '2014'];
			}
			else if (navigator.userAgent.indexOf('SmartTV+2015; Maple2012') >= 0) {
				return ['samsung', '2015'];
			}
			else if (navigator.userAgent.indexOf('Tizen') >= 0) {
				return ['tizen', '2015'];
			}
			else if (navigator.userAgent.indexOf('LG NetCast.TV-2011') >= 0) {
				return ['lg', '2011'];
			}
			else if (navigator.userAgent.indexOf('LG NetCast.TV-2012') >= 0) {
				return ['lg', '2012'];
			}
			else if (navigator.userAgent.indexOf('LG NetCast.TV') >= 0) {
				return ['lg', '2013'];
			}
			else if (navigator.userAgent.indexOf('NETTV\/3') >= 0) {
				return ['philips', '2011'];
			}
			else if (navigator.userAgent.indexOf('NETTV\/4\.0') >= 0) {
				return ['philips', '2012'];
			}
			else if (navigator.userAgent.indexOf('NETTV\/') >= 0) {
				return ['philips', '2013'];
			}
			else if (navigator.userAgent.indexOf('DuneHD\/') >= 0) {
				return ['dunehd', ''];
			}
			else if (navigator.userAgent.indexOf('Viera\/1\.') >= 0) {
				return ['viera', '2012'];
			}
			else if (navigator.userAgent.indexOf('Viera\/3\.') >= 0) {
				return ['viera', '2013'];
			}
			else if (navigator.userAgent.indexOf('SmartTvA\/') >= 0) {
				return ['alliance', 'generic'];
			}
			else if (navigator.userAgent.indexOf('ToshibaTP\/') >= 0) {
				return ['alliance', 'toshiba'];
			}
			else if (navigator.userAgent.match(/playstation 3/gi)) {
				return ['playstation', '3'];
			}
			else if (navigator.userAgent.match(/playstation 4/gi)) {
				return ['playstation', '4'];
			}
			else if (navigator.userAgent.indexOf('Web0S') >= 0) {
				return ['webos', ''];
			}
			else if (navigator.userAgent.indexOf('Crosswalk') >= 0) {
				return ['android', ''];
			}

			return ['default', ''];
		},
		/**
		 * Extends global `Device` with a platform specific device class
		 * when driver is loaded, method `Main.onReady` is triggered
		 * 
		 * @private
		 */
		initDevice: function() {
			this.device = this.getDevice();
			var driverName = String(this.device[0]).substr(0, 1).toUpperCase() + String(this.device[0]).substr(1);

			global.Device = $.extend(true, global.Device, global['Device_' + driverName] || {});

			global.Device.init(function() {
				this.onReady();
			}, this);
		},
		/**
		 * @private
		 */
		onReady: function() {
			this.isReady = true;

			if (this.stack) {
				for (var i in this.stack) {
					if (this.stack.hasOwnProperty(i) && this.stack[i] && this.stack[i][0] === 'ready' && typeof this.stack[i][1] === 'function') {
						this.stack[i][1].call(this.stack[i][2] || this);
						this.stack[i] = null;
					}
				}
			}
		},
		/**
		 * @private
		 */
		onLoad: function() {
			this.initDevice();
		},
		/**
		 * @private
		 */
		onUnload: function() {
			if (this.stack) {
				for (var i in this.stack) {
					if (this.stack.hasOwnProperty(i) && this.stack[i] && this.stack[i][0] === 'unload' && typeof this.stack[i][1] === 'function') {
						this.stack[i][1].call(this.stack[i][2] || this);
						this.stack[i] = null;
					}
				}
			}
		}
	};

	Main.init();

	return Main;

})(this);