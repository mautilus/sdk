/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Vestel device, overrides Device. Holds initialisation and all basic stuff about this device.
 *  
 * [Player](#!/api/Player) is extended by [Device_Vestel_Player_Old](#!/api/Device_Vestel_Player_Old).
 * 
 * [Device_Vestel_Player_New](#!/api/Device_Vestel_Player_New) is prepared for new firmware that supports DRM 
 * 
 * 
 * @author Mautilus s.r.o.
 * @class Device_Vestel
 * @extends Device
 */

Device_Vestel = (function(Events) {
	var Device_Vestel = {};

	$.extend(true, Device_Vestel, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, cbscope) {
			var scope = this;

			scope.override();
			scope.setKeys();

			if (callback) {
				callback.call(cbscope || scope);
			}
			return;
		},

		/**
		 * @inheritdoc Device#exit
		 */
		exit: function() {
			window.close();
		},

		/**
		 * @inheritdoc Device#getFirmware
		 */
		getFirmware: function() {
			var match = String(navigator.userAgent).match(/Firmware\/([\d\.\-\_]+)/);
			if (match) {
				return match[1];
			} else {
				return '';
			}
		},

		/**
		 * @inheritdoc Device#getUID
		 */
		getUID: function() {

			return null;
		},

		/**
		 * @inheritdoc Device#getIP
		 */
		getIP: function() {
			return null;
		},

		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
			var match = String(navigator.userAgent).match(/CUS:(\w+); \w+; ([\w\.]+);/);
			if (match) {
				return match[1]+' '+match[2];
			} else {
				var match = String(navigator.userAgent).match(/CUS:(\w+);/);
				if (match) {
					return match[1];
				} else {
					return 'Vestel/GoGen/Vestel';
				}
			}
		},

		/**
		 * @inheritdoc Device#getCountry
		 */
		getCountry: function() {
			return null;
		},

		/**
		 * @inheritdoc Device#getLanguage
		 */
		getLanguage: function() {
			return navigator.language;
		},

		/**
		 * @inheritdoc Device#getDate
		 */
		getDate: function() {
			var date;

			try {
				date = this.TIME.getEpochTime() * 1000;

			} catch (e) {
				date = new Date().getTime();
			}

			return new Date(date);
		},

		/**
		 * @inheritdoc Device#getTimeZoneOffset
		 */
		getTimeZoneOffset: function() {
			return null;
		},

		/**
		 * @inheritdoc Device#checkNetworkConnection
		 */
		checkNetworkConnection: function(callback, scope) {
			return null;
		},

		/**
		 * Initialize key codes
		 *
		 * @private
		 */
		setKeys: function() {

			Control.setKeys({
				LEFT: VK_LEFT,
				RIGHT: VK_RIGHT,
				UP: VK_UP,
				DOWN: VK_DOWN,
				ENTER: 13,
				RETURN: 9999,
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
				REC: 416,
				FF: 417,
				RW: 412,
				TOOLS: -1,
				PUP: -1,
				PDOWN: -1,
				CHLIST: -1,
				PRECH: -1,
				TXTMIX: -1,
				FAVCH: -1,
				EXIT: -1,
				INFO: -1
			});
		},

		/**
		 * Override default modules
		 * 
		 * @private
		 */
		override: function() {
			history.pushState(0, null);
			window.addEventListener('popstate', function (event, state) {
				event.keyCode = Control.key.RETURN;
				Control.onKeyDown(event);
				history.pushState(0, null);
			});

			// old vestel player - not drm agent, but url-based
			if (typeof Device_Vestel_Player_Old !== 'undefined' && Player) {
				Player = $.extend(true, Player, Device_Vestel_Player_Old);
			}
		},
	});

	if (typeof document.head === 'undefined') {
		document.head = document.getElementsByTagName('head')[0];
	}

	if (typeof document.body === 'undefined') {
		document.body = document.getElementsByTagName('body')[0];
	}

	return Device_Vestel;

})(Events);