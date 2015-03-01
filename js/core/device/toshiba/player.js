/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Media Player for Toshiba platform
 * 
 * @author Mautilus s.r.o.
 * @class Device_Toshiba_Player
 * @singleton
 * @mixins Events
 * @extends Player
 */

Device_Toshiba_Player = (function(Events) {
	var Device_Toshiba_Player = {
		STATE_IDLE: -1,
		STATE_PENDING: -1, // alias for STATE_IDLE
		STATE_BUFFERING: 0,
		STATE_PLAYING: 1,
		STATE_PAUSED: 2,
		config: {
			/**
			 * @cfg {Number} width Player width (px)
			 */
			width: 1280,
			/**
			 * @cfg {Number} height Player height (px)
			 */
			height: 720,
			/**
			 * @cfg {Number} top Player `top` position (px)
			 */
			top: 0,
			/**
			 * @cfg {Number} left Player `left` position (px)
			 */
			left: 0,
			/**
			 * @cfg {Number} seekStep Default seek time (ms)
			 */
			seekStep: 20000,
			/**
			 * @property {Number} counter Counts DRM responses - as we're sending 2 DRM messages (CustomData and LA_URL)
			 */
			counter: 0,
		}
	};

	$.extend(true, Device_Toshiba_Player, Events, {
		/**
		 * @event durationchange
		 * When duration is changed
		 * @param {Number} duration [ms]
		 */

		/**
		 * @event timeupdate
		 * When playback time (current position) is changed
		 * @param {Number} currentTime [ms]
		 */

		/**
		 * @event end
		 * When playback ends
		 * @param {Number} currentTime [ms] Should be same as duration
		 */

		/**
		 * @event error
		 * When error is detected
		 * @param {Number} code System error code
		 * @param {String} msg Error message
		 * @param {Number/String} details Error details from native API (if available)
		 */

		/**
		 * @event statechange
		 * When playback state has changed
		 * @param {Number} currentState One of possible states (STATE_IDLE, STATE_BUFFERING, STATE_PLAYING, STATE_PAUSED)
		 */

		/**
		 * @event reset
		 * When player configuration and properties are nulled
		 */

		/**
		 * @event show
		 * When player elemenent is shown
		 */

		/**
		 * @event hide
		 * When player elemenent is hidden
		 */

		/**
		 * @event url
		 * When URL is set, before playback starts
		 * @param {String} url URL address
		 */

		/**
		 * @event play
		 * When playback starts
		 * @param {String} url URL address
		 * @param {Number} position Resume position
		 */

		/**
		 * @event pause
		 * When playback is paused
		 */

		/**
		 * @event stop
		 * When playback stops
		 * @param {Number} currentTime [ms]
		 */

		/**
		 * @event seek
		 * When seek is requested
		 * @param {Number} position [ms] Seek position
		 */

		/**
		 * @event playbackspeed
		 * When playback speed is changed
		 * @param {Number} speed 1..8
		 */

		/**
		 * @event seek-start
		 * Seek stared
		 */

		/**
		 * @event seek-end
		 * Seek ended
		 */

		/**
		 * Init native API, override this method with your device player
		 * 
		 * @private
		 */
		initNative: function() {
			var scope = this;

			var html = '<video id="video" data="" type="" width="1280" height="720" style="position: absolute; z-index: 1; visibility: hidden;"></video>';

			$('#videoPlayer').html(html);
			this.el = document.getElementById('video');
			this.$el = $('#video');

			var drm = '<object id="drmplugin" type="application/oipfDrmAgent" style="visibility:hidden" width="0" height="0"></object>';
			$('#videoPlayer').append(drm);
			this.drmplugin = document.getElementById('drmplugin');

			if (this.drmplugin) {
				this.drmplugin.onDRMMessageResult = this.HandleOnDRMMessageResult;
				this.drmplugin.onDRMRightsError = this.HandleOnDRMRightsError;
			} else {
				alert('DRM Plugin initialization failed!');
				return false;
			}

			this.el.addEventListener('waiting', function() {
				scope.state(scope.STATE_BUFFERING);
			});

			this.el.addEventListener('playing', function() {
				scope.state(scope.STATE_PLAYING);
			});

			this.el.addEventListener('pause', function() {
				if (!scope.duration || scope.duration > scope.currentTime) {
					scope.state(scope.STATE_PAUSED);
				}
			});

			this.el.addEventListener('loadedmetadata', function() {
			});

			this.el.addEventListener('loadeddata', function() {
			});

			this.el.addEventListener('ended', function() {
				scope.onEnd();
			});

			this.el.addEventListener('durationchange', function() {
				scope.onDurationChange(scope.el.duration * 1000);

				if(scope._seekOnPlay){
					setTimeout(function() {
						scope.seek(scope._seekOnPlay);
						scope._seekOnPlay = 0;
					},1000);
				}

			});

			this.el.addEventListener('timeupdate', function() {
				scope.onTimeUpdate(scope.el.currentTime * 1000);
			});

			this.el.addEventListener('error', function(x) {
				alert("some kind of error " + x);
				scope.onError(0, '');
			});

			this.resumeTime = 0;
		},


		/**
		 * De-init native player
		 * 
		 * @private
		 */
		deinitNative: function() {
			if (this.el && this.el.parentNode) {
				this.el.parentNode.removeChild(this.el);
			}
			clearInterval(this.ticker);
		},

		/**
		 * Call native API, override this method with your device player
		 * 
		 * @private
		 * @param {String} cmd Command
		 * @param {Object} [attrs]
		 */
		native: function(cmd, attrs) {
			var scope = this;
			if (cmd === 'play') {
				if (typeof attrs.url !== "undefined" && this.el.src !== this.url) {
					console.network('PLAYER', this.url);
					this.el.src = this.url;
				}

				if (this.ticker) {
					clearInterval(this.ticker);
				}
				this.ticker = setInterval(function() {
					scope.tick();
				}, 1000);

				this.el.play();

				if (attrs && attrs.position) {
//					this.el.currentTime = attrs.position / 1000;
					this._seekOnPlay = attrs.position;
				}
				return true;

			} else if (cmd === 'pause') {
				return this.el.pause();

			} else if (cmd === 'stop') {
				this.$el.removeAttr("src"); // for html5 video player and reset
//				return this.el.pause();
				if (attrs && attrs.block) {
					this.onEnd(true);		// propagate soft 'end' event - without Path.goBack()
				} else {
					this.onEnd();
				}

			} else if (cmd === 'seek') {
				this.el.play();

				this.el.currentTime = attrs.position / 1000;
				return true;

			} else if (cmd === 'playbackSpeed') {
				this.el.playbackRate = attrs.speed;
				return this.el.playbackRate;

			} else if (cmd === 'show') {
				this.width = attrs.width || this.width;
				this.height = attrs.height || this.height;
				this.top = (typeof attrs.top !== 'undefined' ? attrs.top : this.top);
				this.left = (typeof attrs.left !== 'undefined' ? attrs.left : this.left);

				this.$el.css({
					width: this.width,
					height: this.height,
					left: this.left,
					top: this.top
				});
				this.$el.css('visibility', 'visible');

			} else if (cmd === 'hide') {
				this.$el.css('visibility', 'hidden');

			} else if (cmd === 'setVideoDimensions') {
				var h = Math.round((this.width / attrs.width) * attrs.height);

				this.$el.css({
					height: h,
					top: Math.round((this.height - h) / 2)
				});

			} else if (cmd === 'audioTrack') {

			} else if (cmd === 'mute') {
				this.el.muted = true;

			} else if (cmd === 'unmute') {
				this.el.muted = false;
			} else if (cmd === 'setFormat') {
				this.el.setAttribute("type",attrs.format);
			}
		},

		/**
		 * @private
		 */
		onTimeUpdate: function(time) {
			time = Math.round(time);

			if (this.duration <= 0 || this.duration >= time) {
				if (this.speed < 0 && time == 0) {
					this.play();
				} else {
					this.currentTime = time;
					this.trigger('timeupdate', this.currentTime);
				}
			} else if (this.duration >= 0 && time >= this.duration) {
				this.play();
				this.onEnd();
			} 
		},

		/**
		 * @private
		 */
		onEnd: function(block) {
			this.trigger('end', this.currentTime, block);
			this.state(this.STATE_IDLE);

			this.setURL('');
			this.play();
		},

		/**
		 * Set/Get current state
		 * 
		 * @param {Number} state
		 */
		state: function(state) {
			if (typeof state !== 'undefined') {
				if (this.currentState !== this.STATE_BUFFERING) {
					this.prevState = this.currentState;
				}

				this.currentState = state;
				this.trigger('statechange', this.currentState);
				return true;
			}

			return this.currentState;
		},

		/**
		 * Set media URL
		 * 
		 * @param {String} url
		 */
		setURL: function(url) {
			this.reset();
			this.url = url;

			if (this.el.src !== this.url) {
				console.network('PLAYER', this.url);
				this.el.src = this.url;
			}

			this.trigger('url', this.url);
		},

		/**
		 * Start playback
		 * 
		 * @param {String} [url]
		 * @param {Number} [position] Seek position (ms)
		 * @param {Boolean} [looping]
		 */
		play: function(url, position, looping) {
			if (!position && typeof url === 'number') {
				position = url;
				url = null;
			}

			if (url) {
				if (this.url && this.currentState !== this.STATE_IDLE) {
					this.stop();
				}

				this.setURL(url);
				this.looping = looping || false;
			}

			this.show();

			if(this.speed !== 1){
				this.playbackSpeed(1);
			}

			this.native('play', {
				url: url,
				position: position
			});
			this.trigger('play', this.url, position);
		},

		/**
		 * 
		 */
		sendLicenceRequest: function(xml){
			this.drmplugin.sendDRMMessage('application/vnd.ms-playready.initiator+xml', xml, 'urn:dvb:casystemid:19219');
		},

		HandleOnDRMMessageResult: function(msgID, resultMsg, resultCode) {
			if (resultCode == 0) {

				var url = Player.url;
				Player.setURL(url);

				if (Player.resumeTime) {
					Player.play(Player.resumeTime);
				} else {
					Player.play();
				}
			} else {
				alert("DRM ERROR!");
			}
		},

		HandleOnDRMRightsError: function() {
			alert("HandleOnDRMRightsError");
		},
	});

	return Device_Toshiba_Player;

})(Events);