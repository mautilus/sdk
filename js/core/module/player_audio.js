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
 * Audio Player
 *
 * @author Mautilus s.r.o.
 * @class Player_Audio
 * @singleton
 * @mixins Events
 */

Player_Audio = (function(Events) {
	var Player = {};

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


	$.extend(true, Player, Events, {
		STATE_IDLE: -1,
		STATE_PENDING: -1, // alias for STATE_IDLE
		STATE_BUFFERING: 0,
		STATE_PLAYING: 1,
		STATE_PAUSED: 2,
		config: {
			muted: false
		},
		/**
		 * Init Player_audio object
		 * @param {Object} [config={}] Player_audio configuration
		 */
		init: function(config) {
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
			 * @property {Boolean} looping TRUE for endless looping
			 */
			this.looping = true;

			this.initNative();

			if (this.config.muted) {
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

			this.el = document.createElement('audio');
			this.$el = $(this.el).addClass('player-audio');
			this.$el.appendTo('body');
			this.$el.css("position", "absolute");

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
				scope.onTimeUpdate(scope.el.currentTime * 1000);
			});

			this.el.addEventListener('error', function() {
				scope.onError(0, '');
			});
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
		},
		/**
		 * Call native API, override this method with your device player
		 *
		 * @private
		 * @param {String} cmd Command
		 * @param {Object} [attrs]
		 */
		native: function(cmd, attrs) {
			var scope = this, listener;
			
			if (cmd === 'play') {
				if (typeof attrs.url !== "undefined" && this.el.src !== this.url) {
					console.network('AUDIO', this.url);
					this.el.src = this.url;

					this.el.load();
				}

				this.el.play();

				if (attrs && attrs.position) {
					listener = function(event) {
						scope.el.currentTime = attrs.position / 1000;
						scope.el.removeEventListener('canplay', listener);
					};

					this.el.addEventListener('canplay', listener);
				}

				return true;

			} else if (cmd === 'pause') {
				return this.el.pause();

			} else if (cmd === 'stop') {
				this.$el.removeAttr('src');
				return this.el.pause();

			} else if (cmd === 'seek') {
				this.el.currentTime = attrs.position / 1000;
				return true;

			} else if (cmd === 'mute') {
				this.el.muted = true;

			} else if (cmd === 'unmute') {
				this.el.muted = false;
			}
		},
		/**
         * Function is binded on duration change event
         * @param {Number} duration Content duration
         * @fires durationchange
		 * @private
		 */
		onDurationChange: function(duration) {
			duration = Math.round(parseFloat(duration));

			if ((this.duration && this.duration === duration) || duration >= 4294967295000) {
				return false;
			}

			this.duration = duration;

			this.trigger('durationchange', this.duration);

			console.info("Audio Info >>>\n" + " URL: " + this.url + "\n" + " Duration: " + this.duration);
		},
		/**
         * Function is binded on time update event
         * @param {Number} time Current time
         * @fires timeupdate
		 * @private
		 */
		onTimeUpdate: function(time) {
			time = Math.round(time);

			if (this.duration <= 0 || this.duration >= time) {
				this.currentTime = time;
				this.trigger('timeupdate', this.currentTime);
			}
		},
		/**
         * Function is binded on end event
         * @fires end
		 * @private
		 */
		onEnd: function() {
			if (this.looping && this.duration) {
				this.seek(0);
				this.native('play');

			} else {
				this.trigger('end', this.currentTime);
				this.state(this.STATE_IDLE);
			}
		},
		/**
         * Function is binded on error event
         * @param {Number} code Error code
         * @param {String} msg Message
         * @param {String} [details] Error details
         * @fires error
		 * @private
		 */
		onError: function(code, msg, details) {
			this.trigger('error', code, msg, details);
		},
		/**
		 * Set/Get current state
		 *
		 * @param {Number} state
         * @returns current state
         * @fires statechange
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
		 * Reset all states and properties
         * @fires reset
		 */
		reset: function() {
			this.url = null;
			this.duration = 0;
			this.currentTime = 0;
			this.currentState = this.STATE_IDLE;
			this.speed = 1;

			this.trigger('reset');
		},
		/**
		 * Set media URL
		 *
		 * @param {String} url
         * @fires url
		 */
		setURL: function(url) {
			this.reset();

			this.url = url;
			this.trigger('url', this.url);
		},
		/**
		 * Start playback
		 *
		 * @param {String} [url] Url what should be played
		 * @param {Number} [position] Seek position (ms)
		 * @param {Boolean} [looping] If content should play again in the loop
         * @fires play
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

			if (!this.url) {
				throw new Error('No video URL specified in Player');
			}

			this.native('play', {
				url: url,
				position: position
			});

			this.trigger('play', this.url, position);
		},
		/**
		 * Pause playback
         * @fires pause
		 */
		pause: function() {
			this.native('pause');
			this.trigger('pause');
		},
		/**
		 * Stop playback and reset player
         * @fires stop
		 */
		stop: function() {
			this.native('stop');
			this.trigger('stop', this.currentTime);

			this.reset();
		},
		/**
		 * Seek playback
		 *
		 * @param {Number} position Time position (ms)
         * @fires seek
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

			this.trigger('seek', position);
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
		/*
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
         * @fires mute
		 */
		mute: function() {
			this.native('mute');
			this.trigger('mute');
		},
		/*
		 * Un-mute audio
         * @fires unmute
		 */
		unmute: function() {
			this.native('unmute');
			this.trigger('unmute');
		}
	});

	// Initialize this class when Main is ready
	Main.ready(function() {
		Player.init(CONFIG.player_audio);
	});

	Main.unload(function() {
		Player.deinit();
	});

	return Player;
})(Events);