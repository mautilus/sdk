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
 * Toshiba keyboard support
 * 
 * @author Mautilus s.r.o.
 * @class Device_Toshiba_Keyboard
 * @extends Keyboard
 */

Device_Toshiba_Keyboard = (function () {
	var Device_Toshiba_Keyboard =  function () {
		this.init.apply(this, arguments);
	};

	$.extend(true, Device_Toshiba_Keyboard.prototype, {
		init: function() {
		},

		show: function (input, lang) {
			input.$el.focus();
		},

	});

	return Device_Toshiba_Keyboard;

})();
