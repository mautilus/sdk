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
 * Arris Media Player
 *
 * @author Mautilus s.r.o.
 * @class Device_Arris_Player
 * @extends Player
 */

Device_Arris_Player = (function(Events) {
	var Device_Arris_Player = {
	};

	$.extend(true, Device_Arris_Player, {

		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function() {

			// TODO DS
			this.STATE_IDLE = 0;
			this.STATE_PENDING = 0;
			this.STATE_CONNECTING = 1;
			this.STATE_PAUSED = 2;
			this.STATE_PLAYING = 3;
			this.STATE_FASTFORWARDING = 4;
			this.STATE_REWINDING = 5;
			this.STATE_FAILED = 6;

			/**
			 * @property {Number} currentState Current playback state
			 */
			this.currentState = this.STATE_IDLE;

			this.PLAYER = null;
			//this.currentTime = 0;

			this.el = document.createElement('video');
			this.el.src = 'toi://';
			this.$el = $(this.el).addClass('player');
			this.$el.appendTo('body');
			this.$el.css({
					'position': 'absolute',
					'top': '0',
					'left': '0',
					'width': '100%',
					'height': '100%',
				});
			try {
				this.PLAYER = toi.mediaService.createPlayerInstance();
				alert('mediaPlayer is created');
			} catch(e) {
				alert('Failed creating player: ' + e);
			}
			this.setTimeoutTick = null;
			this.livePosition = 0;
			this.tickInterval = 500;

			this.PLAYER.addEventListener(this.PLAYER.ON_STATE_CHANGED, this.onStateChanged);
			this.PLAYER.addEventListener(this.PLAYER.ON_DATA_AVAILABLE, this.onDataAvailable);
			this.PLAYER.addEventListener(this.PLAYER.ON_POSITION_CHANGED, this.onPositionChanged);
			this.PLAYER.addEventListener(this.PLAYER.ON_DATA_AVAILABLE, function(status) {
				console.log('DATA AVAILABLE: ' + status.status);
			});
			//this.PLAYER.addEventListener(this.PLAYER.ON_POSITION_STATUS_CHANGED, this.onPositionStatusChanged);

			// set volume on analog to max and control volume over decoder in volume function
			this.volumeAnalog(100);

		},

		/**
		 * @inheritdoc Player#deinitNative
		 */
		deinitNative: function() {
			/*
			if (this.el && this.el.parentNode) {
				this.el.parentNode.removeChild(this.el);
			}
			*/

			try {
				this.PLAYER.close();
				this.PLAYER.releaseInstance();
				alert('mediaPlayer je prec');
			} catch(e) {
				alert(e);
			}
		},

		/**
		 * set changed state
		 */
		onStateChanged: function(state) {
			console.log('ON STATE CHANGED ' + state.state);
			Player.state(state.state);

			// sometimes the arris doesn't send info about position change, then we must call ticker here
			if (Player.state() == Player.STATE_PLAYING && Player.setTimeoutTick === null) {
				Player.tick();
				console.log('>>> PRE BUFFERING');
				try {
					Player.PLAYER.startTimeshiftBuffering(60);
				} catch(e) {
					console.log('>>> ERROR BUFFERING: ' + e);
				}
				console.log('>>> AFTER BUFFERING');
			}

		},

		onPositionChanged: function(ev) {

			var mpPosition = ev.position;
			var mpPace = ev.pace;

			// if pace is 0, then we are maybe on the end
			if (0 == ev.pace) {
				Player.onEnd();
			}

			// set player state
			Player.state(Player.PLAYER.getState());

			if (Player.setTimeoutTick === null) {
				Player.tick();
				console.log('>>> PRE BUFFERING');
				try {
						Player.PLAYER.startTimeshiftBuffering(60);
				} catch(e) {
					console.log('>>> ERROR BUFFERING: ' + e);
				}
				console.log('>>> AFTER BUFFERING');
			}

		},

		tick: function() {

			var positionInfo = Player.PLAYER.getPositionInfo();

			// for the live stream is position -1
			if (positionInfo.position == -1) {
				this.livePosition += this.tickInterval;
				positionInfo.position = this.livePosition;
			}

			Player.trigger('timeupdate', positionInfo.position);

			// repetitive function calling
			this.setTimeoutTick = setTimeout(function() {
				this.tick();
			}.bind(this), this.tickInterval);

		},

		onPositionStatusChanged: function(ev) {
		// position vrati pri live streame tiez -1
			alert('onPositionStatusChanged in arris');
			console.log('POSITION STATUS CHANGED 1 ', ev.positionInfo.position + ' < Position');
			console.log('POSITION STATUS CHANGED 2 ', Player.PLAYER.getSessionId() + ' < SessionId');
			setTimeout(function() {
				var positionInfo = Player.PLAYER.getPositionInfo();
				console.log('POSITION STATUS CHANGED 3 ' + positionInfo.position + ' < PositionInfo');
				var position = Player.PLAYER.getPosition();
				console.log('POSITION STATUS CHANGED 4 ' + position + ' < Position');

			}, 3000);
			/*
			if (Player.PLAYER.getPosition() > 10000) {
				console.log('POSITION STATUS CHANGED 5 ', Player.PLAYER.getPace() + ' < Peace');
				console.log('POSITION STATUS CHANGED 6', Player.PLAYER.getCapabilities() + ' < Capabilities');
				Player.PLAYER.playFromPosition(1000, 1000);
				console.log('POSITION STATUS CHANGED 7 ');
				console.log('POSITION STATUS CHANGED 8 ', 'OK');
			}
			*/
		},

		onDataAvailable: function() {
			alert('onDataAvailable');
		},

		/**
		 * Call native API, override this method with your device player
		 *
		 * @private
		 * @param {String} cmd Command
		 * @param {Object} [attrs]
		 */
		native: function(cmd, attrs) {
			var listener;
			console.log('PLAYER STATE: ' + this.PLAYER.getState());
			if (cmd === 'play') {
				if (this.PLAYER == null) {
					try {
						this.PLAYER = toi.mediaService.createPlayerInstance();
						alert('mediaPlayer created');
					} catch(e) {
						alert('Failed creating player: ' + e);
					}
				} else {
					//	alert('mediaP uz je vytvoreny');
					try {
						this.PLAYER.close();
					} catch(e) {
						alert ('Close media player: ' + e);
					}
				}

				//	this.url = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4'; 

				try {
					// reset variables
					this.livePosition = null;

					this.PLAYER.open(this.url);
					this.PLAYER.play(1000);
					alert('play is ready');
				} catch (e) {
					alert('Failed opening stream: ' + e);
					return;
				}

				App.model.stopSpin();
				return true;

			} else if (cmd === 'pause') {
				alert('pause');
				//return this.PLAYER.pause(1000);//this.PLAYER.pause();//this.el.pause();
				this.state(this.PLAYER.STATE_PAUSED);
				return this.PLAYER.play(0);

			} else if (cmd === 'stop') {
				alert('stop');
				this.$el.removeAttr('src'); // for html5 video player and reset //zap dava velky player
				//return 
				try {
					return this.PLAYER.play(0);
				} catch (e) {
					alert('stop fail' + e);
					return;
				}

				//this.$el.removeAttr('src'); 
				//return;

			} else if (cmd === 'seek') {
				alert('seek');
				alert('App.model.lastPlay.selectedPosition ' + App.model.lastPlay.selectedPosition);
			//	this.PLAYER.playFromPosition(attrs.position, 1);
				try {
					alert('playfromposition is ready');
					return this.PLAYER.playFromPosition(App.model.lastPlay.selectedPosition, 1000);
				} catch (e) {
					alert('Failed opening stream: ' + e);
					return;
				}
				App.model.stopSpin();
				return true;

				//return this.PLAYER.playFromPosition(App.model.lastPlay.selectedPosition, 1000);

				//this.PLAYER.playFromPosition(App.model.lastPlay.selectedPosition, 1000);
				//this.PLAYER.playFromPosition(0, 1);
				//this.el.currentTime = attrs.position / 1000;

			} else if (cmd === 'show') {
				alert('show arris player');
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

				this.$el.show();

			} else if (cmd === 'hide') {
				//alert('hide arris player');
				this.$el.hide();

			} else if (cmd === 'setVideoDimensions') {
				alert('setVD');
				var h = Math.round((this.width / attrs.width) * attrs.height);

				this.$el.css({
					height: h,
					top: Math.round((this.height - h) / 2)
				});

			} else if (cmd === 'audioTrack') {

			} else if (cmd === 'mute') {
				//this.el.muted = true;
			} else if (cmd === 'unmute') {
				//this.el.muted = false;
			} else if (cmd == 'volume') {
			}

		},

		/**
		 * @private
		 */
		/*
		onDurationChange: function(duration) {
			this.duration = Math.round(duration);
			this.trigger('durationchange', this.duration);

			console.info("Player Info >>>\n" + ' URL: ' + this.url + "\n" + ' Duration: ' + this.duration);
		},
		*/

		/**
		 * @private
		 */
		onTimeUpdate: function(time) {
			time = Math.round(time);
			alert('App.model.lastPlay.selectedPosition ' + App.model.lastPlay.selectedPosition);
			// !!! DON'T COMMIT TO SVN - Workaround for Live streams, where duration is too small (don't cover whole program time)
			// Sledovani.tv sometimes send duration in live stream about 30-40 sec and sometimes -1
			//this.duration = 0;
			// !!!

			if (this.duration <= 0 || this.duration >= time) {
				this.currentTime = time;
				this.trigger('timeupdate', this.currentTime);
			}
		},

		/**
		 * Start playback
		 *
		 * @param {String} [url]
		 * @param {Number} [position] Seek position (ms)
		 * @param {Boolean} [looping]
		 */
		play: function(url, position, looping, mediaOption) {

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
				this.mediaOption = mediaOption || {};
			}

			if (!this.url) {
				throw new Error('No video URL specified in Player');
			}

			this.show();

			/*
			if (this.speed !== 1) {
				//this.playbackSpeed(1);
			}
			*/

			alert ('>>>> url: ' + url);
			//this.config.DRMconfig=1;

			this.native('play', {
				url: url,
				position: position
			});
			//Device.smRegister(registerUrl,drmSecret);
			//App.sm.register(registerUrl,drmSecret);  ?????

			this.trigger('play', this.url, position);
		},

		/**
		 * Pause playback
		 */
		pause: function() {
			/*if (this.speed !== 1) {
			//	this.playbackSpeed(1);
			} */

			this.native('pause');
			this.trigger('pause');
		},

		/**
		 * Stop playback and reset player
		 */
		stop: function() {
			//this.native('stop');
			//this.trigger('stop', this.currentTime);

			this.reset();
		},

		/*
		seek: function(position) {
			alert('seekujem');
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
		*/

		/**
		 * Seek playback
		 *
		 * @param {Number} position Time position (ms)
		 */

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
		/*
		startSeek: function() {
			var remain = 20;

			// clear interval
			this.clearSeekInterval();

			this.trigger('seek-start');
			this.triggerHandle = setInterval(function() {
				if (remain == 0) {
					// finished but without success
					this.clearSeekInterval();
					this.trigger('seek-end');
				} else {
					remain--;
					if (this.currentState == this.STATE_PLAYING) { // movie is already playing ?
						this.clearSeekInterval();
						this.trigger('seek-end');
					}
				}
			}.bind(this), 1000);
		}, 
		clearSeekInterval: function() {
			// clear interval
			if (this.triggerHandle) {
				clearInterval(this.triggerHandle);
				this.triggerHandle = null;
			}
		}, */

		/**
		 * Get current state in text form for debugging.
		 *
		 * @returns {String}
		 */
		getState: function() {
			this.currentState = this.PLAYER.getState();
			console.log('!!!!!!!!! GET STATE: ' + this.currentState);
			switch (this.currentState) {
				//case PLAYER.STATE_IDLE: return 'IDLE';
				case PLAYER.STATE_IDLE:
					return 'STATE = STATE_IDLE';
				//case this.STATE_BUFFERING:
				//	return 'STATE = STATE_BUFFERING';
				case PLAYER.STATE_PLAYING:
					return 'STATE = STATE_PLAYING';
				case PLAYER.STATE_PAUSED:
					return 'STATE = STATE_PAUSED';
				case PLAYER.STATE_CONNECTING:
					return 'STATE = STATE_CONNECTING';
				case PLAYER.STATE_FASTFORWARDING:
					return 'STATE = STATE_FASTFORWARDING';
				case PLAYER.STATE_REWINDING:
					return 'STATE = STATE_REWINDING';
				case PLAYER.STATE_FAILED :
					return 'STATE = STATE_FAILED';
				case PLAYER.TIMESHIFT_STATE_INACTIVE:
					return 'STATE = STATE_INACTIVE';
				case PLAYER.TIMESHIFT_STATE_BUFFERING:
					return 'STATE = STATE_BUFFERING';
				case PLAYER.TIMESHIFT_STATE_STOPPED:
					return 'STATE = STATE_STOPPED';
				case PLAYER.TIMESHIFT_STATE_BUFFERING_FAILED:
					return 'STATE = STATE_BUFFERING_FAILED ';
				default:
					return 'STATE = undefined';
			}
		},

		/**
		 * set analog volume
		 * @param integer - volume
		 */
		volumeAnalog: function(volume) {

			var connections = toi.audioOutputService.getConnections();
			for (var i = 0; i < connections.length; i++) {

				var connection = connections[i];

				if (connection.type == toi.consts.ToiAudioOutputService.AUDIO_CONNECTION_TYPE_ANALOG) {
					try {
						toi.audioOutputService.setVolume(Device.getAnalogAudioConnection(), volume); 
					}
					catch(e) {
						alert('analog volume fail ' + e)
					}
				}

			}

		},

		/**
		 * set decoder volume
		 * @param integer - step
		 */
		volume: function(direction) {

			var connections = toi.audioOutputService.getConnections();
			for (var i = 0; i < connections.length; i++) {

				var connection = connections[i];

				if (connection.type == toi.consts.ToiAudioOutputService.AUDIO_CONNECTION_TYPE_DECODER) {
					try {

						// if the volume is muted then unmute
						if (toi.audioOutputService.getMuteState(Device.getDecoderAudioConnection())) {
							toi.audioOutputService.setMuteState(Device.getDecoderAudioConnection(), false)
						}

						var volume = toi.audioOutputService.getVolume(Device.getDecoderAudioConnection());
						volume = volume + direction;
						volume = (volume > 100) ? 100 : (volume < 0) ? 0 : volume ;
						toi.audioOutputService.setVolume(Device.getDecoderAudioConnection(), volume);
						return toi.audioOutputService.getVolume(Device.getDecoderAudioConnection());
					}
					catch(e) {
						alert('decoder volume fail ' + e)
					}
				}

			}
		},

		/**
		 * Mute audio
		 */
		mute: function() {
			//this.native('mute');
			var connections = toi.audioOutputService.getConnections();
			for (var i = 0; i < connections.length; i++) {
				var connection = connections[i];
				if (connection.type == toi.consts.ToiAudioOutputService.AUDIO_CONNECTION_TYPE_DECODER) {
					toi.audioOutputService.setMuteState(Device.getDecoderAudioConnection(), toi.audioOutputService.getMuteState(Device.getDecoderAudioConnection()) ? false : true);
					return toi.audioOutputService.getMuteState(Device.getDecoderAudioConnection());
				}
			}
		},

		/**
		 * get player position
		 */
		getPosition: function() {
			var positionInfo = Player.PLAYER.getPositionInfo();
			return (positionInfo && positionInfo.position) ? positionInfo.position : false ;
		}

	});

	return Device_Arris_Player;

})(Events);