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
* Arris 2012 File Storage class
* 
* @author Mautilus s.r.o.
* @class Device_Arris_Storage
* @extends Storage
*/

Device_Arris_Storage = (function (Global) {
	var Device_Arris_Storage = {
		config: null
	};

	$.extend(true, Device_Arris_Storage, {
		init: function (config) {
			this.configure(config);
		},
		/**
		* @inheritdoc Storage#set
		*/
		set: function(name, value) {
			alert ('Storage arris set name: ' + name + ' > value: ' + value);
			try{
				toi.informationService.setObject(name, JSON.stringify(value), 0);
			}
			catch(e){}
			return false;
		},

		/**
		* @inheritdoc Storage#get
		*/
		get: function(name) {
			var value;

			try {
				value = toi.informationService.getObject(name);
			} catch (e) {
				//	alert('get Storage error: '+e);
			}

			//alert ('Storage arris get name: ' + name + ' > value: ' + value);
			if (typeof value !== 'undefined') {
				return JSON.parse(value);
			}

			return false;
		},

		/**
		* @inheritdoc Storage#clear
		*/

	});

	return Device_Arris_Storage;

})(this);