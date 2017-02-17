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
 * Motorola Arris device, overrides Device
 * 
 * @author Mautilus s.r.o.
 * @class Device_Arris
 * @extends Device
 */

Device_Arris = (function(Events) {
	var Device_Arris = { isARRIS: true };

	$.extend(true, Device_Arris, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, scope) {

			this.TOI = this.loadEmbed('application/x-kreatv-toi');
			this.SECUREMEDIA = this.loadEmbed('application/x-kreatv-securemedia');

			// initialize Arris
			this.hdmiOutputId = null;

			Control.setKeys({
				RIGHT: 39, // inner control ring keys
				RIGHTMOD: -39, // outer control ring keys
				LEFT: 37, // inner control ring keys
				LEFTMOD: -37, // outer control ring keys
				UP: 38, // inner control ring keys
				DOWN: 40, // inner control ring keys
				RETURN: 917536,//8,
				ENTER: 13,
				PLAY: 415,
				PAUSE: 19,
				STOP: 413,
				FF: 417,
				RW: 412,
				RED: 917504,// 403,
				GREEN: 917505,//404,
				YELLOW: 917506, //405,
				BLUE: 917507, // 406,
				ZERO: 48,//96,
				ONE: 49, //97,
				TWO: 50, // 98,
				THREE: 51, // 99,
				FOUR: 52, //100,
				FIVE: 53,
				SIX: 54, //102,
				SEVEN: 55, //103,
				EIGHT: 56, // 104,
				NINE: 57, //105,
				PUP: -38, // outer control ring keys
				PDOWN: -40, // outer control ring keys
				PRECH: 46, // Delete
				TXTMIX: 110, // ,Del
				INFO: 917556,
				TV: 917554,
				REC: 917527, //s 18
				MENU: 917555,
				VOLUMEUP: -917747, // minus value is because modificator is presented
				VOLUMEDOWN: -917748, // minus value is because modificator is presented
				MUTE: -917744, // minus value is because modificator is presented
				STANDBY: 17
			});

			this.override();

			this.initArris();

			if (callback) {
				callback.call(scope || this);
			}
		},
		initArris: function() {

			if (toi && toi.secureMediaService) {
				Device.initKreaTV();
				Device.setAacConversion(Device.getHdmiAudioConnection());
			} else {
				setTimeout(function() {
					Device.initArris();
				}, 50);
			}

		},
		/**
		 * @inheritdoc Device#exit
		 */
		exit: function(dvb) {
			window.close();
		},
		/**
		 * @inheritdoc Device#getFirmware
		 */
		getFirmware: function() {
			return this.userAgentInfo ? this.userAgentInfo[2] : 'N/A';
		},
		/**
		 * @inheritdoc Device#getUID
		 */
		getUID: function() {
			var mac = toi.informationService.getObject('const.ip.eth0.mac');
			if (mac != null) {
				return mac.replace(/:/g, '').toLowerCase();
			}
			return null;
		},
		/**
		 * @inheritdoc Device#getIP
		 */
		getIP: function() {
			var ip = null;
			if (toi.informationService.getObject('var.ip.eth0.addr')) {
				ip = toi.informationService.getObject('var.ip.eth0.addr');
			} else if (toi.informationService.getObject('var.ip.eth1.addr')) {
				ip = toi.informationService.getObject('var.ip.eth1.addr');
			} else if (toi.informationService.getObject('var.ip.eth2.addr')) {
				ip = toi.informationService.getObject('var.ip.eth2.addr');
			}
			return ip;
		},
		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
			if (toi.informationService.getObject('const.hw.productname')) {
				return toi.informationService.getObject('const.hw.productname');
			} else {
				return 'Arris';
			}
		},
		/**
		/**
		 * @inheritdoc Device#getCountry
		 */
		getCountry: function() {
			var country = null;

			try {
			country = String(window.navigator.language).toLowerCase().split('-')[1];

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
				language = String(window.navigator.language).toLowerCase();

			} catch (e) {

			}

			return language;
		},
		/**
		 * @inheritdoc Device#getDate
		 */
		getDate: function() {
			return new Date();
		},
		/**
		 * @inheritdoc Device#getTimeZoneOffset
		 */
		getTimeZoneOffset: function() {
			return 0;
		},

		/**
		 * @inheritdoc Device#checkNetworkConnection
		 */
		checkNetworkConnection: function(callback, scope) {
			if (callback) {
				callback.call(scope || this, true);
			}

			return false;
		},

		/**
		 * Load specific embed OBJECT
		 * @private
		 * @param {String} type
		 */
		loadEmbed: function(type) {

			var objs = document.getElementsByTagName('embed');

			if (objs) {
				for (var i in objs) {
					if (objs[i] && objs[i].type === type) {
						debugger
						return objs[i];
					}
				}
			}

			var obj = document.createElement('embed');
			obj.type = type;
			obj.style.visibility = 'hidden';
			obj.setAttribute('type', type);

			document.body.appendChild(obj);

			return obj;
		},

		/**
		 * Override default modules
		 * 
		 * @private
		 */
		override: function() {
			console.log('[DEVICE] Arris override');

			if (typeof Device_Arris_Storage !== 'undefined' && Storage) {
				Storage = $.extend(true, Storage, Device_Arris_Storage);
			}
			if (typeof Device_Arris_Player !== 'undefined' && Player) {
				Player = $.extend(true, Player, Device_Arris_Player);
			}
		},

		/**
		 * Return ID of the first HDMI output.
		 */
		getHdmiOutputId: function() {
			if (this.hdmiOutputId != null) {
				return this.hdmiOutputId;
			}

			var outputConfig = toi.videoOutputService.getVideoConfiguration();
			var outputs = outputConfig.getVideoOutputs();

			for (var i = 0; i < outputs.length; i++) {
				var outputId = outputs[i];
				var info = outputConfig.getVideoOutputInfo(outputId);
				if (info.outputType == toi.consts.ToiVideoOutputConfiguration.VIDEO_CONNECTION_TYPE_HDMI) {
					this.hdmiOutputId = outputId;
					return outputId;
				}
			}

			return null;
		},

		/**
		 * outputId
		 * mode:
		 * 		toi.consts.ToiVideoOutputConfiguration.VIDEO_MODE_1080P50
		 * 		toi.consts.ToiVideoOutputConfiguration.VIDEO_MODE_720P50
		 * 		toi.consts.ToiVideoOutputConfiguration.VIDEO_MODE_576P50
		 * colorSpace:
		 * 		toi.consts.ToiVideoOutputConfiguration.DIGITAL_COLOR_SPACE_SRGB 
		 */
		setOutputVideoMode: function(outputId, mode, colorSpace) {
			var session = toi.videoOutputService.createVideoConfigurationSession();
			session.setDefaultVideoMode(outputId, mode);
			if (colorSpace != null) {
				session.setColorSpace(outputId, colorSpace);
			}
			session.apply();
		},

		/**
		 * Initialize KreaTV
		 */
		initKreaTV: function(){
			console.log('------------------------------------------------------------------------------------');
			console.log('SN: ' + this.getUID());
			console.log('Product name: ' + toi.informationService.getObject('const.hw.productname'));
			console.log('Serial: ' + toi.informationService.getObject('const.ip.eth0.mac'));
			console.log('------------------------------------------------------------------------------------');
			var outputid = this.getHdmiOutputId();
			console.log('HDMI Output ID: ' + outputid);
			this.setOutputVideoMode(outputid, toi.consts.ToiVideoOutputConfiguration.VIDEO_MODE_720P50, toi.consts.ToiVideoOutputConfiguration.DIGITAL_COLOR_SPACE_SRGB);
		},

		/**
		 * Initialize SecureMedia
		 */
		initSM: function(registerUrl, drmSecret) {

			var sm = toi.secureMediaService;

			if (sm) {
				console.log('Mam SM service');
				var om = sm.getOperationManager();
				if (om) {
					console.log('Mam OperationManager');
					om.addEventListener(om.ON_OPERATION_RESULT, function(e) {
						console.log('Registration result: ' + e.result);
						om.releaseOperation(e.operation.id);
					});

					sm.addEventListener(sm.ON_ERROR_OCCURRED, function() {
						console.log('Error occured');
					});
					sm.addEventListener(sm.ON_AUTHORIZATION_STATUS_CHANGED, function() {
						console.log('Authorization status changed');
					});

					var operation = om.createOperation('registrationStatus');
					sm.register(operation, registerUrl, drmSecret);
					sm.requestRegistrationStatus(operation);
					console.log('SM version: ' + sm.getVersion());
				} else {
					console.log('Nemam OperationManager');
				}
			} else {
				console.log('Nemam SM service');
			}
		},

		/* digital audio */	
		getHdmiAudioConnection: function () {
			var connections = toi.audioOutputService.getConnections();
			for (var i = 0; i < connections.length; i++) {
				var connection = connections[i];
				if (connection.type == toi.consts.ToiAudioOutputService.AUDIO_CONNECTION_TYPE_HDMI) {
					return connection.id;
				}
			}
			return null;
		},

		/* analog audio */
		getAnalogAudioConnection: function () {
			var connections = toi.audioOutputService.getConnections();
			for (var i = 0; i < connections.length; i++) {
				var connection = connections[i];
				if (connection.type == toi.consts.ToiAudioOutputService.AUDIO_CONNECTION_TYPE_ANALOG) {
					return connection.id;
				}
			}
			return null;
		},

		/* decoder audio */
		getDecoderAudioConnection: function () {
			var connections = toi.audioOutputService.getConnections();
			for (var i = 0; i < connections.length; i++) {
				var connection = connections[i];
				if (connection.type == toi.consts.ToiAudioOutputService.AUDIO_CONNECTION_TYPE_DECODER) {
					return connection.id;
				}
			}
			return null;
		},

		isMuted: function () {
			return toi.audioOutputService.getMuteState(this.getHdmiAudioConnection());
		},

		/*volumeIs: function () {
			return toi.audioOutputService.getVolume(App.getHdmiAudioConnection())
		},*/

		setAacConversion: function(audioOutput) {
		//alert('AudioConnectionType '+toi.consts.AudioConnectionType);
			var session = toi.audioOutputService.createConfigurationSession();
			try {
				var outputFormat = toi.consts.ToiAudioOutputConfiguration.AUDIO_FORMAT_PCM_2CH;
				session.setFormatMapping(
						audioOutput,
						toi.consts.ToiAudioOutputConfiguration.AUDIO_FORMAT_AAC_HE,
						{format: outputFormat, mixFlag: false}
					);
				session.setFormatMapping(
						audioOutput,
						toi.consts.ToiAudioOutputConfiguration.AUDIO_FORMAT_AAC_LC,
						{format: outputFormat, mixFlag: false}
					);
				session.apply();
			} catch (e) {
				console.log(e);
				session.revert();
			}
		},

	}); 

	if (typeof document.head === 'undefined') {
		document.head = document.getElementsByTagName('head')[0];
	}

	if (typeof document.body === 'undefined') {
		document.body = document.getElementsByTagName('body')[0];
	}

	return Device_Arris;

})(Events);