/*
 *******************************************************************************
 * Copyright (c) 2013 Mautilus, s.r.o. (Czech Republic)
 * All rights reserved
 *  
 * Questions and comments should be directed https://github.com/mautilus/sdk/issues
 *
 * You may obtain a copy of the License at LICENSE.txt
 *******************************************************************************
 */

/** 
 * Application bootstrap, device detection and driver loading.
 * This class is called at the beginning of the whole application
 * 
 * @author Mautilus s.r.o.
 * @class Main 
 * @singleton
 */

Main = (function(global) {
	var Main = {
		/**
		 * Initial function
		 * 
		 * @private
		 */
		init: function() {
			var scope = this;
			/**
			 * @property {Array} device remember platform and it's version
			 */            
            this.device = ['default', '']; 

			/**
			 * @property {Boolean} isReady TRUE if the whole environment is ready
			 */
			this.isReady = false;

			/**
			 * @private
			 * @property {Array} stack Callback stack for events. Each item contains Array ['eventname', callback, scope]
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
		 * @param {Function} callback from initialized class
		 * @param {Object} scope from from initialized class 
		 */
		ready: function(callback, scope) {
			this.stack.push(['ready', callback, scope]);

            // when Device initialization is done `Main.onReady` is triggered
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
         * Platform which is called ´default´ is desktop browser or unknown platform
         * 
         * For the forcing HbbTV platform, you have to set CONFIG.HbbTV to true
		 * 
		 * @returns {Array}
		 */
		getDevice: function() {
			if (CONFIG.HbbTV) {
				var name = navigator.userAgent.match(/hbbtv\S*/i);   //e.g: HbbTV/1.2.1
				var nameArr = name ? name[0].split('/') : [];
				var version = nameArr.length > 1 ? nameArr[1] : '';
				return ['hbbtv', version];
			}
			else if (navigator.userAgent.indexOf('Maple 5') >= 0) {
				return ['samsung', '2010'];
			}
			else if (navigator.userAgent.indexOf('Maple 6') >= 0) {
				return ['samsung', '2011'];
			}
			else if (navigator.userAgent.indexOf('SmartTV; Maple2012') >= 0) {
				return ['samsung', '2012'];
			}
			else if (navigator.userAgent.indexOf('SmartTV+2013; Maple2012') >= 0) {
				return ['samsung', '2013'];
			}
			else if (navigator.userAgent.indexOf('SmartTV+2014; Maple2012') >= 0) {
				return ['samsung', '2014'];
			}
			else if (navigator.userAgent.indexOf('SmartTV+2015; Maple2012') >= 0) {
				return ['samsung', '2015'];
			}
			else if (navigator.userAgent.indexOf('Maple') >= 0) {
				return ['samsung', ''];   // to cover the new models comming from future
			}
			else if (navigator.userAgent.indexOf('Tizen') >= 0) {
				if (navigator.userAgent.indexOf('Tizen 2.3') >= 0) {
					return ['tizen', '2015'];
				}
				else if (navigator.userAgent.indexOf('Tizen 2.4.0') >= 0) {
					return ['tizen', '2016'];
				}
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
			else if (navigator.userAgent.indexOf('LG SimpleSmart.TV-2016') >= 0) {
				return ['lg', '2016'];
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
			else if (navigator.userAgent.indexOf('Web0S') >= 0 && navigator.userAgent.indexOf('537.41') >= 0) {
				return ['webos', '1.x'];
			}
			else if (navigator.userAgent.indexOf('Web0S') >= 0 && navigator.userAgent.indexOf('538.2') >= 0) {
				return ['webos', '2.x'];
			}
			else if (navigator.userAgent.indexOf('Web0S') >= 0 && navigator.userAgent.indexOf('537.36') >= 0) {
				return ['webos', '3.x'];
			}
			else if(navigator.userAgent.indexOf('Web0S') >= 0) {
				return ['webos', ''];  // to cover the new models comming from future
			}
			else if (navigator.userAgent.indexOf('Crosswalk') >= 0) {
				return ['android', ((Android && Android.getManufacturer) ? Android.getManufacturer() : '')];
			}
			else if (navigator.userAgent.indexOf('Hisense') >= 0) {
				return ['hisense', ''];
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
         * event handler when the whole environment is ready. After that all classes in stack are also initialized 
         * 
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
         * event handler after the DOM is ready
         * 
		 * @private
		 */
		onLoad: function() {
			this.initDevice();
		},
		/**
         * event handler when unload JavaScript event is triggered
         * 
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