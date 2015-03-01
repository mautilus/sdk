/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 *  ********************************************************
 */

/**
 * Toshiba input support
 * 
 * @author Mautilus s.r.o.
 * @class Device_Toshiba_Input
 * @extends Input
 */


Device_Toshiba_Input = (function () {
	var Device_Toshiba_Input = function () {
		this.init.apply(this, arguments);
	};


	$.extend(true, Device_Toshiba_Input.prototype, {

		init: function() {
		},
		
		setPasswordMode: function () {
			var $parent = this.$el.parent();
			this.$el.remove();
			this.$el = $('<input type="password" style="width: 100%; height: 46px; border: 0; background: #5a5a5b;">');
			$parent.append(this.$el);
			this.setText(this.getValue());
		},

		create: function ($parent, css, title) {
			this.$el = $('<input type="text" style="width: 100%; height: 46px; border: 0; background: #5a5a5b;">');
			this.$text = this.$el.find(".text");
			$parent.append(this.$el);
		},

		destroy: function () {
			this.$inputHelp.remove();
		},

		setValue: function (text) {
			this.value = text;
			this.setText(text);
		},

		setText: function (text) {
			this.$el.val(text);
		},

		getValue: function () {
			return this.value;
		},

		blur: function() {
			return;
		},
	});

	return Device_Toshiba_Input;
})();
