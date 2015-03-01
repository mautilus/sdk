/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Dune HD device, overrides Device
 * 
 * @author Mautilus s.r.o.
 * @class Device_Dunehd
 * @extends Device
 */

Device_Dunehd = (function(Events) {
    var Device_Dunehd = {isDUNEHD: true};

    $.extend(true, Device_Dunehd, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, scope) {
			var self = this;

			this.API = this.loadObject('STBAPI', 'application/x-dune-stb-api');

			if (typeof this.API.init !== 'function') {
				throw new Error('STB API initialization failed');
			}

			this.API.setScreenSize(this.API.SCREEN_SIZE_1280_720);

			this.API.init();

			window.onunload = function() {
				self.API.deinit();
			};

			// override default modules
			this.override();

			this.setKeys();

			if (callback) {
				callback.call(scope || this);
			}
		},
		/**
		 * @inheritdoc Device#exit
		 */
		exit: function(dvb) {
			this.API.exitBrowser(this.API.EXIT_BROWSER_MODE_STANDBY);
		},
		/**
		 * @inheritdoc Device#getFirmware
		 */
		getFirmware: function() {
			return this.API.getFirmwareVersion();
		},
		/**
		 * @inheritdoc Device#getUID
		 */
		getUID: function() {
			return String(this.API.getMacAddress()).replace(/\:/g, '').toUpperCase();
		},
		/**
		 * @inheritdoc Device#getIP
		 */
		getIP: function() {
			return this.API.getIpAddress();
		},
		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
			var name = 'Dune HD ' + this.API.getProductId();

			if (stripSpaces) {
				name = name.replace(/\s/g, '');
			}

			return name;
		},
		/**
		 * @inheritdoc Device#getCountry
		 */
		getCountry: function() {
			return false;
		},
		/**
		 * @inheritdoc Device#getLanguage
		 */
		getLanguage: function() {
			return String(navigator.language || navigator.userLanguage).toLowerCase();
		},
		/**
		 * @inheritdoc Device#getDate
		 */
		getDate: function() {
			return new Date();
		},
		/**
		 * @inheritdoc Device#getTimeZoneOffset
		 */
		getTimeZoneOffset: function() {
			return false;
		},
		/**
		 * @inheritdoc Device#checkNetworkConnection
		 */
		checkNetworkConnection: function(callback, scope) {
			var network = this.API.getNetworkStatus(), status = false;

			try {
				if (typeof network !== 'object') {
					eval('network = ' + network);
				}
			} catch (e) {

			}

			if (network instanceof Array && network) {
				for (var i in network) {
					if (network[i] && network[i].running === 1) {
					status = true;
					break;
					}
				}
			}

			if (callback) {
				callback.call(scope || this, status);
			}
		},
		/**
		 * Initialize key codes
		 *
		 * @private
		 */
		setKeys: function() {
			Control.setKeys({
			LEFT: 37,
			RIGHT: 39,
			UP: 38,
			DOWN: 40,
			ENTER: 13,
			RETURN: 8,
			ZERO: 48,
			ONE: 49,
			TWO: 50,
			THREE: 51,
			FOUR: 52,
			FIVE: 53,
			SIX: 54,
			SEVEN: 55,
			EIGHT: 56,
			NINE: 57,
			RED: 193,
			GREEN: 194,
			YELLOW: 195,
			BLUE: 196,
			PLAY: 250,
			PAUSE: -1,
			PLAYPAUSE: 218,
			STOP: 178,
			REC: 208,
			FF: 205,
			RW: 204,
			TOOLS: -1,
			PUP: 33,
			PDOWN: 34,
			CHLIST: -1,
			PRECH: -1,
			TXTMIX: -1,
			FAVCH: -1,
			EXIT: -1,
			INFO: 199,
			VDOWN: 174, //volume down
			VUP: 175, //volume up
			AUDIO: 207,
			MUTE: 173,
			CLEAR: 12
			});
		},
		/**
		 * Override default modules
		 * 
		 * @private
		 */
		override: function() {
			if (typeof Device_Dunehd_Player !== 'undefined' && Player) {
				Player = $.extend(true, Player, Device_Dunehd_Player);
			}
			if (typeof Device_Dunehd_Storage !== 'undefined' && Storage) {
				Storage = $.extend(true, Storage, Device_Dunehd_Storage);
			}

		},
		/**
		 * Load specific JS library or file
		 * 
		 * @private
		 * @param {String} src
		 */
		loadJS: function(src) {
			var s = document.createElement('script');
			document.head.appendChild(s);
			s.src = src;
		},
		/**
		 * Load specific OBJECT
		 * 
		 * @private
		 * @param {String} id
		 * @param {String} clsid
		 */
		loadObject: function(id, type) {
			var objs = document.getElementsByTagName('object');

			if (objs) {
				for (var i in objs) {
					if (objs[i] && objs[i].id === id) {
					return objs[i];
					}
				}
			}

			var obj = document.createElement('object');
			obj.id = id;
			obj.style.visibility = 'hidden';
			obj.setAttribute('type', type);

			document.body.appendChild(obj);

			return obj;
		}
    });

    if (typeof document.head === 'undefined') {
		document.head = document.getElementsByTagName('head')[0];
    }

    if (typeof document.body === 'undefined') {
		document.body = document.getElementsByTagName('body')[0];
    }

    return Device_Dunehd;

})(Events);