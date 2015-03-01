/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * LG device, overrides Device
 * 
 * @author Mautilus s.r.o.
 * @class Device_Lg
 * @extends Device
 */

Device_Lg = (function(Events) {
    var Device_Lg = {isLG: true};

    $.extend(true, Device_Lg, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, scope) {
			this.DEVICE = this.loadObject('DEVICE', 'application/x-netcast-info');
			this.DRMAGENT = document.getElementById("drmAgent");

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
			if (dvb) {
				window.NetCastExit();

			} else {
				window.NetCastBack();
			}
		},
		/**
		 * Display Q.Menu
		 */
		qmenu: function() {
			window.NetCastLaunchQMENU();
		},
		/**
		 * @inheritdoc Device#getFirmware
		 */
		getFirmware: function() {
			return this.DEVICE.swVersion;
		},
		/**
		 * @inheritdoc Device#getUID
		 */
		getUID: function() {
			return String(this.DEVICE.net_macAddress).replace(/\:/g, '').toUpperCase();
		},
		/**
		 * @inheritdoc Device#getIP
		 */
		getIP: function() {
			return this.DEVICE.net_ipAddress;
		},
		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
			var name = this.DEVICE.manufacturer + ' ' + this.DEVICE.modelName;

			if (stripSpaces) {
				name = name.replace(/\s/g, '');
			}

			return name;
		},
		/**
		 * @inheritdoc Device#getCountry
		 */
		getCountry: function() {
			return String(this.DEVICE.tvCountry2 || 'en').toLowerCase();
		},
		/**
		 * @inheritdoc Device#getLanguage
		 */
		getLanguage: function() {
			return this.DEVICE.tvLanguage2 || 'en-us';
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
			return this.DEVICE.timeZone;
		},
		/**
		 * @inheritdoc Device#checkNetworkConnection
		 */
		checkNetworkConnection: function(callback, scope) {
			if (callback) {
				callback.call(scope || this, this.DEVICE.net_isConnected || false);
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
			RETURN: 461,
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
			NUMERIC_ZERO: 96,   // keyCode of numeric keys on External USB keyboard
			NUMERIC_ONE: 97,
			NUMERIC_TWO: 98,
			NUMERIC_THREE: 99,
			NUMERIC_FOUR: 100,
			NUMERIC_FIVE: 101,
			NUMERIC_SIX: 102,
			NUMERIC_SEVEN: 103,
			NUMERIC_EIGHT: 104,
			NUMERIC_NINE: 105,
			RED: 403,
			GREEN: 404,
			YELLOW: 405,
			BLUE: 406,
			PLAY: 415,
			PAUSE: 19,
			STOP: 413,
			REC: 416,
			FF: 417,
			RW: 412,
			TOOLS: -1,
			PUP: 33,
			PDOWN: 34,
			CHLIST: -1,
			PRECH: -1,
			TXTMIX: -1,
			FAVCH: -1,
			EXIT: -1,
			INFO: 457
			});
		},
		/**
		 * Override default modules
		 * 
		 * @private
		 */
		override: function() {
			// use cookies only if tv does not support localStorage feature
			if (typeof Device_Lg_Storage !== 'undefined' && Storage && !("localStorage" in window && typeof localStorage.getItem === "function")) {
				Storage = $.extend(true, Storage, Device_Lg_Storage);
			}

			if (typeof Device_Lg_Player !== 'undefined' && Player) {
				Player = $.extend(true, Player, Device_Lg_Player);
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

    return Device_Lg;

})(Events);