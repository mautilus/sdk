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
 * Default platform device
 * 
 * @author Mautilus s.r.o.
 * @class Device
 * @mixins Events
 */

Device = (function(Events) {
    var Device = {
    	// states for all devices
		isDEFAULT: false,
        isANDROID: false,
		isLG: false,
		isSAMSUNG: false,
		isTIZEN: false,
		isPHILIPS: false,
		isDUNEHD: false,
		isVIERA: false,
		isPlaystation: false,
		isWEBOS: false
    };

    $.extend(true, Device, Events, {
		/**
		 * Initialize device
		 * 
		 * @param {Function} callback
		 * @param {Object} scope
		 */
		init: function(callback, scope) {
			Control.setKeys({
				RIGHT: 39,
				LEFT: 37,
				UP: 38,
				DOWN: 40,
				RETURN: 8,
				ENTER: 13,
				PLAY: 415,
				PAUSE: 19,
				STOP: 413,
				FF: 417,
				RW: 412,
				RED: 403,
				GREEN: 404,
				YELLOW: 405,
				BLUE: 406,
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
				PUP: 33,
				PDOWN: 34,
				PRECH: 46, // Delete
				TXTMIX: 110 // ,Del
			});

			this.isDEFAULT = true; // set default device

			if (callback) {
				callback.call(scope || this);
			}
		},
		/**
		 * Returns firmware version
		 * 
		 * @returns {String}
		 */
		getFirmware: function() {
			return 'N/A';
		},
		/**
		 * Returns unique device ID (MAC address)
		 * 
		 * @returns {String}
		 */
		getUID: function() {
			return '10000000ABCD';
		},
		/**
		 * Returns device IP address
		 * 
		 * @returns {String}
		 */
		getIP: function() {
			return '0.0.0.0';
		},
		/**
		 * Returns device name and model code
		 * 
		 * @param {Boolean} stripSpaces TRUE for strip empty chars
		 * @returns {String} name of device
		 */
		getDeviceName: function(stripSpaces) {
			return 'default3';
		},
		/**
		 * Returns device country
		 * 
		 * @returns {String} Should be in ISO 3166-1 alpha-2 (cz, gb,...)
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
		 * Returns device language
		 * 
		 * @returns {String} Should be in ISO 639-1 (en-gb, cs-cz,...)
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
		 * Returns new Date object
		 * 
		 * @returns {Date}
		 */
		getDate: function() {
			return new Date();
		},
		/**
		 * Returns an time zone offset in minutes
		 * 
		 * @returns {Number}
		 */
		getTimeZoneOffset: function() {
			return 0;
		},
		/**
		 * Returns general device information in text format
		 * 
		 * @returns {String}
		 */
		getInfo: function() {
			return "Version:\t" + (CONFIG.version || "not-available")
				+ "\nSDK version:\t" + (CONFIG.versionSDK || "not-available")
				+ "\nDevice:\t\t" + Main.getDevice().join(' ')
				+ "\nName:\t\t" + this.getDeviceName()
				+ "\nUID:\t\t" + this.getUID()
				+ "\nIP address:\t" + this.getIP()
				+ "\nFirmware:\t" + this.getFirmware()
				+ "\nCountry:\t" + this.getCountry()
				+ "\nLanguage:\t" + this.getLanguage()
				+ "\nDate:\t\t" + this.getDate()
				+ "\nLocation:\t" + window.location
				+ "\nUserAgent:\t" + navigator.userAgent;
		},
		/**
		 * Returns driver year.
		 * 
		 * @returns {Number}
		 */
		getYear: function() {
			if (Main.device) {
			return Main.device[1] >> 0;
			}
			else
			return 0;
		},
		/**
		 * Pseudo clear history = history go to end.
		 * Intended for webOS (Back control). 
		 */
		clearHistory: function() {
			return null;
		},
		/**
		 * Push to page history.
		 * Intended for webOS (Back control).
		 */
		pushHistory: function() {
			return null;
		},
		/**
		 * Fired when application is going do exit
		 * 
		 * @param {Boolean} [dvb=false] TRUE for exit to DVB, FALSE for SmartHUB
		 */
		exit: function(dvb) {
			return null;
		},
		/**
		 * Check if network connection is up
		 * 
		 * @param {Function} callback
		 * @param {Object} scope
		 */
		checkNetworkConnection: function(callback, scope) {

		}
    });

    return Device;

})(Events);