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
 * HbbTV Player class
 *
 * @author Mautilus s.r.o.
 * @class Device_HbbTV_Player
 * @extends Player
 */

Device_HbbTV_Player = (function (Events) {
	var Device_HbbTV_Player = {};

	$.extend(true, Device_HbbTV_Player, {
		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function () {
			var scope = this;

			$('body').append('<div id="vidcontainer" style="position: absolute; background: transparent; left: 0px; top: 0px; width: 1280px; height: 720px;"></div>');
			this.$videoContainer = $('#vidcontainer');

			this.createPlayer('video/broadcast');

			clearTimeout(this.ticker);
			this.ticker = setInterval(function () {
				scope.tick();
			}, 500);
		},

		/**
		 * @inheritdoc Player#deinitNative
		 */
		deinitNative: function () {
			console.log('[Device_HbbTV_Player] deinitNative process: '+ this.PLAYER);
			if (!this.PLAYER) {
				return;
			}
			console.log('[Device_HbbTV_Player] deinitNative start');
			try {
				this.PLAYER.stop();
			} catch(e) {
				console.log('error PLAYER.stop(): ' + e);
			}
			this.PLAYER.data = '';
			try {
				this.PLAYER.release();
			} catch(e) {
				console.log('error PLAYER.release(): ' + e);
			}
			//this.PLAYER.parentNode.removeChild(this.PLAYER); -- not working in FireTV
			this.$videoContainer[0].innerHTML = '';
			this.PLAYER = false;
			this.type = '';
			console.log('[Device_HbbTV_Player] deinitNative end');
		},

		/**
		 * Internal player timer
		 * 
		 * @private
		 */
		tick: function () {
			if (this.url && this.PLAYER && typeof this.PLAYER.playTime !== 'undefined') {
				if (!this.duration && this.PLAYER.playTime) {
					this.onDurationChange(this.PLAYER.playTime);
				}

				var pos = Math.round(this.PLAYER.playPosition >> 0);

				if (pos && pos !== this.currentTime) {
					this.onTimeUpdate(pos);
				}
			}
		},

		/**
		 * Function for creating player object 
		 * 
		 * @private
		 * @param {String} type Type of playable content 'video/broadcast' or 'video/mp4'
		 */
		createPlayer: function (type) {
			console.log('[Device_HbbTV_Player] createPlayer: ' + type);
			if (this.PLAYER) {
				this.deinitNative();
			}
			this.type = type;

			var strVideo;
			if(Device.isFireTVPlugin()) {
				strVideo = '<object id="video" type="" width="1280" height="720" style="z-index: 1; position: absolute; left: 0px; top: 0px; width: 1280px; height: 720px; visibility: hidden; outline: transparent"></object>';
				this.$videoContainer[0].innerHTML = strVideo;
				this.PLAYER = document.getElementById('video');
				this.PLAYER.setAttribute('type', type);  // fireTV
			} else {
				// Samsung
				strVideo = '<object id="video" type="' + type + '" width="1280" height="720" style="z-index: 1; position: absolute; left: 0px; top: 0px; width: 1280px; height: 720px; visibility: hidden; outline: transparent"></object>';
				this.$videoContainer[0].innerHTML = strVideo;
				this.PLAYER = document.getElementById('video');
			}

			// style can be set only after object is inserted to DOM not sooner! - for FireTV
//			obj.style.position = 'absolute';
//			obj.style.width = this.config.width + 'px';
//			obj.style.height = this.config.height + 'px';
//			obj.style.left = this.config.left + 'px';
//			obj.style.top = this.config.top + 'px';
//			obj.style.outline = 'transparent';
//			obj.style.zIndex = '0';
//			obj.style.visibility = 'hidden';

//			this.PLAYER.type = 'video/mp4';    // fireTV
//			console.log('[Device_HbbTV_Player] setAttribute');


			if(type === 'video/broadcast') {
				this.initBroadcastPlayer();
			} else if(type === 'video/mp4') {
				this.initAVPlayer();
			}
		},

		/**
		 * Function for initializing broadcast player 
		 * 
		 * @private
		 */
		initBroadcastPlayer: function() {
			console.log('initBroadcastPlayer');
			try {
				this.PLAYER.bindToCurrentChannel();
			} catch (e) {
				console.error('error bindToCurrentChannel: ' + e);  // ignore
			}
			try {
				this.PLAYER.setFullScreen(true);
			} catch (e) {
				console.error('error setFullScreen: ' + e);  // ignore
			}
		},

		/**
		 * Function for initializing AV player 
		 * 
		 * @private
		 */
		initAVPlayer: function() {
			var scope = this;
			this.PLAYER.onPlayStateChange = function (state, error) {
				scope.onNativePlayStateChange(state, error);
			};

			this.PLAYER.onPlaySpeedChanged = function () {
			};
			this.PLAYER.onPlayPositionChanged = function () {
			};
		},

		/**
		 * @inheritdoc Player#native
		 */
		native: function (cmd, attrs) {
			console.log('[Device_HbbTV_Player] cmd: ' + cmd);
			var scope = this, url;

			if (cmd === 'play') {
				if (attrs && attrs.url) {
					url = this.url;
					this._seekOnPlay = null; // clear

					console.network('PLAYER', this.url);

					this.createPlayer('video/mp4');
					this.PLAYER.style.visibility = 'visible';
					this.PLAYER.data = url;
				}

				this.PLAYER.play(1);

				if (attrs && attrs.position) {
					this._seekOnPlay = attrs.position;
				}

			} else if (cmd === 'pause') {
				return this.PLAYER.play(0);

			} else if (cmd === 'stop') {
				this.PLAYER.stop();
				this.PLAYER.data = '';

			} else if (cmd === 'seek') {
				return this.PLAYER.seek(attrs.position);

			} else if (cmd === 'playbackSpeed') {
				return this.PLAYER.play(attrs.speed);

			} else if (cmd === 'show') {
				if(!this.PLAYER) {
					return;
				}

				this.width = attrs.width || this.width;
				this.height = attrs.height || this.height;
				this.top = (typeof attrs.top !== 'undefined' ? attrs.top : this.top);
				this.left = (typeof attrs.left !== 'undefined' ? attrs.left : this.left);

				this.PLAYER.style.visibility = 'visible';
				this.PLAYER.style.width = this.width + 'px';
				this.PLAYER.style.height = this.height + 'px';
				this.PLAYER.style.top = this.top + 'px';
				this.PLAYER.style.left = this.left + 'px';

			} else if (cmd === 'hide') {
				this.PLAYER.style.visibility = 'hidden';
				//this.$el.css('visibility', 'hidden');

			} else if (cmd === 'setVideoDimensions') {
				// @todo

			} else if (cmd === 'audioTrack') {
				// @todo
			}
		},

		/**
		 * Get unique ESN code. It is used for DRM verification.
		 * 
		 * @private
		 */
		getESN: function () {
			// @todo
		},

		/**
		 * Handling changes in player state
		 * 
		 * @private
		 */
		onNativePlayStateChange: function (state, error) {
			var state = this.PLAYER.playState;
			console.log('[Device_HbbTV_Player] onNativePlayStateChange: ' + state);

			if (state == 0) {
				//stopped
			} else if (state == 1) {
				// playing
				this.state(this.STATE_PLAYING);

				if (this._seekOnPlay) {
					this.PLAYER.seek(this._seekOnPlay);
					this._seekOnPlay = 0;
				}

			} else if (state == 2) {
				// paused
				this.state(this.STATE_PAUSED);
			} else if (state == 3) {
				// connecting
				this.state(this.STATE_BUFFERING);
			} else if (state == 4) {
				// buffering
				this.state(this.STATE_BUFFERING);
			} else if (state == 5) {
				// finished
				this.onEnd();
			} else if (state == 6) {
				// error
				var errorno = isNaN(this.PLAYER.error) ? '' : this.PLAYER.error + '';
				var errormsg = '';
				switch(errorno) {
					case '0':
						errormsg = 'A/V format not supported';
						break;
					case '1':
						errormsg = 'cannot connect to server or lost connection';
						break;
					case '2':
						errormsg = 'unidentified error';
						break;
						// 3-6 are defined in OIPF annex B
					case '3':
						errormsg = 'insufficient resources.';
						break;
					case '4':
						errormsg = 'content corrupt or invalid.';
						break;
					case '5':
						errormsg = 'content not available.';
						break;
					case '6':
						errormsg = 'content not available at given position.';
						break;
					    // defined in HbbTV for download content
					case '7':
						errormsg = 'content blocked due to parental control.';
						break;
				}
				console.log('error no: ' + errorno + ', msg: ' + errormsg);
				this.onError(0, errorno);
			}
			//console.log('[onPlayStateChange] ' + state + ', error: ' + error);
		}
	});

	return Device_HbbTV_Player;

})(Events);
