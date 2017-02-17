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
 * Android device wrapper, overrides Device
 * 
 * @author Mautilus s.r.o.
 * @class Device_Android
 * @extends Device
 */

Device_Android = (function(Events) {
	var Device_Android = {isANDROID: true};

	$.extend(true, Device_Android, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, _scope) {
			var scope = this;
			this.eexit = false;		// blocking onReturn event delegate

			console.log('DEVICE ANDROID INIT');

			this.setKeys();
			if (!this.inited) {
				this.inited = true;

				// override default modules
				this.override();

				// init connection manager
				this.initConnectionManager();

				// init Router go event
				/*
				Router.on('scene', function() {
					if (!this.eexit) {
						scope.pushHistory();
					}
				}, this);
				*/
			}

			if (callback) {
				callback.call(_scope || this);
			}
		},

		/**
		 * Override default modules
		 * 
		 * @private
		 */
		override: function () {
			// extend default player
			
		},

		/**
		 * Init Android Connection Manager
		 * 
		 * @private
		 */
		initConnectionManager: function() {
			
		},

		/**
		 * Pseudo remove history = history go to end
		 * + Remove eventListener!!
		 */
		removeHistory: function() {
			var scope = this;

			history.go(-(history.length-1));

			console.log('>>>>>> REMOVE-HISTORY: ' + history.length);
		},

		/**
		 * Pseudo clear history = history go to end
		 */
		clearHistory: function() {
			var scope = this;
			this.eexit = true;

			if (history.length > 1) {
				history.go(-(history.length-1));
			}

			console.log('>>>>>> CLEAR-HISTORY length: ' + history.length);
		},

		/**
		 * Push to page history
		 */
		pushHistory: function() {
			var scope = this;
			this.eexit = false;

			if (history.length <= 1) {
				history.pushState({ 'position': history.length}, CONFIG.appName);
			} else {
				history.go(1);
			}

			console.log('>>>>>> PUSH-HISTORY length: ' + history.length);
		},

		/**
		 * Get current state from history
         * @returns current state
		 */
		stateHistory: function() {
			console.log('>>>>>> STATE-HISTORY length: ' + history.length);
			return history.state;
		},

		/**
		 * @inheritdoc Device#exit
		 * Not TESTED - may not correct for QA
		 */
		exit: function() {
			window.open('', '_self').close();
		},

		/**
		 * @inheritdoc Device#getFirmware
		 */
		getFirmware: function() {

		},

		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
			var name = '';

			if (stripSpaces) {
				name = name.replace(/\s/g, '');
			}

			return name;
		},

		/**
		 * @inheritdoc Device#getUID
		 */
		getUID: function() {
			return 'UID';
		},

		/**
		 * Set code keys
		 * 
		 * @private
		 */
		setKeys: function() {
			Control.setKeys({
				RIGHT: 39,
				LEFT: 37,
				UP: 38,
				DOWN: 40,
				RETURN: 8,
				ENTER: 13,
				PLAY: 415, // TODO
				PAUSE: 19, // TODO
				STOP: 413, // TODO
				FF: 417, // TODO
				RW: 412, // TODO
				RED: 403, // TODO
				GREEN: 404, // TODO
				YELLOW: 405, // TODO
				BLUE: 406, // TODO
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
				PUP: 33,
				PDOWN: 34,
				PRECH: 46, // TODO
				TXTMIX: 110 // TODO
			});
		}

	});

	if (typeof document.head === 'undefined') {
		document.head = document.getElementsByTagName('head')[0];
	}

	if (typeof document.body === 'undefined') {
		document.body = document.getElementsByTagName('body')[0];
	}

	return Device_Android;

})(Events);