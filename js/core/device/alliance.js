/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Smart TV Alliance device, overrides Device
 * 
 * @author Mautilus s.r.o.
 * @class Device_Alliance
 * @extends Device
 */

Device_Alliance = (function(Events) {
    var Device_Alliance = {isALLIANCE: true};

    $.extend(true, Device_Alliance, Events, {
		/**
		 * @property {Object} oipfAppMgr OIPF App Mgr object 
		 */
		oipfAppMgr: null,
		/**
		 * @property {Object} oipfConfig OIPF Configuration object 
		 */
		oipfConfig: null,
		/**
		 * @property {Object} oipfDrmAgent OIPF DRMAgent object 
		 */
		oipfDrmAgent: null,
		/**
		 * @property {Object} app OIPF ownerApplication
		 */
		app: null,
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, cbscope) {
			var scope = this, checkOipf, keyset;
			
			this.userAgentInfo = String(navigator.userAgent).match(/(toshibatp|smarttv)\/([\d\.\-\_]+)/i);

			checkOipf = function() {
				if (typeof oipfObjectFactory !== 'undefined') {
					scope.initOipfObjects();

					scope.app = scope.oipfAppMgr.getOwnerApplication(document);
					
					keyset = scope.app.privateData.keyset;
					
					keyset.setValue(keyset.NAVIGATION | keyset.VCR | keyset.SCROLL | keyset.INFO | keyset.NUMERIC | keyset.RED | keyset.GREEN | keyset.YELLOW | keyset.BLUE);
					
					// override default modules
					scope.override();
				
					scope.setKeys();

					if (callback) {
						callback.call(cbscope || scope);
					}
					
					return;
				}

				setTimeout(function() {
					checkOipf();
				}, 50);
			};

			checkOipf();
			
			// prevent default actions
			Control.on('beforekey', function(keyCode, ev) {
				ev.preventDefault();
			});
		},
		/**
		 * @private
		 */
		initOipfObjects: function() {
			if (oipfObjectFactory.isObjectSupported('application/oipfApplicationManager')) {
				this.oipfAppMgr = oipfObjectFactory.createApplicationManagerObject();
			}

			if (oipfObjectFactory.isObjectSupported('application/oipfConfiguration')) {
				this.oipfConfig = oipfObjectFactory.createConfigurationObject();
			}

			if (oipfObjectFactory.isObjectSupported('application/oipfDrmAgent')) {
				this.oipfDrmAgent = oipfObjectFactory.createDrmAgentObject();
			}

			if (!this.oipfAppMgr || typeof this.oipfAppMgr.getOwnerApplication === 'undefined') {
				throw new Error('Failed to load oipfApplicationManager object');
			}
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
			return this.userAgentInfo ? this.userAgentInfo[2] : 'N/A';
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
		 * @inheritdoc Device#getIP
		 */
		getIP: function() {
			return false;
		},
		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
			var name = 'SmartTv', m;

			m = navigator.userAgent.match(/(toshiba|SmartTv)/i);

			if (m && m[1]) {
				name = m[1];
			}

			name += ' '+this.getFirmware();

			if (stripSpaces) {
				name = name.replace(/\s/g, '');
			}

			return name;
		},
		/**
		 * @inheritdoc Device#getCountry
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
		 * @inheritdoc Device#getLanguage
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
			if (typeof Device_Alliance_Player !== 'undefined' && Player) {
				Player = $.extend(true, Player, Device_Alliance_Player);
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

    return Device_Alliance;

})(Events);