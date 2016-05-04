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
* Panasonic Viera 2012 File Storage class
* 
* @author Mautilus s.r.o.
* @class Device_Viera2012_Storage
* @extends Storage
*/

Device_Viera2012_Storage = (function (Global) {
	var Device_Viera2012_Storage = {
		data: null
	};

	$.extend(true, Device_Viera2012_Storage, {
		init: function (config) {
			this.configure(config);
		},
		/**
		* @inheritdoc Storage#set
		*/
		set: function (name, value) {
			var date = new Date(), expires = "";
			date.setTime(date.getTime() + (200 * 24 * 60 * 60 * 1000));
			expires = '; expires=' + date.toUTCString();
			document.cookie = [name, '=', encodeURIComponent(JSON.stringify(value)), expires].join('');
			return true;
		},
		/**
		* @inheritdoc Storage#get
		*/
		get: function (name) {
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				 var cookies = document.cookie.split(';');
				 for (var i = 0; i < cookies.length; i++) {
					  var cookie = jQuery.trim(cookies[i]);
					  // Does this cookie string begin with the name we want?
					  if (cookie.substring(0, name.length + 1) == (name + '=')) {
							cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
							break;
					  }
				 }
			}

			if (cookieValue === null) {
				return false;
			}

			return JSON.parse(cookieValue);
		},
		/**
		* @inheritdoc Storage#clear
		*/
		clear: function () {
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(";");

				for (var i = 0; i < cookies.length; i++) {
					var cookie = cookies[i];
					var eqPos = cookie.indexOf("=");
					var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
					document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
				}

				return true;
			}
			else return false;
		}
	});

	return Device_Viera2012_Storage;

})(this);