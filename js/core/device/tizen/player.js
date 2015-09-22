/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

// http://www.samsungdforum.com/TizenApiGuide/tizen3001/index.html#::AVPlay::AVPlayManager::prepare

/**
 * Tizen Player class
 * 
 * @author Mautilus s.r.o.
 * @class Device_Tizen_Player
 * @extends Player
 */

Device_Tizen_Player = (function(Events) {
	var Device_Tizen_Player = {
	};

	$.extend(true, Device_Tizen_Player, {
		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function() {
			var scope = this;
			this.el = Device.AVPLAYER;
			this.$el = $(this.el);
			this.isMute = false;
			this.uhdMultiplier = (webapis.productinfo.isUdPanelSupported()) ? 1.5 : 1;   // ratio 1.5 for UHD models, 1.0 for normal model (used in .setDisplayRect())
	
			this.PLAYER = Device.PLAYER;
	
			this.PLAYER.setListener({
				onbufferingstart: function() {
					//console.log('[Device_Tizen_Player] onbufferingstart');
					scope.OnBufferingStart();
				},
				onbufferingprogress: function(percent) {
					//console.log('[Device_Tizen_Player] Buffering progress data : ' + percent);
				},
				onbufferingcomplete: function() {
					//console.log('[Device_Tizen_Player] onbufferingcomplete');
					scope.OnBufferingComplete();
					scope.OnStreamInfoReady();
					
					if(scope.currentTime === 0) {
						try {
							console.info("Player Info >>>\n"
								+ " URL: " + (Player.url) + "\n"
								+ " Duration: " + Player.PLAYER.getDuration() + "\n"
								//+ " Resolution: " + Player.el.Execute('GetVideoResolution') + "\n"
								//+ " Bitrates: " + Player.PLAYER.getStreamingProperty("AVAILABLE_BITRATE") + "\n"
								+ " Current Bandwidth: " + Player.PLAYER.getStreamingProperty ("CURRENT_BANDWITH") + "\n"
								+ " Audio tracks: " + JSON.stringify(scope.PLAYER.getTotalTrackInfo()) + "\n"
								);
	
						} catch (e) {
						}
					}
				},
				onstreamcompleted: function() {
					// console.log("[Device_Tizen_Player] onstreamcompleted");
					scope.PLAYER.stop();
					scope.onEnd();
				},
				oncurrentplaytime: function(currentTime) {
					//console.log('[Device_Tizen_Player] oncurrentplaytime: ' + currentTime);
					if (!scope.duration && scope.PLAYER.getDuration()) {
						scope.onDurationChange(scope.PLAYER.getDuration());
					}
					scope.OnCurrentPlayTime(currentTime);
				},
				onevent: function(eventType, eventData) {
					console.log("[Device_Tizen_Player] Event type: " + eventType + (eventData ? ", eventData: " + eventData : ""));
				},
				onsubtitlechange: function(duration, text, data3, data4) {
					console.log("[Device_Tizen_Player] Subtitle Changed.");
				},
				ondrmevent: function(drmEvent, drmData) {
					console.log("[Device_Tizen_Player] DRM event: " + drmEvent + ", data: " + drmData);
				},			
				ondrmcallback: function(drmType, drmData) {
					console.log("[Device_Tizen_Player] DRM callback: " + drmType + ", data: " + JSON.stringify(drmData));
				},			
				onerror : function(type, data) {
					console.log("[Device_Tizen_Player] Error " + type + ", data: " + data);
					scope.onError(type, data);
				}
			});
			
			/*
			 * VisibilityChange
			 * - hide application
			 * - Player suspend
			 * *PP*
			 */
			Device.on('hideApp', function() {
				if (this.isMute) {
					Device.AUDIOCONTROL.setMute(false);
				}
				if (this.currentState !== this.STATE_IDLE) {
					this.PLAYER.suspend();
				}
			}, this);
			
			/*
			 * VisibilityChange
			 * - resume application
			 * - Player restore
			 * *PP*
			 */
			Device.on('resumeApp', function() {
				if (this.isMute) {
					Device.AUDIOCONTROL.setMute(true);
				}
				if (this.currentState !== this.STATE_IDLE) {
					this.PLAYER.restore();
				}
			}, this);
	
		},
		/**
		 * @inheritdoc Player#deinitNative
		 */
		deinitNative: function() {
			this.PLAYER.stop();
			this.PLAYER.close();
		},
		/**
		 * @inheritdoc Player#native
		 */
		native: function(cmd, attrs) {
			var scope = this;

			if (cmd === 'play') {
				if (attrs && attrs.url) {
					console.network('PLAYER', this.url);
					this.PLAYER.open(this.url);
					
					if(attrs.url.match(/\/manifest/i)) {
						//playready
						if (this.customData) {
							var drmParam = {
								//LicenseServer: this.config.DRMconfig.DRM_URL,
								//DeleteLicenseAfterUse: true,
								CustomData: this.customData
							};
							this.PLAYER.setDrm("PLAYREADY", "SetProperties", JSON.stringify(drmParam));
						}
						
					} else if(attrs.url.match(/\.wvm/)) {
						//widevine
						this.PLAYER.setStreamingProperty ('WIDEVINE', this.prepareWidevine(this.config.DRMconfig || {}));
						
						if (this.customData) {
							var drmParam = {
								//LicenseServer: this.config.DRMconfig.DRM_URL,
								//DeleteLicenseAfterUse: true,
								CustomData: this.customData
							};
							this.PLAYER.setDrm('WIDEVINE_CLASSIC', 'SetProperties', JSON.stringify(drmParam));
						}
					}
	
					this.PLAYER.prepare();
					this.PLAYER.setDisplayRect(this.left * this.uhdMultiplier, this.top * this.uhdMultiplier, this.width * this.uhdMultiplier, this.height * this.uhdMultiplier);
					if (attrs && attrs.position) {
						this.PLAYER.seekTo(attrs.position, function() {scope.trigger('seekSuccess');}, function() {scope.trigger('seekError');});
					}
					this.PLAYER.play();
					// STATE_BUFFERING
					this.state(this.STATE_BUFFERING);
				} else {
					try {
						if (attrs && attrs.position) {
							this.PLAYER.seekTo(attrs.position, function() {scope.trigger('seekSuccess');}, function() {scope.trigger('seekError');});
						}
						this.PLAYER.play();
					} catch(e){
						console.warn(e);
					}
					// STATE_PLAYING
					this.state(this.STATE_PLAYING);
				}
				return true;
	
			} else if (cmd === 'pause') {
				this.PLAYER.pause();
				this.state(this.STATE_PAUSED);
				return true;
	
			} else if (cmd === 'stop') {
				this.PLAYER.stop();
	
			} else if (cmd === 'seek') {
				if(attrs.position < 50) {
					attrs.position = 50;   // fixed - seek to 0 is not working
				}
				try {
					this.PLAYER.seekTo(attrs.position, function() {scope.trigger('seekSuccess');}, function() {scope.trigger('seekError');});
				} catch(e) {
					console.warn(e);
				}
				return true;
			
			} else if (cmd === 'playbackSpeed') {
				return this.PLAYER.setSpeed(attrs.speed); // -16, -8, -4, -2, -1, 1, 2, 4, 8, 16
	
			} else if (cmd === 'show') {
				this.width = attrs.width || this.width;
				this.height = attrs.height || this.height;
				this.top = (typeof attrs.top !== 'undefined' ? attrs.top : this.top);
				this.left = (typeof attrs.left !== 'undefined' ? attrs.left : this.left);

				try {
					if(this.currentState !== this.STATE_IDLE) {
						this.PLAYER.setDisplayRect(this.left * this.uhdMultiplier, this.top * this.uhdMultiplier, this.width * this.uhdMultiplier, this.height * this.uhdMultiplier);    // e.g. set full or small rectangle of video
					}
				} catch(e) {
					console.warn(e);
				}
				this.$el.css({left : Math.round(this.left), top : Math.round(this.top), width: Math.round(this.width), height: Math.round(this.height)});
			
			} else if (cmd === 'hide') {
				// stop clears the screen
				this.PLAYER.stop();
				this.PLAYER.setDisplayRect(0, 0, 0, 0);
				this.$el.css({left:0, top:0, width: 0, height: 0});
				if (typeof Device.screensaver == 'function') {
					Device.screensaver();
				}
	
			} else if (cmd === 'setVideoDimensions') {
				// @todo:
	
			} else if (cmd === 'currentBitrate') {
				// @todo:
	
			} else if (cmd === 'audioTrack') {
				// @todo:
	
			} else if (cmd === 'mute') {
				// @todo: http://www.samsungdforum.com/TizenApiGuide/?FolderName=tizen841&FileName=index.html
				if(!this.isMute && !Device.AUDIOCONTROL.isMute()){
					Device.AUDIOCONTROL.setMute(true);
					this.isMute = true;
				}
			} else if (cmd === 'unmute') {
				// @todo: http://www.samsungdforum.com/TizenApiGuide/?FolderName=tizen841&FileName=index.html
				if(this.isMute && Device.AUDIOCONTROL.isMute()){
					Device.AUDIOCONTROL.setMute(false);
					this.isMute = false;
				}
			}
		},
		
		/**
		 * @private
		 * @param {Object} opts
		 * @param {String} opts.DEVICE_ID
		 * @param {Number} opts.DEVICE_TYPE_ID
		 * @param {String} opts.DRM_URL
		 * @param {String} opts.USER_DATA
		 * @param {String} opts.PORTAL
		 * @param {String} opts.HEARTBEAT_URL (optional)
		 */
		prepareWidevine: function(opts) {
			var optsStr = [];
			var defaults = {
				'DEVICE_ID': this.getESN(),
				'DEVICE_TYPE_ID': 60
			};
	
			opts = $.extend(true, {}, defaults, opts);
	
			$.each(opts, function(k, v) {
				optsStr.push(k + '=' + v);
			});
			
			console.log("prepareWidevine: " + optsStr.join('|'));
			return optsStr.join('|');
		},
		/**
		 * @private
		 */
		getESN: function() {
			var deviceId = null;
	
			try {
				deviceId = webapis.drminfo.getEsn('WIDEVINE');
			} catch (e) {
				return false;
			}
	
			return deviceId;
		},
		onDurationChange: function(duration) {
			this.duration = Math.round(duration);
			this.trigger('durationchange', this.duration);
		},
		/**
		 * @private
		 */
		OnBufferingStart: function() {
			this.state(this.STATE_BUFFERING);
		},
		/**
		 * @private
		 */
		OnBufferingComplete: function() {
			this.state(this.prevState !== this.STATE_BUFFERING && this.prevState !== this.STATE_IDLE ? this.prevState : this.STATE_PLAYING);
		},
		/**
		 * @private
		 */
		OnCurrentPlayTime: function(time) {
			this.onTimeUpdate(time);
	
			if (this.duration && this.looping && time >= this.duration - 1200) {
				// stop 1.2s before its end, because it solves hang issue while looping
				this.onEnd();
	
			} else if (this.duration && this.duration > 0 && time >= this.duration) {
				this.onEnd();
			}
		},
		/**
		 * @private
		 */
		OnStreamInfoReady: function() {
			this.onDurationChange(this.PLAYER.getDuration());
		}
	
	});

	return Device_Tizen_Player;

})(Events);