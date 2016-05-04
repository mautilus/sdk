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
 * Panasonic Viera device, overrides Device
 * 
 * @author Mautilus s.r.o.
 * @class Device_Viera
 * @extends Device
 */

Device_Viera = (function(Events) {
    var Device_Viera = {isVIERA: true};

    $.extend(true, Device_Viera, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, cbscope) {
			this.userAgentInfo = String(navigator.userAgent).match(/(viera)\/([\d\.\-\_]+)/i);
		  this.year = '2013';
		  if(navigator.userAgent.indexOf('Viera\/1\.') >= 0){
			this.year = '2012';
		  }
		  else if(navigator.userAgent.indexOf('Viera\/3\.') >= 0){
			this.year = '2013';
		  }

			this.override();

			this.setKeys();

			if (callback) {
			callback.call(cbscope || this);
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
			var name = 'Panasonic Viera';

			name += ' ' + this.getFirmware();

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
		if(this.year == '2012'){
			Control.setKeys({
				LEFT: 37,
				RIGHT: 39,
				UP: 38,
				DOWN: 40,
				ENTER: 13,
				RETURN: 8,
				ZERO: 96,
				ONE: 97,
				TWO: 98,
				THREE: 99,
				FOUR: 100,
				FIVE: 101,
				SIX: 102,
				SEVEN: 103,
				EIGHT: 104,
				NINE: 105,
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
				PUP: -1,
				PDOWN: -1,
				CHLIST: -1,
				PRECH: -1,
				TXTMIX: -1,
				FAVCH: -1,
				EXIT: -1,
				INFO: -1
			});
		}
		else if(this.year == '2013'){
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
				PUP: -1,
				PDOWN: -1,
				CHLIST: -1,
				PRECH: -1,
				TXTMIX: -1,
				FAVCH: -1,
				EXIT: -1,
				INFO: -1
			});
		}
	},
	/**
	 * Override default modules
	 * 
	 * @private
	 */
	override: function() {
	    if (this.year == '2012' && typeof Device_Viera2012_Storage !== 'undefined' && Storage) {
			Storage = $.extend(true, Storage, Device_Viera2012_Storage);
			}
		}
    });

    if (typeof document.head === 'undefined') {
		document.head = document.getElementsByTagName('head')[0];
    }

    if (typeof document.body === 'undefined') {
		document.body = document.getElementsByTagName('body')[0];
    }

    return Device_Viera;

})(Events);