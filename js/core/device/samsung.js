/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Samsung device, overrides Device
 * 
 * @author Mautilus s.r.o.
 * @class Device_Samsung
 * @extends Device
 */

Device_Samsung = (function(Events) {
    var Device_Samsung = {isSAMSUNG: true};

    $.extend(true, Device_Samsung, Events, {
	/**
	 * @inheritdoc Device#init
	 */
	init: function(callback, scope) {
	    var self = this, onShow, onShowCalled = false, onLoad;

	    // override default modules
	    this.override();

	    this.loadJS('$MANAGER_WIDGET/Common/API/TVKeyValue.js');
	    this.loadJS('$MANAGER_WIDGET/Common/API/Widget.js');
	    this.loadJS('$MANAGER_WIDGET/Common/API/Plugin.js');

	    this.NNAVI = this.loadObject('pluginObjectNNavi', 'clsid:SAMSUNG-INFOLINK-NNAVI');
	    this.TVMW = this.loadObject('pluginObjectTVMW', 'clsid:SAMSUNG-INFOLINK-TVMW');
	    this.TV = this.loadObject('pluginObjectTV', 'clsid:SAMSUNG-INFOLINK-TV');
	    this.NETWORK = this.loadObject('NETWORK', 'clsid:SAMSUNG-INFOLINK-NETWORK');
	    this.APPCOMMON = this.loadObject('APPCOMMON', 'clsid:SAMSUNG-INFOLINK-APPCOMMON');
	    this.SAMSUNGSCREEN = this.loadObject('SCREEN', 'clsid:SAMSUNG-INFOLINK-SCREEN');
	    this.EXTERNALWIDGET = this.loadObject('EXTERNALWIDGET', 'clsid:SAMSUNG-INFOLINK-EXTERNALWIDGETINTERFACE');
	    this.TIME = this.loadObject('TIME', 'clsid:SAMSUNG-INFOLINK-TIME');
	    this.SEFPLAYER = this.loadObject('pluginPlayer', 'clsid:SAMSUNG-INFOLINK-SEF');

	    onShow = function() {
			if (onShowCalled) {
				return;
			}

			onShowCalled = true;

			self.PLUGIN.SetBannerState(1);
			self.NNAVI.SetBannerState(1);

			self.setKeys();

			self.PLUGIN.unregistKey(self.tvKey.KEY_VOL_UP);
			self.PLUGIN.unregistKey(self.tvKey.KEY_VOL_DOWN);
			self.PLUGIN.unregistKey(self.tvKey.KEY_MUTE);

			self.PLUGIN.registKey(self.tvKey.KEY_STOP);
			self.PLUGIN.registKey(self.tvKey.KEY_PAUSE);
			self.PLUGIN.registKey(self.tvKey.KEY_PLAY);
			self.PLUGIN.registKey(self.tvKey.KEY_CHLIST);
			self.PLUGIN.registKey(self.tvKey.KEY_PRECH);
			self.PLUGIN.registKey(self.tvKey.KEY_FAVCH);
			self.PLUGIN.registKey(self.tvKey.KEY_EXIT);

			self.PLUGIN.setOffScreenSaver();

			if (callback) {
				callback.call(scope || self);
			}
	    };

	    onLoad = function() {
			if (typeof Common !== 'undefined' && Common.API && Common.API.Plugin && Common.API.Widget) {
				self.tvKey = new Common.API.TVKeyValue();
				self.widgetAPI = new Common.API.Widget();
				self.PLUGIN = new Common.API.Plugin();

				// this event should be called right after everything is ready and window is shown
				window.onShow = onShow;

				// window.onShow method doesn't work in emulator
				setTimeout(function() {
				onShow();
				}, 2000);

				if (navigator.userAgent.indexOf('Maple 5.1') >= 0) {
					self.samsung2011();
				}

				self.widgetAPI.sendReadyEvent();

			} else {
				// call this later
				setTimeout(onLoad, 50);
			}
	    };

	    // checks if API libraries are loaded and ready, if not, its called again later
	    onLoad();
	},
	/**
	 * @inheritdoc Device#exit
	 */
	exit: function(dvb) {
	    if (this.widgetAPI) {
			if (dvb) {
				return this.widgetAPI.sendExitEvent();
			}

			return this.widgetAPI.sendReturnEvent();
	    }
	},
	/**
	 * @inheritdoc Device#getFirmware
	 */
	getFirmware: function() {
	    if (this.NNAVI) {
			return String(this.NNAVI.GetFirmware());
	    }

	    return null;
	},
	/**
	 * @inheritdoc Device#getUID
	 */
	getUID: function() {
	    var mac = this.NETWORK.GetMAC(0) || this.NETWORK.GetMAC(1);

	    if (!mac) {
			mac = 0;
	    }

	    return String(mac).toUpperCase();
	},
	/**
	 * @inheritdoc Device#getIP
	 */
	getIP: function() {
	    return (this.NETWORK.GetIP(1) || this.NETWORK.GetIP(0));
	},
	/**
	 * @inheritdoc Device#getDeviceName
	 */
	getDeviceName: function(stripSpaces) {
	    var type = (window.location.search.match(/modelid=([\d\w\_]+_BD)/) ? 'Blu-ray' : 'TV'),
		    name = 'Samsung ' + type + ' ' + Main.getDevice()[1];

	    if (stripSpaces) {
			name = name.replace(/\s/g, '');
	    }

	    return name;
	},
	/**
	 * @inheritdoc Device#getCountry
	 */
	getCountry: function() {
	    var country = null;

	    try {
			country = String(window.location.search.match(/country=([\w\-\_]+)/)[1]).toLowerCase();

	    } catch (e) {

	    }

	    return country;
	},
	/**
	 * @inheritdoc Device#getLanguage
	 */
	getLanguage: function() {
	    var language = null;

	    try {
			language = String(window.location.search.match(/lang=([\w\-\_]+)/)[1]).toLowerCase();

	    } catch (e) {

	    }

	    return language;
	},
	/**
	 * @inheritdoc Device#getDate
	 */
	getDate: function() {
	    var date;

	    try {
			date = this.TIME.getEpochTime() * 1000;

	    } catch (e) {
			date = new Date().getTime();
	    }

	    return new Date(date);
	},
	/**
	 * @inheritdoc Device#getTimeZoneOffset
	 */
	getTimeZoneOffset: function() {
	    return this.TV.GetTimeZone_Offset();
	},
	/**
	 * @inheritdoc Device#checkNetworkConnection
	 */
	checkNetworkConnection: function(callback, scope) {
	    var status = true;

	    if (this.NETWORK) {
			status = (this.NETWORK.CheckPhysicalConnection(1) == 1 || this.NETWORK.CheckPhysicalConnection(0) == 1);
	    }

	    if (callback) {
			callback.call(scope || this, status);
	    }
	},
	/**
	 * Initialize key codes
	 *
	 * @private
	 */
	setKeys: function() {
	    Control.setKeys({
		LEFT: this.tvKey.KEY_LEFT,
		RIGHT: this.tvKey.KEY_RIGHT,
		UP: this.tvKey.KEY_UP,
		DOWN: this.tvKey.KEY_DOWN,
		ENTER: this.tvKey.KEY_ENTER,
		RETURN: this.tvKey.KEY_RETURN,
		ZERO: this.tvKey.KEY_0,
		ONE: this.tvKey.KEY_1,
		TWO: this.tvKey.KEY_2,
		THREE: this.tvKey.KEY_3,
		FOUR: this.tvKey.KEY_4,
		FIVE: this.tvKey.KEY_5,
		SIX: this.tvKey.KEY_6,
		SEVEN: this.tvKey.KEY_7,
		EIGHT: this.tvKey.KEY_8,
		NINE: this.tvKey.KEY_9,
		RED: this.tvKey.KEY_RED,
		GREEN: this.tvKey.KEY_GREEN,
		YELLOW: this.tvKey.KEY_YELLOW,
		BLUE: this.tvKey.KEY_BLUE,
		PLAY: this.tvKey.KEY_PLAY,
		PAUSE: this.tvKey.KEY_PAUSE,
		STOP: this.tvKey.KEY_STOP,
		REC: this.tvKey.KEY_REC,
		FF: this.tvKey.KEY_FF,
		RW: this.tvKey.KEY_RW,
		TOOLS: this.tvKey.KEY_TOOLS,
		PUP: this.tvKey.KEY_CH_UP,
		PDOWN: this.tvKey.KEY_CH_DOWN,
		CHLIST: this.tvKey.KEY_CHLIST,
		PRECH: this.tvKey.KEY_PRECH,
		TXTMIX: this.tvKey.KEY_TTX_MIX,
		FAVCH: this.tvKey.KEY_FAVCH,
		EXIT: this.tvKey.KEY_EXIT,
		INFO: this.tvKey.KEY_INFO
	    });
	},
	/**
	 * Override default modules
	 * 
	 * @private
	 */
	override: function() {
	    if (typeof Device_Samsung_Storage !== 'undefined' && Storage) {
			Storage = $.extend(true, Storage, Device_Samsung_Storage);
	    }

	    if (typeof Device_Samsung_Player !== 'undefined' && Player) {
			Player = $.extend(true, Player, Device_Samsung_Player);
	    }
	},
	/**
	 * Load specific JS library or file
	 * 
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
	 * 
	 * @private
	 * @param {String} id
	 * @param {String} clsid
	 */
	loadObject: function(id, clsid) {
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
	    obj.setAttribute('classid', clsid);

	    document.body.appendChild(obj);

	    return obj;
	},
	/**
	 * 2011 fix
	 * 
	 * @private
	 */
	samsung2011: function() {
	    Date._parse = Date.parse;
	    Date.parse = function(str) {
			if (str.match(/^[\d\-]+\T[\d\-\+\:]+$/)) {
				var p = str.split(/\-|\+|\:|\T/);

				return (new Date(p[0], parseInt(p[1].replace(/^0/, '')) - 1, p[2], p[3], p[4], p[5])).getTime();
			}

			return Date._parse(str);
			};
		}
    });

    if (typeof document.head === 'undefined') {
		document.head = document.getElementsByTagName('head')[0];
    }

    if (typeof document.body === 'undefined') {
		document.body = document.getElementsByTagName('body')[0];
    }

    return Device_Samsung;

})(Events);