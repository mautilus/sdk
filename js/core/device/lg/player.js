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
			/**
			 * @property {String} drm Current DRM platform name
			 */
			drm: null
	};

	$.extend(true, Device_Lg_Player, {

		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function() {
			var scope = this;

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
         * 
		 * @private
		 */
		createPlayer: function(drm){
			var scope = this;

			if (this.PLAYER){
				this.deinitNative();
			}

			this.$el = $('<object id="LGPLAYER" type="application/x-netcast-av" ' + (drm ? 'drm_type="' + drm + '" ' : '')
					+ 'data="" width="' + this.config.width + '" height="' + this.config.height + '" style="width:' + (this.config.width == 1280 ? 1279 : this.config.width) + 'px;height:' + this.config.height + 'px;'
					+ 'top:' + this.config.top + 'px;left:' + this.config.left + 'px;'
					+ 'position:absolute;z-index:0;visibility:hidden"></object>').appendTo('body');
			this.PLAYER = this.$el[0];

			this.PLAYER.onPlayStateChange = function() {
				scope.onNativePlayStateChange();
			};

			this.drm = drm || null;

			Player.trigger('init');

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
			var url, drmUrl;

			if (cmd === 'play') {
				if (attrs && attrs.url) {
					url = this.url;

					console.network('PLAYER', this.url);

					if ((typeof url === 'object' && url && url.DRM_URL) || String(url).match(/\.wvm/)) {
						// widevine
						if (this.drm !== 'widevine') {
							this.createPlayer('widevine');
							this.show();
						}

						if (typeof url !== 'object') {
							drmUrl = $.extend(true, {}, this.config.DRMconfig || {}, {url: url});

						} else {
							drmUrl = $.extend(true, {}, url);
							url = drmUrl.url;
						}

						this.PLAYER.setWidevineDrmURL(drmUrl.DRM_URL);

						if (this.customData) {
							this.PLAYER.setWidevineUserData(this.customData);
						}

						this.PLAYER.setWidevinePortalID(drmUrl.PORTAL);
						this.PLAYER.setWidevineDeviceType(60);
						this.PLAYER.setWidevineDeviceID(this.getESN());

					} else if (this.drm) {

						// plain
						this.createPlayer();
						this.show();
					} else if (this.customData && Device.DRMAGENT) {
						console.log("LG DRM");

						this.createPlayer();

						var msgType = "application/vnd.ms-playready.initiator+xml",
							scope = this;
						DRMSystemID = "urn:dvb:casystemid:19219",
						msg =
							'<?xml version="1.0" encoding="utf-8"?>' +
							'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
							'<SetCustomData>' +
							'<CustomData>' + this.customData + '</CustomData>' +
							'</SetCustomData>' +
							'</PlayReadyInitiator>';

						Device.DRMAGENT.onDRMMessageResult = function(msgId, resultMsg, resultCode) {
							console.log("onDRMMessageResult " + resultCode);
							if (resultCode == 0) {
								console.log("play url = " + url);
								scope.PLAYER.data = url;
								scope.PLAYER.play(1);
								Player.sendDRMHeartbeat();
							} else {
								console.log("download failed. erreur:" + resultCode);
							}
						};

						console.log("SEND DRM " + msgType + this.customData + DRMSystemID);
						Device.DRMAGENT.sendDRMMessage(msgType, msg, DRMSystemID);
						return;
					} else {
						this.createPlayer();
						this.PLAYER.data = url;
					}
				}

				this.PLAYER.play(1);

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