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
* Dune HD device, overrides Device
* 
* @author Mautilus s.r.o.
* @class Device_Playstation
* @extends Device
*/

Device_Playstation = (function(Events) {
	var Device_Playstation = { isPlaystation: true };

	$.extend(true, Device_Playstation, Events, {
		/**
		 *@inheritdoc Device#init
		 */
		init: function(callback, scope) {
			var self = this;
			this.macaddress = '';
			this.callbacks = new Array();

			this.callbacks.push({command: 'networkStatusChange', callback: function(json) {
					if (json.newState != json.previousState) {
						this.status = (json.newState == 'connected') ? true : false ;
						App.trigger('network', this.status);
					}
				}, remove: false});

			this.nativeCommand({ command: 'hwid' }, function(info) {
					Device.macaddress = info.hwid;
				}, true);
			this.status = true;

			//override default modules
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
			//playstation cannot quit application programatically
			//this.API.exitBrowser(this.API.EXIT_BROWSER_MODE_STANDBY);
		},

		/**
         * Adding Playstation native command to stack
         * 
         * @param {Object} json Command in JSON format
         * @param {Function} callback Callback function with defined functionality
         * @param {Boolean} remove Flag if command be removed or not after executing
		 * @private
		 */
		nativeCommand: function(json, callback, remove) {
			window.external.user(JSON.stringify(json));
            if (callback) {
    			this.callbacks.push({ command: json.command, callback: callback, remove: remove });
            }
		},

		/**
         * Execute command from stack
         * 
         * @param {Object} json Command in JSON format which be called
		 * @private
		 */
		executeCommand: function(json) {
			var data = {};

			$.extend(true, data, json);

			var command = data.command, callback = null;
			delete data.command;

			//console.log(JSON.stringify(data));

			for (var i = 0; i < this.callbacks.length; ++i) {
				if (this.callbacks[i].command == command) {
					callback = this.callbacks[i];

					if (this.callbacks[i].remove) {
						console.log('removing');
						this.callbacks.splice(i, 1);
					}

					callback.callback.call(this, json);
				}
			}
		},

		/**
		 * @inheritdoc Device#getFirmware
		 */
		getFirmware: function() {
			if (typeof WM_devSettings != 'undefined')
				return WM_devSettings.version;

			return null;
		},

		/**
		 * @inheritdoc Device#getUID
		 */
		getUID: function() {
			return this.macaddress.toUpperCase();
		},

		/**
		 * @inheritdoc Device#getIP
		 */
		getIP: function() {
			//return this.API.getIpAddress();
			if (typeof WM_devSettings != 'undefined')
				return WM_devSettings.deviceIP;

			return null;
		},

		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
			var name = 'Playstation';

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
				callback.call(scope || this, this.status);
			}
		},

		/**
		 * Initialize key codes
		 * @private
		 */
		setKeys: function() {
			Control.setKeys({

				TRIANGLE: 112,
				SQUARE: 32,
				//CIRCLE: 8, // BACKSPACE
				//CROSS: 13, // ENTER

				RIGHT: 39,
				LEFT: 37,
				UP: 38,
				DOWN: 40,
				RETURN: 8, // CIRCLE
				ENTER: 13, // CROSS
				PLAY: 128,
				PAUSE: 130,
				STOP: 129,
				FF: 417,
				RW: 412,
				RED: 132,
				GREEN: 133,
				YELLOW: 41,
				BLUE: 42,

				ZERO: 96,
				// ONE: 97,
				// TWO: 98,
				//THREE: 99,
				FOUR: 100,
				// FIVE: 101,
				SIX: 102,
				SEVEN: 103,
				EIGHT: 104,
				NINE: 105,

				PUP: 33,
				PDOWN: 34,
				PRECH: 46, // Delete
				TXTMIX: 110, // ,Del
				AUDIO: 173,
				TBUTTON: 135, //touchpad button
				CLEAR: 12,
				SUBTITLE: 47,
				OPTIONS: 114,

				L1: 116,
				L2: 118,
				L3: 120,
				R1: 117,
				R2: 119,
				R3: 121,

			});
		},

		/**
		 * Override default modules
		 * @private
		 */
		override: function() {
			if (typeof Device_Playstation_Player !== 'undefined' && Player) {
				Player = $.extend(true, Player, Device_Playstation_Player);
			}

			if (typeof Device_Playstation_Storage !== 'undefined' && Storage) {
				Storage = $.extend(true, Storage, Device_Playstation_Storage);
			}

		},

		/**
		 * Load specific JS library or file
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
		 * @private
		 * @param {String} id
		 * @param {String} type
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
		},
        /**
         * Function accessing responses from playstation sdk
         * @param {Object} json JSON object which be executed
         */
		accessfunction: function(json) {
			if (json) {
				this.executeCommand(json);
			}
		}
	});

	if (typeof document.head === 'undefined') {
		document.head = document.getElementsByTagName('head')[0];
	}

	if (typeof document.body === 'undefined') {
		document.body = document.getElementsByTagName('body')[0];
	}

	return Device_Playstation;

})(Events);

window.accessfunction = function(json) {
	try {
		json = JSON.parse(json);
		if (typeof Player != 'undefined') {
			Player.accessfunction.apply(Player, arguments);
		}
		if (typeof Device != 'undefined') {
			Device.accessfunction.apply(Device, arguments);
		}
	}
	catch (e) {
		console.log('error ' + e);
	}
}
