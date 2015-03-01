/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Samsung File Storage class
 * 
 * @author Mautilus s.r.o.
 * @class Device_Samsung_Storage
 * @extends Storage
 */

Device_Samsung_Storage = (function(Events) {
    var Device_Samsung_Storage = {
	data: null
    };

    $.extend(true, Device_Samsung_Storage, {
	init: function(config) {
	    this.configure(config);

	    this.FS = new FileSystem();

	    if (!this.FS.isValidCommonPath(curWidget.id)) {
		this.FS.createCommonDir(curWidget.id);
	    }

	    this.data = this.readData();
	},
	/**
	 * @private
	 */
	readData: function() {
	    var handle, data;

	    try {
		handle = this.FS.openCommonFile(curWidget.id + '/userdata.dat', 'r');

		if (handle) {
		    data = handle.readAll();
		    
		    this.FS.closeCommonFile(handle);
		    
		    data = JSON.parse(data);
		}

	    } catch (e) {

	    }

	    return data || {};
	},
	/**
	 * @private
	 */
	writeData: function(data){
	    var handle;

	    try {
		handle = this.FS.openCommonFile(curWidget.id + '/userdata.dat', 'w');

		if (handle) {
		    handle.writeAll(JSON.stringify(data));
		    this.FS.closeCommonFile(handle);
		}

	    } catch (e) {
		return false;
	    }
	    
	    return true;
	},
	/**
	 * @inheritdoc Storage#set
	 */
	set: function(name, value) {
	    this.data[name] = value;
	    return this.writeData(this.data);
	},
	/**
	 * @inheritdoc Storage#get
	 */
	get: function(name) {
	    return this.data[name];
	},
	/**
	 * @inheritdoc Storage#clear
	 */
	clear: function() {
		 this.data = {};
	    return this.writeData(this.data);
	}
    });

    return Device_Samsung_Storage;

})(Events);