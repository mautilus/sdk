/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Handles keyboard/RC events
 * 
 * @author Mautilus s.r.o.
 * @class Control
 * @singleton
 * @mixins Events
 */

Control = (function(Events) {
	var Control = {
		/**
		 * @property {Object} config General config hash
		 */
		config: null,
		/**
		 * @property {Boolean} enabled
		 * Enable or disable key handling
		 */
		enabled: true,
		/**
		 * @property {Object} key
		 * Key map, contains key:value pairs for key codes, e.g. {LEFT:37,...}
		 */
		key: {}
		};

		$.extend(true, Control, Events, {
		/**
		 * @event beforekey
		 * Will be called before a `key` event
		 * @preventable
		 * @param {Number} keyCode
		 * @param {Event} event
		 */

		/**
		 * @event key
		 * Will be called when a keyboard/RC event is triggered
		 * @param {Number} keyCode
		 * @param {Event} event
		 */

		init: function(config) {
			var scope = this;

			this.configure(config);

			jQuery(document).bind('keydown', function() {
				scope.onKeyDown.apply(scope, arguments);
			});
		},
		/**
		 * Set class config hash
		 * 
		 * @param {Object} config Hash of parameters
		 */
		configure: function(config) {
			this.config = $.extend(true, this.config || {}, config);
		},
		/**
		 * Disable key handling, specify callback to catch keys by your function
		 * 
		 * @param {Function} callback
		 * @param {Object} scope
		 */
		disable: function(callback, scope){
			this.enabled = false;
			
			if (typeof callback === 'function') {
			
				if (this.disabledCallback) {
					this.off('beforekey', this.disabledCallback);
				}
				
				this.disabledCallback = callback;
					this.on('beforekey', this.disabledCallback, scope);
				
			} else {
				this.disabledCallback = null;
			}
		},
		/**
		 * Enable key handling
		 */
		enable: function(){
			this.enabled = true;
			
			if (this.disabledCallback) {
				this.off('beforekey', this.disabledCallback);
				this.disabledCallback = null;
			}
		},
		/**
		 * Set key map
		 * 
		 * @param {Object} Key map, e.g. {LEFT:37,...}
		 * @returns {Object} Current key map
		 */
		setKeys: function(map) {
			$.extend(this.key, map || {});

			return this.key;
		},
		/**
		 * Test if given keycode belongs to some numeric key
		 * 
		 * @param {Number} keycode
		 * @returns {Boolean}
		 */
		isNumeric: function(keycode) {
			if (keycode === this.key.ONE
				|| keycode === this.key.TWO
				|| keycode === this.key.THREE
				|| keycode === this.key.FOUR
				|| keycode === this.key.FIVE
				|| keycode === this.key.SIX
				|| keycode === this.key.SEVEN
				|| keycode === this.key.EIGHT
				|| keycode === this.key.NINE
				|| keycode === this.key.ZERO) {
				return true;
			}

			if(this.isExternNumeric(keycode)) {
				return true;
			}
			
			return false;
		},	
		/**
		 * Test if given keycode belongs to some numeric key on Extern USB keyboard
		 * 
		 * @param {Number} keycode
		 * @returns {Boolean}
		 */
		isExternNumeric: function(keycode) {
			if( (keycode === this.key.NUMERIC_ONE)
				|| (keycode === this.key.NUMERIC_TWO)
				|| (keycode === this.key.NUMERIC_THREE)
				|| (keycode === this.key.NUMERIC_FOUR)
				|| (keycode === this.key.NUMERIC_FIVE)
				|| (keycode === this.key.NUMERIC_SIX)
				|| (keycode === this.key.NUMERIC_SEVEN)
				|| (keycode === this.key.NUMERIC_EIGHT)
				|| (keycode === this.key.NUMERIC_NINE)
				|| (keycode === this.key.NUMERIC_ZERO)) {
				return true;
			} 

			return false;
		},
		/**
		 * Test if given keycode is navigation key (arrow, enter or return)
		 * 
		 * @param {Number} keycode
		 * @returns {Boolean}
		 */
		isNavigational: function(keycode){
			if (keycode === this.key.LEFT
				|| keycode === this.key.RIGHT
				|| keycode === this.key.UP
				|| keycode === this.key.DOWN
				|| keycode === this.key.ENTER
				|| keycode === this.key.RETURN) {
				return true;
			}
			
			return false;
		},
		isMedia: function(keycode) {
			if (keycode === this.key.PLAY
				|| keycode === this.key.PAUSE
				|| keycode === this.key.STOP
				|| keycode === this.key.FF
				|| keycode === this.key.RW) {
				return true;
			}
			
			return false;
		},
		/**
		 * Get textual value if give key
		 * 
		 * @param {Number} keycode
		 * @returns {String}
		 */
		getTextValue: function(keycode){
			if(keycode === this.key.ONE || keycode === this.key.NUMERIC_ONE){
				return '1';
			}else if(keycode === this.key.TWO || keycode === this.key.NUMERIC_TWO){
				return '2';
			}else if(keycode === this.key.THREE || keycode === this.key.NUMERIC_THREE){
				return '3';
			}else if(keycode === this.key.FOUR || keycode === this.key.NUMERIC_FOUR){
				return '4';
			}else if(keycode === this.key.FIVE || keycode === this.key.NUMERIC_FIVE){
				return '5';
			}else if(keycode === this.key.SIX || keycode === this.key.NUMERIC_SIX){
				return '6';
			}else if(keycode === this.key.SEVEN || keycode === this.key.NUMERIC_SEVEN){
				return '7';
			}else if(keycode === this.key.EIGHT || keycode === this.key.NUMERIC_EIGHT){
				return '8';
			}else if(keycode === this.key.NINE || keycode === this.key.NUMERIC_NINE){
				return '9';
			}else if(keycode === this.key.ZERO || keycode === this.key.NUMERIC_ZERO){
				return '0';
			}
			
			return null;
		},
		/**
		 * Handles keyDown events
		 * 
		 * @private
		 */
		onKeyDown: function(ev) {
			var keyCode;

			if (typeof ev === 'object') {
				keyCode = ev.keyCode;

			} else {
				keyCode = ev;
			}

			if (keyCode === this.key.RETURN) {
				ev.preventDefault();
			}

			if (this.trigger('beforekey', keyCode, ev) === false) {
				return;
			}

			if (!this.enabled) {
				return;
			}

			this.trigger('key', keyCode, ev);
		}
	});

	// Initialize this class when Main is ready
	Main.ready(function() {
		Control.init();
	});

	return Control;

})(Events);