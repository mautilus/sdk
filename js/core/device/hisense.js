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
 * Hisense device, overrides Device
 * 
 * @author Mautilus s.r.o.
 * @class Device_Hisense
 * @extends Device
 */

Device_Hisense = (function(Events) {
    var Device_Hisense = {
    	isHISENSE: true
    };

    $.extend(true, Device_Hisense, Events, {
		/**
		 * @inheritdoc SDK_Device#init
		 */
		init: function(callback, cbscope) {
			this.TV = this.loadObject('Config', 'application/oipfConfiguration').localSystem;

			if (callback) {
				callback.call(cbscope || this);
			}

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
				RED: 403,
				GREEN: 404,
				YELLOW: 405,
				BLUE: 406,
				PLAY: 415,
				PAUSE: 19,
				STOP: 413,
				REC: -1,
				FF: 417,
				RW: 412,
				TOOLS: -1,
				PUP: 427,
				PDOWN: 428,
				CHLIST: -1,
				PRECH: -1,
				TXTMIX: -1,
				FAVCH: -1,
				EXIT: -1,
				INFO: -1
			});
		},
		/**
		 * Returns general device information in text format
		 *
		 * @returns {String}
		 */
		getInfo: function() {
			return "Version:    " + (CONFIG.version || "not-available") + "\nDevice:     " + SDK.getPlatform().join(' ') + "\nName:       " + this.getDeviceName() + "\nModel name: " + this.getModelName() + "\nUID:        " + this.getUID() + "\nIP address: " + this.getIP() + "\nFirmware:   " + this.getFirmware() + "\nCountry:    " + this.getCountry() + "\nLanguage:   " + this.getLanguage() + "\nDate:       " + this.getDate() + "\nLocation:   " + window.location + "\nUserAgent:  " + navigator.userAgent;
		},
		/**
		 * @inheritdoc SDK_Device#getFirmware
		 */
		getFirmware: function() {
			if (this.TV && this.TV.softwareVersion) {
				return this.TV.softwareVersion;
			}
			return '';
		},
		/**
		 * @inheritdoc SDK_Device#getUID
		 */
		getUID: function() {
			if (this.TV && this.TV.deviceID) {
				return this.TV.deviceID;
			}

			var getUUID = function(a) {
					return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, getUUID);
				},
				uuid;

			if (window.localStorage) {
				uuid = window.localStorage.getItem('_uuid');

				if (uuid) {
					return uuid;
				}
			}

			uuid = getUUID();

			if (window.localStorage) {
				window.localStorage.setItem('_uuid', uuid);
			}

			return uuid;
		},
		/**
		 * @inheritdoc SDK_Device#getIP
		 */
		getIP: function() {
			return false;
		},
		/**
		 * @inheritdoc SDK_Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
			var name = 'Hisense ' + ((this.TV && this.TV.hardwareVersion) ? this.TV.hardwareVersion : this.getFirmware());

			if (stripSpaces) {
				name = name.replace(/\s/g, '');
			}

			return name;
		},
		/**
		 * @inheritdoc SDK_Device#getModelName
		 */
		getModelName: function() {
			if (this.TV && this.TV.hardwareVersion) {
				return this.TV.hardwareVersion;
			}
			return 'hisense';
		},
		/**
		 * @inheritdoc SDK_Device#getCountry
		 */
		getCountry: function() {
			var country = null;

			try {
				country = String(window.navigator.language).toLowerCase().split('-')[1];

			} catch (e) {

			}

			return country;
		},
		/**
		 * @inheritdoc SDK_Device#getLanguage
		 */
		getLanguage: function() {
			var language = null;

			try {
				language = String(window.navigator.language).toLowerCase();

			} catch (e) {

			}

			return language;
		},
		/**
		 * @inheritdoc SDK_Device#getDate
		 */
		getDate: function() {
			return new Date();
		},
		/**
		 * @inheritdoc SDK_Device#getTimeZoneOffset
		 */
		getTimeZoneOffset: function() {
			return false;
		},
		/**
		 * @inheritdoc SDK_Device#exit
		 */
		exit: function(dvb) {
			window.close();
		},
		/**
		 * @inheritdoc SDK_Device#checkNetworkConnection
		 */
		checkNetworkConnection: function(callback, scope) {
			if (callback) {
				callback.call(scope || this, true);
			}

			return false;
		},
		/**
		 * Load specific OBJECT
		 *
		 * @private
		 * @param {String} id
		 * @param {String} clsid
		 */
		loadObject: function(id, clsid) {
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
			obj.setAttribute('type', clsid);

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

    return Device_Hisense;

})(Events);