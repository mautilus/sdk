/**
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Tizen device, overrides Device
 *
 * @author Mautilus s.r.o.
 * @class Device_Tizen
 * @extends Device
 */

Device_Tizen = (function(Events) {
	var Device_Tizen = {isTIZEN: true};

	$.extend(true, Device_Tizen, Events, {
	/**
	 * @inheritdoc Device#init
	 */
	init: function(callback, scope) {
		var self = this, onShow, onShowCalled = false, stack = [], onLoad;

		this.loadJS('$WEBAPIS/webapis/webapis.js');

		this.networkStatus = true;

		// override default modules
		this.override();

		this.APP  = tizen.application.getCurrentApplication();
		this.TIME = tizen.time;
		this.SYSTEM = tizen.systeminfo;
		this.AVPLAYER = this.loadObject('av-player', {'type': 'application/avplayer', 'style': 'width: 0; height: 0;'});

		stack.push('obj');
		tizen.systeminfo.getPropertyValue('LOCALE', function(obj){
			console.log('locale object is loaded fine');
			self.LOCALE = obj;
			stack.pop();
		}, function(error){
			self.LOCALE = {};
			console.error('locale object is not loaded ' + error.message);
		});

		onShow = function() {
			if (onShowCalled) {
				return;
			}

			onShowCalled = true;

			self.NETWORK = webapis.network;
			self.MODEL = webapis.productinfo;
			self.PLAYER = webapis.avplay;
			self.AUDIOCONTROL = tizen.tvaudiocontrol;

			console.log(self.NETWORK.NetworkState);

			self.NETWORK.addNetworkStateChangeListener(function(data){
				if(data === self.NETWORK.NetworkState.GATEWAY_DISCONNECTED ||
				   data === 2) {
					console.log("[NetworkStateChangedCallback] DISCONNECTED");
					self.networkStatus = false;
				} else {
					console.log("[NetworkStateChangedCallback] CONNECTED");
					self.networkStatus = true;
				}
			});

			self.setKeys();

			tizen.tvinputdevice.unregisterKey("VolumeDown");
			tizen.tvinputdevice.unregisterKey("VolumeUp");
			tizen.tvinputdevice.unregisterKey("VolumeMute");

			tizen.tvinputdevice.registerKey("0");
			tizen.tvinputdevice.registerKey("1");
			tizen.tvinputdevice.registerKey("2");
			tizen.tvinputdevice.registerKey("3");
			tizen.tvinputdevice.registerKey("4");
			tizen.tvinputdevice.registerKey("5");
			tizen.tvinputdevice.registerKey("6");
			tizen.tvinputdevice.registerKey("7");
			tizen.tvinputdevice.registerKey("8");
			tizen.tvinputdevice.registerKey("9");
			tizen.tvinputdevice.registerKey("ColorF0Red");
			tizen.tvinputdevice.registerKey("ColorF1Green");
			tizen.tvinputdevice.registerKey("ColorF2Yellow");
			tizen.tvinputdevice.registerKey("ColorF3Blue");
			tizen.tvinputdevice.registerKey("MediaPlay");
			tizen.tvinputdevice.registerKey("MediaStop");
			tizen.tvinputdevice.registerKey("MediaPause");
			tizen.tvinputdevice.registerKey("MediaRewind");
			tizen.tvinputdevice.registerKey("MediaFastForward");
			tizen.tvinputdevice.registerKey("MediaRecord");
			tizen.tvinputdevice.registerKey("MediaPlayPause");
//			tizen.tvinputdevice.registerKey("Exit");
			tizen.tvinputdevice.registerKey("ChannelList");
			tizen.tvinputdevice.registerKey("ChannelUp");
			tizen.tvinputdevice.registerKey("ChannelDown");
			tizen.tvinputdevice.registerKey("PreviousChannel");

			self.screensaver();

			if (callback) {
				callback.call(scope || self);
			}
		};

		var supportedKeys = tizen.tvinputdevice.getSupportedKeys(), keyCode = [];
		for (var i = 0; i < supportedKeys.length; i++) {
			keyCode[supportedKeys[i].name] = supportedKeys[i].code;
		}
		
		this.tvKey = {
			"KEY_LEFT" : 37,
			"KEY_RIGHT" : 39,
			"KEY_UP" : 38,
			"KEY_DOWN" : 40,
			"KEY_ENTER" : 13,
			"KEY_BACK" : 0,
			"KEY_RETURN" : 10009,
			"KEY_0" : keyCode[0],  //48
			"KEY_1" : keyCode[1],  //49
			"KEY_2" : keyCode[2],  //50
			"KEY_3" : keyCode[3],  //51
			"KEY_4" : keyCode[4],  //52
			"KEY_5" : keyCode[5],  //53
			"KEY_6" : keyCode[6],  //54
			"KEY_7" : keyCode[7],  //55
			"KEY_8" : keyCode[8],  //56
			"KEY_9" : keyCode[9],  //57
			"KEY_RED" : keyCode["ColorF0Red"],            //403
			"KEY_GREEN" : keyCode["ColorF1Green"],        //404
			"KEY_YELLOW" : keyCode["ColorF2Yellow"],      //405
			"KEY_BLUE" : keyCode["ColorF3Blue"],          //406
			"KEY_PLAY" : keyCode["MediaPlay"],            //415
			"KEY_PAUSE" : keyCode["MediaPause"],          //19
			"KEY_STOP" : keyCode["MediaStop"],            //413
			"KEY_RECORD" : keyCode["MediaRecord"],        //416
			"KEY_FF" : keyCode["MediaFastForward"],       //417
			"KEY_RW" : keyCode["MediaRewind"],            //412
			"KEY_PLAY_PAUSE" : keyCode["MediaPlayPause"], //10252
			"KEY_TOOLS" : keyCode["Tools"],               //10135
			"KEY_CH_UP" : keyCode["ChannelUp"],           //427
			"KEY_CH_DOWN" : keyCode["ChannelDown"],       //428
			"KEY_CHLIST" : keyCode["ChannelList"],        //10073
			"KEY_PRECH" : keyCode["PreviousChannel"],     //10190
			"KEY_TTX_MIX" : keyCode["Teletext"],          //10200
			"KEY_EXIT" : keyCode["Exit"],                 //10182
			"KEY_INFO" : keyCode["Info"]                  //457
		};

		onLoad = function() {
			if(stack.length == 0){
				// this event should be called right after everything is ready and window is shown
				window.onShow = onShow;

				// window.onShow method doesn't work in emulator
				setTimeout(function() {
					onShow();
				}, 2000);
			}
			else {
				// call this later
				setTimeout(onLoad, 50);
			}
		};
		
		if(!this.inited) {
			this.inited = true;
			
			/*
			 * Multitasking visibilitychange event
			 * - first event is trigger visibilitychange!! / return false == stop propagation hideApp/resumeApp
			 * - event hideApp == document hidden
			 * - event resumeApp == document visible
			 * *PP*
			 */
			document.addEventListener("visibilitychange", function() {
				if(self.trigger('visibilitychange') === false) {
					return;
				} else {
					if (document.hidden) {
						self.trigger('hideApp');
					} else {
						self.trigger('resumeApp');
					}
				}
			});
		}

		// checks if API libraries are loaded and ready, if not, its called again later
		onLoad();
	},
	/**
	 * @inheritdoc Device#exit
	 */
	exit: function(dvb) {
		if(this.APP){
			if (dvb) {
				return this.APP.exit();
			}

			return this.APP.exit();
			//return this.APP.hide();
		}
	},

	/**
	 * @private
	 * @param {Boolean} [on=false] TRUE if screensaver is activated FALSE is screensaver is deactivated
	 */
	screensaver: function(on) {
		webapis.appcommon.setScreenSaver(on === true ? webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON : webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF,
			function(data){
				console.log((on === true ? ('screensaver enabled') : ('screensaver disabled')) + (data ? ' ' + data : ''));
			},
			function(err){
				console.log('screensaver fails: '+err.code);
			}
		);
	},
	/**
	 * @inheritdoc Device#getFirmware
	 */
	getFirmware: function() {
		if (this.MODEL) {
			return String(this.MODEL.getFirmware());
		}

		return null;
	},
	/**
	 * @inheritdoc Device#getUID
	 */
	getUID: function() {
		console.log('ConnectionType: '+this.NETWORK.getActiveConnectionType());
		var mac = this.NETWORK.getMac();

		if (!mac) {
			mac = 0;
		}

		return String(mac).toUpperCase();
	},
	/**
	 * @inheritdoc Device#getIP
	 */
	getIP: function() {
		if(this.NETWORK && typeof this.NETWORK.getIp == 'function'){
			return this.NETWORK.getIp();
		}

		return '';
	},
	/**
	 * @inheritdoc Device#getDeviceName
	 */
	getDeviceName: function(stripSpaces) {
		var name = 'Tizen ' + Main.getDevice()[1] + ', ' + this.MODEL.getModelCode() + ', ' + this.MODEL.getRealModel();

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
			country = this.LOCALE.country;
		} catch (e) {
			country = String(window.location.search.match(/country=([\w\-\_]+)/)[1]).toLowerCase();
		}

		return country;
	},
	/**
	 * @inheritdoc Device#getLanguage
	 */
	getLanguage: function() {
		var language = null;

		try {
			language = this.LOCALE.language.split('_')[0];
		} catch (e) {
			language = String(window.location.search.match(/lang=([\w\-\_]+)/)[1]).toLowerCase();
		}

		return language;
	},
	/**
	 * @inheritdoc Device#getDate
	 */
	getDate: function() {
		
//		var date;
//
//		try {
//			date = this.TIME.getCurrentDateTime();
//			return date;
//		} catch (e) {
//			date = new Date().getTime();
//			return new Date(date);
//		}
		
		return(new Date());
	},
	/**
	 * @inheritdoc Device#getTimeZoneOffset
	 */
	getTimeZoneOffset: function() {
		return this.TIME.getLocalTimezone();
	},
	/**
	 * @inheritdoc Device#checkNetworkConnection
	 */
	checkNetworkConnection: function(callback, scope) {
		var status = true;

		if (this.NETWORK) {
			status = this.networkStatus;
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
			PLAY_PAUSE: this.tvKey.KEY_PLAY_PAUSE,
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
		if (typeof Device_Tizen_Player !== 'undefined' && Player) {
			Player = $.extend(true, Player, Device_Tizen_Player);
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
		if(typeof clsid == 'string') {
			obj.setAttribute('classid', clsid);
		}
		else if(typeof clsid == 'object') {
			for(var key in clsid) {
				if (clsid.hasOwnProperty(key)) {
					obj.setAttribute(key, clsid[key]);
				}
			}
		}

		document.body.appendChild(obj);

		return obj;
	},
	});

	if (typeof document.head === 'undefined') {
		document.head = document.getElementsByTagName('head')[0];
	}

	if (typeof document.body === 'undefined') {
		document.body = document.getElementsByTagName('body')[0];
	}

	return Device_Tizen;

})(Events);