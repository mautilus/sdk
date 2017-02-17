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
 * LG Player class
 * 
 * @author Mautilus s.r.o.
 * @class Device_Lg_Player
 * @extends Player
 */

Device_Lg_Player = (function(Events) {
	var Device_Lg_Player = {
	};

	$.extend(true, Device_Lg_Player, {

		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function() {
			var scope = this;
			
			this.createDRMAgent();
			this.createPlayer();

			this.ticker = setInterval(function() {
				scope.tick();
			}, 500);
		},

		/**
		 * @inheritdoc Player#deinitNative
		 */
		deinitNative: function() {
			this.PLAYER.stop();
			this.$el.remove();
		},

		/**
		 * Function for creating player object
		 * @param {String} [drmType=''] DRM type ('WIDEVINE', 'PLAYREADY', 'VERIMATRIX')
		 * 
		 * @private
		 */
		createPlayer: function(drmType){
			var scope = this;

			if (this.PLAYER){
				this.deinitNative();
			}
			
			var drmTypeValue = '';
			switch(drmType) {
				case 'PLAYREADY':  drmTypeValue = 'wm-drm'; break;     // meaning: WM-DRM 10 PD or PlayReady (default value)
				case 'WIDEVINE':   drmTypeValue = 'widevine'; break;   // meaning: Widevine DRM and its adaptive/live streaming
				case 'VERIMATRIX': drmTypeValue = 'verimatrix'; break; // meaning: Verimatrix DRM
			}
			
			var mediaType = this.mediaOption.mediaType || this.deriveMediaType(this.url);
			var mediaTypeValue = '';
			switch(mediaType) {
				case 'SMOOTH_STREAMING': mediaTypeValue = 'application/vnd.ms-sstr+xml'; break;
				default: mediaTypeValue = 'application/x-netcast-av'; break;  // Media Type Resolving in LG Media Player Plugin
			}

			this.$el = $('<object id="LGPLAYER" type="'+mediaTypeValue+'" ' + (drmTypeValue ? 'drm_type="' + drmTypeValue + '" ' : '')
					+ 'data="" width="' + this.config.width + '" height="' + this.config.height + '" style="width:' + (this.config.width == 1280 ? 1279 : this.config.width) + 'px;height:' + this.config.height + 'px;'
					+ 'top:' + this.config.top + 'px;left:' + this.config.left + 'px;'
					+ 'position:absolute;z-index:0;visibility:hidden"></object>').appendTo('body');
			this.PLAYER = this.$el[0];

			this.PLAYER.onPlayStateChange = function() {
				scope.onNativePlayStateChange();
			};

			Player.trigger('init');
		},
		
		/**
		 * Function for creating DRM Agent object
		 */
		createDRMAgent: function() {
			$('body').append('<object id="drmplugin" type="application/oipfDrmAgent" style="visibility:hidden" width="0" height="0"></object>');
			this.drmplugin = document.getElementById('drmplugin');

			if (this.drmplugin) {
				this.drmplugin.onDRMMessageResult = this.onDRMMessageResult;
				this.drmplugin.onDRMRightsError = this.onDRMRightsError;
			} else {
				console.log('[Device_Lg_Player] DRM Plugin initialization failed!');
				return false;
			}
		},

		/**
		 * Internal player timer
		 * 
		 * @private
		 */
		tick: function() {
			if (this.url && this.PLAYER && typeof this.PLAYER.playTime !== 'undefined') {

				if (this.PLAYER.playPosition) {
					this.onTimeUpdate(this.PLAYER.playPosition);
				}
			}
		},

		/**
		 * @inheritdoc Player#native
		 */
		native: function(cmd, attrs) {
			var url;

			if (cmd === 'play') {
				if (attrs && attrs.url) {
					url = this.url;
					this._seekOnPlay = null; // clear

					console.network('PLAYER', this.url);

					var drmType = this.drmConfig.type;
					if (drmType === 'WIDEVINE') {
						// Widevine
						this.createPlayer('WIDEVINE');
						this.show();
						
						var drmConfigOption = this.drmConfig.option || {};

						if (typeof(drmConfigOption.DRMServerURL) !== 'undefined') {
							this.PLAYER.setWidevineDrmURL(drmConfigOption.DRMServerURL);
						}
						if (typeof(drmConfigOption.UserData) !== 'undefined') {
							this.PLAYER.setWidevineUserData(drmConfigOption.UserData);
						}
						if (typeof(drmConfigOption.Portal) !== 'undefined') {
							this.PLAYER.setWidevinePortalID(drmConfigOption.Portal);
						}
						if (typeof(drmConfigOption.DeviceID) !== 'undefined') {
							this.PLAYER.setWidevineDeviceID(drmConfigOption.DeviceID);
						}
						if (typeof(drmConfigOption.ClientIP) !== 'undefined') {
							this.PLAYER.setWidevineClientIP(drmConfigOption.ClientIP);
						}
						if (typeof(drmConfigOption.StreamID) !== 'undefined') {
							this.PLAYER.setWidevineStreamID(drmConfigOption.StreamID);
						}
						if (typeof(drmConfigOption.DRMAckServerURL) !== 'undefined') {
							this.PLAYER.setWidevineDrmAckURL(drmConfigOption.DRMAckServerURL);
						}
						if (typeof(drmConfigOption.DRMHeartBeatURL) !== 'undefined') {
							this.PLAYER.setWidevineHeartbeatURL(drmConfigOption.DRMHeartBeatURL);
						}
						if (typeof(drmConfigOption.DRMHeartBeatPeriod) !== 'undefined') {
							this.PLAYER.setWidevineHeartbeatPeriod(drmConfigOption.DRMHeartBeatPeriod);
						}
						this.PLAYER.setWidevineDeviceType(60);   // accoring to LG API doc: "Device type (default value : 0)"
						this.PLAYER.data = url;
						this.PLAYER.play(1);
						
					} else if (drmType === 'PLAYREADY') {
						// PlayReady
						this.createPlayer('PLAYREADY');
						this.show();
						
						var drmConfigOption = this.drmConfig.option || {};
						var customData = typeof(drmConfigOption.CustomData) !== 'undefined' ? drmConfigOption.CustomData : '';
						var licenseServer = typeof(drmConfigOption.LicenseServer) !== 'undefined' ? drmConfigOption.LicenseServer : '';

						var scope = this;
						var msgType = "application/vnd.ms-playready.initiator+xml";
						var DRMSystemID = "urn:dvb:casystemid:19219";
						var msg = '';
						msg += '<?xml version="1.0" encoding="utf-8"?>';
						msg += '<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">';
						msg +=   '<SetCustomData>';
						msg +=     '<CustomData>'+ customData +'</CustomData>';
						msg +=   '</SetCustomData>';
						msg +=   '<LicenseServerUriOverride>';
						msg +=     '<LA_URL>' + licenseServer + '</LA_URL>';
						msg +=    '</LicenseServerUriOverride>';
						msg += '</PlayReadyInitiator>';

						this.drmplugin.onDRMMessageResult = function(msgId, resultMsg, resultCode) {
							if (resultCode == 0) {
								scope.PLAYER.data = url;
								scope.PLAYER.play(1);
							} else {
								console.log("[Device_Lg_Player] onDRMMessageResult failed. error:" + resultCode);
								scope.onDRMError(resultCode, resultMsg);
							}
						};
						this.drmplugin.sendDRMMessage(msgType, msg, DRMSystemID);

					} else {
						this.createPlayer();
						this.show();
						this.PLAYER.data = url;
						this.PLAYER.play(1);
					}
				} else {
					// resume
					this.PLAYER.play(1);
				}

				if (attrs && attrs.position) {
					this._seekOnPlay = attrs.position;
				}

			} else if (cmd === 'pause') {
				return this.PLAYER.pause();

			} else if (cmd === 'stop') {
				this.$el.css("width", (this.width == 1280 ? 1279 : this.width));
				this.PLAYER.data = null;
				return this.PLAYER.stop();

			} else if (cmd === 'seek') {
				if (this.currentState === this.STATE_BUFFERING) {
					this._seekOnPlay = attrs.position;
				} else {
					this.PLAYER.seek(attrs.position);
				}

				return true;

			} else if (cmd === 'playbackSpeed') {
				return this.PLAYER.play(attrs.speed);

			} else if (cmd === 'show') {
				this.width = attrs.width || this.width;
				this.height = attrs.height || this.height;
				this.top = (typeof attrs.top !== 'undefined' ? attrs.top : this.top);
				this.left = (typeof attrs.left !== 'undefined' ? attrs.left : this.left);

				this.$el.css('visibility', 'visible');
				this.$el.css('width', this.width);
				this.$el.css('height', this.height);
				this.$el.css('top', this.top);
				this.$el.css('left', this.left);

			} else if (cmd === 'hide') {
				this.$el.css('visibility', 'hidden');

			} else if (cmd === 'setVideoDimensions') {
				// This functionality is addicted on LG Q.MENU

			} else if (cmd === 'audioTrack') {
				if (attrs.language) {
					this.PLAYER.audioLanguage = attrs.language;
				}
			}
		},

		/**
		 * Get unique ESN code. It is used for DRM verification.
		 * 
		 * @private
		 */
		getESN: function() {
			return Device.getUID();
		},

		/**
		 * Handling changes in player state
		 * @private
		 */
		onNativePlayStateChange: function(){
			var state = this.PLAYER.playState;

			if (state === 0) {
				// stopped
				this.onEnd();

			} else if(state === 1) {
				// playing
				if (!this.duration && this.PLAYER.playTime) {
					this.onDurationChange(this.PLAYER.playTime);
				}

				this.state(this.STATE_PLAYING);

				if (this._seekOnPlay) {
					this.PLAYER.seek(this._seekOnPlay);
					this._seekOnPlay = 0;
				}

			} else if (state === 2) {
				// paused
				this.state(this.STATE_PAUSED);

			} else if (state === 3 || state === 4) {
				// connecting || buffering
				if (this.currentState !== this.STATE_BUFFERING) {
					this.state(this.STATE_BUFFERING);
				}

			} else if (state === 5) {
				// finished
				this.onEnd();

			} else if(state === 6) {
				// error
				this.onNativeError();
			}
		},
		
		/**
		 * @param {Number} resultCode
		 * @param {String} resultMsg
		 */
		onDRMError: function(resultCode, resultMsg) {
			var errorMsg, errorDetail;
			switch(resultCode) {
				case 1: 
					errorMsg = 'Unknown Error';
					errorDetail = 'SendDRMMessage() failed because an unspecified error occurred.';
					break; 
				case 2:
					errorMsg = 'Cannot Process Request';
					errorDetail = 'SendDRMMessage() failed because the DRM agent was unable to complete the necessary computations in the time allotted.';
					break;
				case 3:
					errorMsg = 'Unknown MIME Type';
					errorDetail = 'SendDRMMessage() failed because the specified Mime Type is unknown for the specified DRM system indicated in the MIME type';
					break;
				case 4:
					errorMsg = 'User Consent Needed';
					errorDetail = 'SendDRMMessage() failed because user consent is needed for that action';
					break;
				default:
					errorMsg = 'Unknown Error';
					errorDetail = 'SendDRMMessage() failed due to Unknown Error';
					break;
			}
			this.onError('-1', errorMsg, errorDetail);
		},

		/**
		 * Player error handler
		 * 
		 * @private
		 */	
		onNativeError: function() {
			var code = this.el.error,
				msg = 'Unknown Error';

			if (code === 0) {
				msg = 'A/V format not supported';

			} else if (code === 1) {
				msg = 'Cannot connect to server or connection lost';

			} else if (code === 2) {
				msg = 'Unidentified error';

			} else if (code === 1000) {
				msg = 'File not found';

			} else if (code === 1001) {
				msg = 'Invalid protocol';

			} else if (code === 1002) {
				msg = 'DRM failure';

			} else if (code === 1003) {
				msg = 'Play list is empty';

			} else if (code === 1004) {
				msg = 'Unrecognized play list';

			} else if (code === 1005) {
				msg = 'Invalid ASX format';

			} else if (code === 1006) {
				msg = 'Error in downloading play list';

			} else if (code === 1007) {
				msg = 'Out of memory';

			} else if (code === 1008) {
				msg = 'Invalid URL list format';

			} else if (code === 1100) {
				msg = 'Unidentified WM-DRM error';

			} else if (code === 1101) {
				msg = 'Incorrect license in local license store';

			} else if (code === 1102) {
				msg = 'Fail in receiving correct license from server';

			} else if (code === 1103) {
				msg = 'Stored license is expired';

			}

			this.onError(code, msg);
		}
	});

	return Device_Lg_Player;

})(Events);