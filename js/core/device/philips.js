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
 * Philips device, overrides Device
 *
 * @author Mautilus s.r.o.
 * @class Device_Philips
 * @extends Device
 */

Device_Philips = (function(Events) {
	var Device_Philips = {
		isPHILIPS: true
	};

	$.extend(true, Device_Philips, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, scope) {
			var onShow;

			onShow = function() {
				if (callback) {
					callback.call(scope || this);
				}
			};

			this.userAgentInfo = String(navigator.userAgent).match(/NETTV\/([\d\.\-\_]+)/);

			// override default modules
			this.override();

			this.setKeys();

			// on some newer versions, there is the green outline around focused element,
			// this prevent this outline from showing
			Control.on('beforekey', function(keyCode, ev) {
				if (Control.isNavigational(keyCode)) {
					ev.preventDefault();
				}
			});

			window.onShow = onShow;

			// window.onShow method doesn't work in emulator
			setTimeout(function() {
				onShow();
			}, 3000);
		},
		/**
		 * @inheritdoc Device#exit
		 */
		exit: function(dvb) {
			window.close();
		},
		/**
		 * @inheritdoc Device#getFirmware
		 */
		getFirmware: function() {
			return this.userAgentInfo[1] || 'N/A';
		},
		/**
		 * @inheritdoc Device#getUID
		 */
		getUID: function() {
			var getUUID = function(a) {
				return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, getUUID)
			},
				uuid;

			if (window.localStorage) {
				uuid = window.localStorage.getItem('philipsUUID');

				if (uuid) {
					return uuid;
				}
			}

			uuid = getUUID();

			if (window.localStorage) {
				window.localStorage.setItem('philipsUUID', uuid);
			}

			return uuid;
		},
		/**
		 * @inheritdoc Device#getIP
		 */
		getIP: function() {
			return false;
		},
		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
			var name = 'Philips TV ' + this.getFirmware();

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
			if (callback) {
				callback.call(scope || this, true);
			}

			return false;
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
				ENTER: VK_ENTER,
				RETURN: VK_BACK,
				ZERO: VK_0,
				ONE: VK_1,
				TWO: VK_2,
				THREE: VK_3,
				FOUR: VK_4,
				FIVE: VK_5,
				SIX: VK_6,
				SEVEN: VK_7,
				EIGHT: VK_8,
				NINE: VK_9,
				RED: VK_RED,
				GREEN: VK_GREEN,
				YELLOW: VK_YELLOW,
				BLUE: VK_BLUE,
				PLAY: VK_PLAY,
				PAUSE: VK_PAUSE,
				STOP: VK_STOP,
				REC: -1,
				FF: VK_FAST_FWD,
				RW: VK_REWIND,
				TOOLS: -1,
				PUP: VK_PAGE_UP,
				PDOWN: VK_PAGE_DOWN,
				CHLIST: -1,
				PRECH: -1,
				TXTMIX: -1,
				FAVCH: -1,
				EXIT: -1,
				INFO: VK_INFO
			});
		},
		/**
		 * Override default modules
		 *
		 * @private
		 */
		override: function() {
			if (typeof Device_Philips_Player !== 'undefined' && Player) {
				Player = $.extend(true, Player, Device_Philips_Player);
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

	return Device_Philips;

})(Events);