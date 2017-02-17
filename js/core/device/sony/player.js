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
 * Media Player for Sony platform. HTML5 player is used.
 * 
 * @author Mautilus s.r.o.
 * @class Device_Sony_Player
 * @mixins Events
 * @extends Player
 */

Device_Sony_Player = (function(Events) {
	var Device_Sony_Player = {
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

		}
	};

	$.extend(true, Device_Sony_Player, Events, {
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
		 * @inheritdoc Player#init
		 */
		init: function(config) {
			this.deinit();

			this.configure(config);

			/**
			 * @property {String} url Media URL
			 */
			this.url = null;
			/**
			 * @property {Number} duration Media duration (ms)
			 */
			this.duration = 0;
			/**
			 * @property {Number} currentTime Current time position  (ms)
			 */
			this.currentTime = 0;
			/**
			 * @property {Number} currentState Current playback state
			 */
			this.currentState = this.STATE_IDLE;
			/**
			 * @property {Number} prevState Previous playback state
			 */
			this.prevState = null;
			/**
			 * @property {Number} speed Playback speed
			 */
			this.speed = 1;
			/**
			 * @property {Boolean} looping TRUE for endless looping
			 */
			this.looping = true;
			/**
			 * @property {Number} width Player width
			 */
			this.width = this.config.width;
			/**
			 * @property {Number} height Player height
			 */
			this.height = this.config.height;

			this.initNative();

			if(this.config.muted){
				this.mute();
			}
		},

		/**
		 * De-init player
		 * 
		 * @private
		 */
		deinit: function() {
			this.reset();
			this.deinitNative();
		},

		/**
		 * Set class config hash
		 * 
		 * @param {Object} config Hash of parameters
		 */
		configure: function(config) {
			this.config = $.extend(true, this.config || {}, config);
		},

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

			this.el.addEventListener('ended', function() {
				scope.onEnd();
			});

			this.el.addEventListener('durationchange', function() {
				scope.onDurationChange(scope.el.duration * 1000);
			});

			this.el.addEventListener('timeupdate', function() {
				scope.OnCurrentPlayTime(scope.el.currentTime * 1000);
			});

			this.el.addEventListener('error', function() {
				scope.onError(0, '');
			});
/*
			this.el.addEventListener('loadedmetadata', function() {
				console.log("loadedmetadata");

			});
*/	
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
				if (typeof attrs !== "undefined" && typeof attrs.url !== "undefined" && this.el.src !== this.url) {
					this._seekOnPlay = null; // clear
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
					this._seekOnPlay = attrs.position;
				}

				return true;

			} else if (cmd === 'pause') {
				return this.el.pause();

			} else if (cmd === 'resume') {
				//alert("philips('resume')");
				this.native('play');

			} else if (cmd === 'stop') {
				this.$el.removeAttr("src"); // for html5 video player and reset

				if (attrs && attrs.block) {
					this.onEnd(true);		// propagate soft 'end' event - without Path.goBack()
				} else {
					this.onEnd();
				}
				this.el.pause();
				return true;

			} else if (cmd === 'seek') {
				this.el.currentTime = attrs.position / 1000;
				this.native('playbackSpeed', {
					speed: 1
				});
				this.native('play', {});
				return true;

			} else if (cmd === 'playbackSpeed') {
				// not supported by sony
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
		onDurationChange: function(duration) {
			this.duration = Math.round(duration);
			this.trigger('durationchange', this.duration);

			console.info("Player Info >>>\n"
				+ " URL: " + this.url + "\n"
				+ " Duration: " + this.duration
				);
		},

		/**
		 * @private
		 */
		onError: function(code, msg, details) {
			this.trigger('error', code, msg, details);
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
		 * Show player and set it's position
		 * 
		 * @param {Number} [width]
		 * @param {Number} [height]
		 * @param {Number} [left]
		 * @param {Number} [top]
		 */
		show: function(width, height, left, top) {
			this.native('show', {
				width: width,
				height: height,
				left: left,
				top: top
			});

			document.body.className = String(document.body.className).replace(/\s?player-window\-[\d\-]+/g, '')
				+ ((this.width < 1280 || this.height < 720) ? ' player-window-' + (this.width || 1280) + '-' + (this.height || 720) + '-' + (this.left || 0) + '-' + (this.top || 0) : '');

			this.trigger('show');
		},

		/**
		 * Hide player
		 */
		hide: function() {
			this.native('hide');
			this.trigger('hide');
		},

		/**
		 * Show on fullscreen
		 */
		fullscreen: function() {
			return this.show(1280, 720, 0, 0);
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
		 * @param {Number} [position] Seek position (ms)
		 * @param {Boolean} [looping]
		 * @param {String} [url]
		 */
		play: function(position, looping, url) {
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
		 * Pause playback
		 */
		pause: function() {
			if(this.speed !== 1){
				this.playbackSpeed(1);
			}
			this.native('pause');
			this.trigger('pause');
		},

		
		/**
		 * Seek playback
		 * 
		 * @param {Number} position Time position (ms)
		 */
		seek: function(position) {
			if (String(position).match(/\%/)) {
				// percent
				position = this.duration / 100 * parseFloat(position);
			}

			position = position >> 0;

			if (position < 0) {
				position = 0;

			} else if (position > this.duration) {
				position = this.duration;
			}

			this.native('seek', {
				position: position
			});

			//this.startSeek();
			this.trigger('seek', position);
		},
		/*
		 * This function is called every time, when the player executes seek method.
		 * Seek method fires: forward, rewind and seek inside the movie.
		 * When the start seek is called, this method trigger seek-start and then it
		 * starts interval, which each seconds is testing, if the Player state is playing.
		 * If the condition is true, this method triggers seek-end. If within 20 seconds
		 * movie does not play, this interval is cleared and seek-end is triggered.
		 * 
		 * This functionality you can use for setting throbber progress inside video player.
		 */
		startSeek: function() {
			var scope = this, remain = 20;

			// clear interval
			this.clearSeekInterval();

			this.trigger("seek-start");
			this.triggerHandle = setInterval(function() {
			if (remain == 0) {
				// finished but without success
				scope.clearSeekInterval();
				scope.trigger("seek-end");
			}
			else {
				remain--;
				if (scope.currentState == scope.STATE_PLAYING) { // movie is already playing ?
				scope.clearSeekInterval();
				scope.trigger("seek-end");
				}
			}
			}, 1000);
		},

		clearSeekInterval: function() {
			// clear interval
			if (this.triggerHandle) {
			clearInterval(this.triggerHandle);
			this.triggerHandle = null;
			}
		},

		/**
		 * Fast Forward
		 * 
		 * @param {Number/String} skip Skip time (ms or %)
		 */
		forward: function(skip) {
			if (typeof skip === 'string' && skip.match(/\%/)) {
			skip = Math.round(this.duration / 100 * parseFloat(skip));
			}

			if (!skip) {
			skip = this.config.seekStep;
			}

			this.seek(this.currentTime + skip);
		},

		/**
		 * Fast Backward
		 * 
		 * @param {Number/String} skip Skip time (ms or %)
		 */
		backward: function(skip) {
			if (typeof skip === 'string' && skip.match(/\%/)) {
			skip = Math.round(this.duration / 100 * parseFloat(skip));
			}

			if (!skip) {
			skip = this.config.seekStep;
			}

			this.seek(this.currentTime - skip);
		},

		/**
		 * Set playback speed
		 * 
		 * @param {Number} speed
		 */
		playbackSpeed: function(speed) {
			speed = speed >> 0;

			this.speed = speed;
			this.native('playbackSpeed', {
				speed: this.speed
			});
			this.trigger('playbackspeed', this.speed);
		},

		/**
		 * Set video dimensions
		 * 
		 * @param {Number} width
		 * @param {Number} height
		 */
		setVideoDimensions: function(width, height) {
			this.native('setVideoDimensions', {
			width: width,
			height: height
			});
		},

		/**
		 * Set audio track by its index
		 * 
		 * @param {Number} index (0..)
		 */
		audioTrack: function(index) {
			this.native('audioTrack', {
			index: index
			});
		},
		/**
		 * Get current state in text form for debugging.
		 * 
		 * @returns {String} 
		 */
		getState: function() {
			switch (this.currentState) {
			case this.STATE_IDLE:
				return "STATE = STATE_IDLE";
			case this.STATE_BUFFERING:
				return "STATE = STATE_BUFFERING";
			case this.STATE_PLAYING:
				return "STATE = STATE_PLAYING";
			case this.STATE_PAUSED:
				return "STATE = STATE_PAUSED";
			default:
				return "STATE = undefined";
			}
		},
		/*
		 * Mute audio
		 */
		mute: function(){
			this.native('mute');
			this.trigger('mute');
		},
		/*
		 * Un-mute audio
		 */
		unmute: function(){
			this.native('unmute');
			this.trigger('unmute');
		},

		/**
		 * @private
		 */
		OnCurrentPlayTime: function(time) {
			Player.onTimeUpdate(time);
		},

		
		/**
		 * Called by buffering complete event
		 */
		onBufferingComplete: function() {
			this.trigger('buffering', false);
		},

		/**
		 * Called by buffering start event
		 */
		onBufferingStart: function() {
			this.trigger('buffering', true);
		},
		

		
	});

	return Device_Sony_Player;

})(Events);