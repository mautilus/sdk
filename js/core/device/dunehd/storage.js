/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Dunehd File Storage class
 * 
 * @author Mautilus s.r.o.
 * @class Device_Dunehd_Storage
 * @extends Storage
 */

Device_Dunehd_Storage = (function (Events) {
    var Device_Dunehd_Storage = {
        data: null
    };

    $.extend(true, Device_Dunehd_Storage, {
        init: function (config) {
            this.configure(config);

            if (Device.API)
                this.API = Device.API;

        },

        /**
        * @inheritdoc Storage#set
        */
        set: function (name, value) {
            if (this.API.setUserSetting) {
                this.API.setUserSetting(name, value);
                return true;
            }

            return false;
        },
        /**
        * @inheritdoc Storage#get
        */
        get: function (name) {
            if (this.API.getUserSetting) {
                return this.API.getUserSetting(name);
            }

            return null;
        },
        /**
        * @inheritdoc Storage#clear
        */
        clear: function () {
            //@todo
        }
    });

    return Device_Dunehd_Storage;

})(Events);