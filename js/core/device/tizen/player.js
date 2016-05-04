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

			this.$el.css({left : Math.round(this.left), top : Math.round(this.top), width: Math.round(this.width), height: Math.round(this.height)});
			
			this.multitasking = {
                playerTime: 0,
                playerState: null,
                playbackSpeed: 1,
                url: '',		// player url
                verifyUrl: '',	// verification url for license
                hidden: false
			}; // object for remember data during app is hidden

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
					if(this.drmType == 'widevine' || this.drmType == 'playready') {		// WIDEVINE || PLAYREADY DRM
						this.multitasking.hidden = true;
						if (this.url && this.currentTime) {
			                this.multitasking.url = this.url;
			                this.multitasking.playerState = this.currentState;
			                this.multitasking.playerTime = this.currentTime / 1000;
			                this.multitasking.playbackSpeed = this.playbackspeed;
						}
						
						if(this.currentState != this.STATE_IDLE) {
							this.native('stop');
						}
					} else {	// NO DRM
						this.PLAYER.suspend();
					}
				}
			}, this);
			
			/*
			 * VisibilityChange
			 * - resume application
			 * - Player restore
			 * *PP*
			 */
			Device.on('resumeApp', function() {
				var scope = this;
				
				if (this.isMute) {
					Device.AUDIOCONTROL.setMute(true);
				}
				
				try {
					if (this.currentState !== this.STATE_IDLE) {
						if(this.drmType == 'widevine' || this.drmType == 'playready') {		// WIDEVINE || PLAYREADY DRM
							var verifyUrl = (this.multitasking.verifyUrl.length)? this.multitasking.verifyUrl : this.multitasking.url;
							this.onReqVerifyPlayback(verifyUrl).done(function() {
								// CUSTOM SOLUTIONS InstantON - PP
			                    if(this.multitasking.state == this.STATE_PLAYING) {
			                    	/* ************************************
			                    	 * PLAYING
			                    	 * ********************************** */
			                    	
			                    	var setplayback = function(state) {			// Playback Speed
			                    		if(state == Player.STATE_PLAYING) {
			                    			Player.off('statechange', setplayback);
				                    		setTimeout(function() {
				                    			if(scope.multitasking.playbackSpeed !== 1) {
				                    				scope.playbackspeed = scope.multitasking.playbackSpeed;
				                    				scope.PLAYER.setSpeed(scope.multitasking.playbackSpeed); // -16, -8, -4, -2, -1, 1, 2, 4, 8, 16
					                    		}
				                    		}, 500);
			                    		}
			                    	};
			                    	
			                    	// RUN
			                    	Player.on('statechange', setplayback);
			                    	setTimeout(function() {
			                    		scope.native('play', {
					                    	position: scope.multitasking.playerTime*1000,
					                    	url: scope.url
					                    });
			                    	}, 500);
			                    } else if(APP.multitasking.state == SDK.player.STATE_PAUSED) {
			                    	/* ************************************
			                    	 * PAUSED
			                    	 * ********************************** */
			                    	
			                    	scope.PLAYER.open(scope.url);
			                    	
			                    	if(scope.drmType == 'playready') {			// PLAYREADY
			                    		if (scope.customData) {
											var drmParam = {
												CustomData: scope.customData
											};
											Player.setDrmType('playready');
											scope.PLAYER.setDrm("PLAYREADY", "SetProperties", JSON.stringify(drmParam));
										}
			                    	} else if(scope.drmType == 'widevine') {	// WIDEVINE
			                    		scope.PLAYER.setStreamingProperty ('WIDEVINE', scope.prepareWidevine(scope.config.DRMconfig || {}));
										
										if (scope.customData) {
											var drmParam = {
												CustomData: scope.customData
											};
											Player.setDrmType('widevine');
											scope.PLAYER.setDrm('WIDEVINE_CLASSIC', 'SetProperties', JSON.stringify(drmParam));
										}
			                    	}
			                    	
			                    	scope.PLAYER.prepareAsync(function() {
										Player.PLAYER.setDisplayRect(scope.left * scope.uhdMultiplier, scope.top * scope.uhdMultiplier, scope.width * scope.uhdMultiplier, scope.height * scope.uhdMultiplier);
										if(scope.multitasking.playerTime) {
											Player.PLAYER.seekTo(scope.multitasking.playerTime*1000, function() {scope.trigger('seekSuccess');}, function() {scope.trigger('seekError');});
										}
										scope.state(scope.STATE_PAUSED);
									});
			                    }
							}, this).fail(function() {
								Developer.reload();
							}, this);
						} else {									// NO_DRM
							this.PLAYER.restore();
						}
					}
				} catch(e) {
					console.warn(e);
					Developer.reload();
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
				try {
					if (attrs && attrs.url) {
						this.url = attrs.url;
						this.PLAYER.open(this.url);
						console.network('PLAYER', this.url);
						
						if(attrs.url.match(/\/manifest/i)) {
							//playready
							if (this.customData) {
								var drmParam = {
									//LicenseServer: this.config.DRMconfig.DRM_URL,
									//DeleteLicenseAfterUse: true,
									CustomData: this.customData
								};
								Player.setDrmType('playready');
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
								Player.setDrmType('widevine');
								this.PLAYER.setDrm('WIDEVINE_CLASSIC', 'SetProperties', JSON.stringify(drmParam));
							}
						}
	
						this.PLAYER.prepareAsync(function() {
							Player.PLAYER.setDisplayRect(scope.left * scope.uhdMultiplier, scope.top * scope.uhdMultiplier, scope.width * scope.uhdMultiplier, scope.height * scope.uhdMultiplier);
							if (attrs && attrs.position) {
								Player.PLAYER.seekTo(attrs.position, function() {scope.trigger('seekSuccess');}, function() {scope.trigger('seekError');});
							}
	
							scope.state(this.STATE_BUFFERING);
							scope.PLAYER.play();
	
						});
					} else {
						if (attrs && attrs.position) {
							this.PLAYER.seekTo(attrs.position, function() {scope.trigger('seekSuccess');}, function() {scope.trigger('seekError');});
						}
						this.PLAYER.play();
						// STATE_PLAYING
						this.state(this.STATE_PLAYING);
					}
				
				} catch(e){
					console.warn(e);
					Developer.reload();
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
				this.playbackspeed = attrs.speed;
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

			} else if (cmd === 'hide') {
				// stop clears the screen
				this.PLAYER.stop();
				this.PLAYER.setDisplayRect(0, 0, 0, 0);

				if (typeof Device.screensaver == 'function') {
					Device.screensaver();
				}
	
			} else if (cmd === 'setVideoDimensions') {
				// done with this.PLAYER.setDisplayMethod('PLAYER_DISPLAY_MODE_LETTER_BOX'); in init
	
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
		 * Event for requirement verification URL.
		 * Inside, the request must be downloaded license and set custom_data
		 * Return is resolved or rejected promise.
		 * 
		 * @param {String} verifyUrl
		 * @return {Promise} promise
		 */
		onReqVerifyPlayback: function(verifyUrl) {
			return this.when(function(promise) {
				 this.setCustomData('');
				promise.resolve();
			}, this);
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