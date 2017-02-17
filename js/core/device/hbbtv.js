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
 * HbbTV device, overrides Device
 *
 * @author Mautilus s.r.o.
 * @class Device_HbbTV
 * @extends Device
 */

Device_HbbTV = (function (Events) {
	var Device_HbbTV = {
		isHbbTV: true,
		isFireTVPlugin : function() { return navigator.userAgent.indexOf('firetv-firefox-plugin') > -1 ? true : false; }
	};

	$.extend(true, Device_HbbTV, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function (callback, scope) {
			// HbbTV APPLICATION MANAGER AND CONFIGURATION
			this.OIPF_CAP = this.loadObject('oipfCap', {
				type: 'application/oipfCapabilities',
				style: 'position: absolute; left: 0; top: 0; width: 0; height: 0'
			});
			this.OIPF_APP_MAN = this.loadObject('oipfAppMan', {type: 'application/oipfApplicationManager'});
			this.OIPF_CONFIG = this.loadObject('oipfConfig', {type: 'application/oipfConfiguration'});

			// init APP
			try {
				this.APP = this.OIPF_APP_MAN.getOwnerApplication(document);
				this.APP.show();
				this.APP.activate();
			} catch (e) {
				// ignore e.g: SamsungTV
				console.error('bad show or active app by oipfApplicationManager: ' + e);
			}

			// register keyset
			// var keySet = this.APP.privateData.keyset;
			// var mask = keySet.RED | keySet.GREEN | keySet.YELLOW | keySet.BLUE | keySet.NAVIGATION | keySet.VCR | keySet.NUMERIC
			var mask = 0x33F;
			this._setKeyset(mask);

			// override default modules
			this.override();

			this.setKeys();

			if (callback) {
				callback.call(scope || this);
			}
		},

		/**
		 * To set keyset
		 * @private
		 * @param {Number} mask Key set mask
		 */
		_setKeyset: function (mask) {
			// for HbbTV 0.5
			try {
				this.OIPF_CONFIG.keyset.value = mask;
			} catch (e) {
				console.error('bad register keys by oipfConfiguration 1: ' + e);
			}

			try {
				this.OIPF_CONFIG.keyset.setValue(mask);
			} catch (e) {
				console.error('bad register keys by oipfConfiguration 2: ' + e);
			}

			// for HbbTV 1.0
			try {
				this.APP.privateData.keyset.setValue(mask);
				this.APP.privateData.keyset.value = mask;
			} catch (e2) {
				console.error('bad register keys: ' + e);
			}
		},

		/**
		 * @inheritdoc Device#exit
		 */
		exit: function (dvb) {
			try {
				this.APP.destroyApplication();
				return; // destroyApplication() can throw exception, ignore it
			} catch (e) {
				window.close();
			}
		},

		/**
		 * @inheritdoc Device#getFirmware
		 */
		getFirmware: function () {
			// @todo
			return '';
		},
		/**
		 * @inheritdoc Device#getUID
		 */
		getUID: function () {
			// @todo
			return '';
		},
		/**
		 * @inheritdoc Device#getIP
		 */
		getIP: function () {
			// @todo
			return '';
		},
		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function (stripSpaces) {
			// @todo
			name = navigator.userAgent.match(/hbbtv\S*\s\([^\(]*\)/i);   //e.g: HbbTV/1.2.1 (;;;;;)
			return name;
		},
		/**
		 * @inheritdoc Device#getCountry
		 */
		getCountry: function () {
			// @todo
			var country = '';
			return country.toLowerCase();
		},
		/**
		 * @inheritdoc Device#getLanguage
		 */
		getLanguage: function () {
			// @todo
			var language = '';
			return language;
		},
		/**
		 * @inheritdoc Device#getDate
		 */
		getDate: function () {
			return new Date();
		},
		/**
		 * @inheritdoc Device#getTimeZoneOffset
		 */
		getTimeZoneOffset: function () {
			// @todo
			return '';
		},
		/**
		 * @inheritdoc Device#checkNetworkConnection
		 */
		checkNetworkConnection: function (callback, scope) {
			// @todo
		},
		/**
		 * Initialize key codes
		 *
		 * @private
		 */
		setKeys: function () {
			// @todo
			Control.setKeys({
				LEFT: KeyEvent.VK_LEFT,
				RIGHT: KeyEvent.VK_RIGHT,
				UP: KeyEvent.VK_UP,
				DOWN: KeyEvent.VK_DOWN,
				ENTER: KeyEvent.VK_ENTER,
				RETURN: KeyEvent.VK_BACK,
				ZERO: KeyEvent.VK_0,
				ONE: KeyEvent.VK_1,
				TWO: KeyEvent.VK_2,
				THREE: KeyEvent.VK_3,
				FOUR: KeyEvent.VK_4,
				FIVE: KeyEvent.VK_5,
				SIX: KeyEvent.VK_6,
				SEVEN: KeyEvent.VK_7,
				EIGHT: KeyEvent.VK_8,
				NINE: KeyEvent.VK_9,
				RED: KeyEvent.VK_RED,
				GREEN: KeyEvent.VK_GREEN,
				YELLOW: KeyEvent.VK_YELLOW,
				BLUE: KeyEvent.VK_BLUE,
				PLAY: KeyEvent.VK_PLAY,
				PAUSE: KeyEvent.VK_PAUSE,
				STOP: KeyEvent.VK_STOP,
				REC: KeyEvent.VK_RECORD,
				FF: KeyEvent.VK_FAST_FWD,
				RW: KeyEvent.VK_REWIND,
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
		override: function () {
			if (typeof Device_HbbTV_Storage !== 'undefined' && Storage) {
				Storage = $.extend(true, Storage, Device_HbbTV_Storage);
			}
			
			if (typeof Device_HbbTV_Player !== 'undefined' && Player) {
				Player = $.extend(true, Player, Device_HbbTV_Player);
			}
		},
		/**
		 * Load specific JS library or file
		 *
		 * @private
		 * @param {String} src
		 */
		loadJS: function (src) {
			var s = document.createElement('script');
			document.head.appendChild(s);
			s.src = src;
		},
		/**
		 * Load specific OBJECT
		 *
		 * @private
		 * @param {String} id
		 * @param {String|Object} type - type or object of attributes
		 */
		loadObject: function (id, type) {
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
			if (typeof type == 'string') {
				obj.setAttribute('type', type);
			}
			else if (typeof type == 'object') {
				for (var key in type) {
					if (type.hasOwnProperty(key)) {
						obj.setAttribute(key, type[key]);
					}
				}
			}

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

	return Device_HbbTV;

})(Events);