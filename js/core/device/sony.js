/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Toshiba device, overrides Device. Holds initialisation and all basic stuff about this device.
 *  
 * [Player](#!/api/Player) is extended by [Device_Sony_Player](#!/api/Device_Sony_Player).
 * 
 * [Device_Sony_Input](#!/api/Device_Sony_Input) and [Device_Sony_Keyboard](#!/api/Device_Sony_Keyboard) are commented out
 * 
 * 
 * @author Mautilus s.r.o.
 * @class Device_Sony
 * @extends Device
 */

Device_Sony = (function(Events) {
	var Device_Sony = {};

	$.extend(true, Device_Sony, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, scope) {
			var self = this, onShow, onShowCalled = false, onLoad;

			// override default modules
			this.override();

			onShow = function() {
				if (onShowCalled) {
					return;
				}

				onShowCalled = true;

				self.setKeys();

				if (callback) {
					callback.call(scope || self);
				}
			};

			onLoad = function() {

				// this event should be called right after everything is ready and window is shown
				window.onShow = onShow;

				// window.onShow method doesn't work in emulator
				setTimeout(function() {
					onShow();
				}, 2000);
			};

			// checks if API libraries are loaded and ready, if not, its called again later
			onLoad();
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
			return 'Sony';
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
				YELLOW: 502,
				BLUE: 406,
				PLAY: 415,
				PAUSE: 19,
				STOP: 413,
				REC: -1,
				FF: 465,
				RW: 412,
				TOOLS: -1,
				PUP: -1,
				PDOWN: -1,
				CHLIST: -1,
				PRECH: -1,
				TXTMIX: -1,
				FAVCH: -1,
				EXIT: -1,
				INFO: 469
			});
		},

		/**
		 * Override default modules
		 * 
		 * @private
		 */
		override: function() {
			
			// sony is using cookies only
			if (typeof Device_Sony_Storage !== 'undefined' && Storage) {
				Storage = $.extend(true, Storage, Device_Sony_Storage);
			}


			if (typeof Device_Sony_Player !== 'undefined' && Player) {
				Player = $.extend(true, Player, Device_Sony_Player);
			}
/*
			// rewrite input
			if (typeof Device_Sony_Input !== 'undefined' && Input) {
				Input = Device_Sony_Input;
			}

			// rewrite keyboard
			if (typeof Device_Sony_Keyboard !== 'undefined' && Keyboard) {
				Keyboard = new Device_Sony_Keyboard;
			}
*/
		},

		/**
		 * Load specific JS library or file
		 * 
		 * @private
		 * @param {String} src
		 */
		loadJS: function(src) {
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
			obj.setAttribute('classid', clsid);

			document.body.appendChild(obj);

			return obj;
		},
	});

	if (typeof document.head === 'undefined') {
		document.head = document.getElementsByTagName('head')[0];
	}

	if (typeof document.body === 'undefined') {
		document.body = document.getElementsByTagName('body')[0];
	}

	return Device_Sony;

})(Events);