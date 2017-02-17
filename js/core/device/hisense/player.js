/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Hisense Player class
 *
 * @author Mautilus s.r.o.
 * @class Device_Hisense_Player
 * @extends Player
 */

Device_Hisense_Player = (function(Events) {
	var Device_Hisense_Player = {
	};

	$.extend(true, Device_Hisense_Player, {
		/**
		 * @template
		 * @param {Object} drmConfig DRM configuration
		 * @returns {String}
		 */
		getCadProxy: function (drmConfig) {

		},

		playerLoadingTime: 45, // how many seconds can player wait for start playing
		playerUpdateTime: 60,

		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function () {
			var scope = this;

			this.licenseServer = '';

			this.type = 'video/mp4';
			//this.type = 'video/mp4';

			this.el = document.createElement('video');

			this.el.className = 'player';
			this.el.style.position = 'absolute';
			this.el.style.visibility = 'hidden';
			this.el.style.zIndex = 0;

			this.initTimeStamp();

			document.body.appendChild(this.el);

			this.listeners = {
				'waiting': function () {
					console.log('WAITING!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
					scope.state(scope.STATE_BUFFERING);
				},
				'playing': function () {
					console.log('PLAYING!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
					if (!scope.duration && scope.el.duration) {
						console.log('START TIME !!! ' + scope.el.duration +  + ' ' + scope.el.currentTime);
						scope.onDurationChange(scope.el.duration);
					}
					if (scope.seekOnPlay) {
						scope.el.currentTime = parseInt(scope.seekOnPlay / 1000, 10);
						//scope.seekChecking = true;
						scope.seekOnPlay = 0;
					}
					//if (!scope._loading){
					scope.state(scope.STATE_PLAYING);
					//}
				},
				'pause': function () {
					console.log('PAUSED: ' + scope.el.currentTime + ' ' + scope.timeStamp.time + ' ' + scope.el.networkState);

					if (!scope.duration || scope.duration > scope.currentTime) {
						scope.state(scope.STATE_PAUSED);
					}

					scope.state(scope.STATE_PAUSED);
				},
				'ended': function () {
					// console.log('[Device_Hisense_Player] onEnd');
					scope.onEnd();
				},
				'durationchange': function () {
					console.log('START TIME *** ' + scope.el.duration + ' ' + scope.el.currentTime);
					scope.onDurationChange(scope.el.duration * 1000);
				},
				'timeupdate': function () {
					var deltaTime = 0;
					var unixTime = new Date().getTime();

					if(scope.seekChecking){
						console.log('seekChecking!!!');
						deltaTime = 0;
						scope.timeStamp.unixTime = 0;
						scope.timeStamp.progress.time = 0;
						return;
					}

					if(scope._trickplaying){
						console.log('trickplaying!!! ' + scope.timeStamp.time + ' ' + scope.el.currentTime);
					}

					// computing deltaTime between current unix time and previous unix time (previous timeupdate event)
					if(scope.timeStamp.unixTime != 0){
						deltaTime = (unixTime - scope.timeStamp.unixTime) * 0.001;
					}
					scope.timeStamp.progress.time += deltaTime;

					deltaTime += (scope.timeStamp.time - parseInt(scope.timeStamp.time, 10));

					// current time is changed (e.g. from 12s to 13s)
					// synchonizing
					// sometimes (after seeking) this.el.currentTime can contains also miliseconds 10.352s instead of 10s
					if(parseInt(scope.timeStamp.time, 10) < parseInt(scope.el.currentTime, 10)){
						deltaTime = 0;
						scope.timeStamp.unixTime = 0;
						scope.timeStamp.progress.time = 0;
						scope.timeStamp.progress.counter++;
					}
					//else if(scope.timeStamp.time >= scope.el.currentTime){
					//    console.log(scope.timeStamp.time + '  ' + scope.el.currentTime);
					//}
					scope.timeStamp.time = scope.el.currentTime;

					// correction if deltaTime is greater then 1
					if(deltaTime > 1){
						deltaTime -= parseInt(deltaTime, 10);
					}
					scope.timeStamp.time = parseInt(scope.timeStamp.time, 10) + deltaTime;
					scope.timeStamp.unixTime = unixTime;

					// progress problem only during playing after defined seconds
					if(!scope._trickplaying && /*!scope.timerError && */scope.timeStamp.progress.time > scope.playerUpdateTime && scope.timeStamp.progress.counter > 0 && scope.currentState == scope.STATE_PLAYING){
						console.log('TIME PROGRESS ERROR ' + scope.el.currentTime + ' ' + scope.timeStamp.time);

						scope.el.currentTime = parseInt(scope.timeStamp.time,10);
						scope.timeStamp.unixTime = 0;
						scope.timeStamp.progress.time = 0;
						scope.timeStamp.progress.counter++;

						if(!window.throbber && scope.currentState != scope.STATE_BUFFERING){
							//scope.timerError = true;
							scope.state(scope.STATE_BUFFERING);
						}
					}

					// when stream does not play after defined seconds
					if(scope.timeStamp.progress.time > scope.playerLoadingTime && scope.timeStamp.progress.counter == 0){
						//console.log('TRIGGER PLAYER ERROR ' + scope.timeStamp.progress.time);
						scope.onNativeError();
						return;
					}

					// starting the video (only when the stream start to play). There is some delay with playing the content
					if(scope._loading && scope.timeStamp.progress.counter == 0){
						if(scope.currentState != scope.STATE_BUFFERING){
							scope.state(scope.STATE_BUFFERING);
						}
					}
					// reset possible loading after starting the stream
					else if (scope.loading && scope.timeStamp.progress.counter > 0){
						scope._loading = false;
					}

					// otherwise playing
					if(scope.timeStamp.progress.counter > 0 && scope.currentState != scope.STATE_PLAYING) {
						scope._loading = false;
						if(scope.timeStamp.progress.time > scope.playerUpdateTime){
							// loading loading
						}
						else{
							scope.state(scope.STATE_PLAYING);
						}
					}

					//console.log(scope.el.currentTime + ' TI=' + scope.timeStamp.time + '  ' + scope.timeStamp.progress.time + ' UT=' + unixTime + ' C=' + scope.timeStamp.progress.counter);
					//scope._onTimeUpdate(scope.el.currentTime * 1000); // badly computed timeupdate
					scope.onTimeUpdate(scope.timeStamp.time * 1000);
				},
				'error': function () {
					scope.onNativeError();
				}
			};

			this.el.addEventListener('waiting', this.listeners.waiting);
			this.el.addEventListener('playing', this.listeners.playing);
			this.el.addEventListener('pause', this.listeners.pause);
			this.el.addEventListener('ended', this.listeners.ended);
			//this.el.addEventListener('seeked', function () {});
			this.el.addEventListener('durationchange', this.listeners.durationchange);
			this.el.addEventListener('timeupdate', this.listeners.timeupdate);
			this.el.addEventListener('error', this.listeners.error);

//////////////////////////
// 			this.el.addEventListener('suspend', function () {
// 				console.log('SUSPEND!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			});
// 			this.el.addEventListener('canplay', function () {
// 			   console.log('CAN PLAY!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			});
// 			this.el.addEventListener('loadstart', function () {
// 			   console.log('LOAD START!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			});
// 			this.el.addEventListener('loadeddata', function () {
// 			   console.log('LOADED DATA!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			   //scope.el.play();
// 			});
// 			this.el.addEventListener('loadedmetadata', function () {
// 			   console.log('LOADED METADATA!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			});
// 			this.el.addEventListener('canplaythrough', function () {
// 			   console.log('CAN PLAY THROUGH!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			});
// 			this.el.addEventListener('play', function () {
// 				//console.log('PLAY was triggered');
// 				console.log('PLAY!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			});
// 			this.el.addEventListener('stalled', function () {
// 				console.log('STALLED!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			});
// 			this.el.addEventListener('emptied', function () {
// 				console.log('EMPTIED!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			});
// 			this.el.addEventListener('abort', function () {
// 				console.log('ABORT!!! ' + scope.el.readyState + ' ' + scope.el.networkState);
// 			});

		},

		/**
		 * @inheritdoc Player#deinitNative
		 */
		deinitNative: function () {
			if (this.el && this.el.parentNode) {
				this.el.removeEventListener('waiting', this.listeners.waiting);
				this.el.removeEventListener('playing', this.listeners.playing);
				this.el.removeEventListener('pause', this.listeners.pause);
				this.el.removeEventListener('ended', this.listeners.ended);
				//this.el.removeEventListener('seeked', function () {});
				this.el.removeEventListener('durationchange', this.listeners.durationchange);
				this.el.removeEventListener('timeupdate', this.listeners.timeupdate);
				this.el.removeEventListener('error', this.listeners.error);
				//this.el.stop();
				this.el.parentNode.removeChild(this.el);
			}
		},

		/**
		 * @private
		 */
		initTimeStamp: function(){
			//this.timerError = false;
			this.loadOnlyOnce = true;
			this.timeStamp = { time: 0, unixTime: 0, progress: {time: 0, counter: 0} };
		},

		/**
		 * @private
		 */
		setType: function (type) {
			if (this.el) {
				//this.el.data = '';
				this.el.type = type;
				this.type = type || null;
			}
		},

		/**
		 * @inheritdoc Player#native
		 */
		native: function (cmd, attrs) {
			var url, drmUrl, self = this;

			if (cmd === 'play') {
				if (attrs && attrs.url) {
					//  this.url = 'http://PlayReady.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest' + '?__rand=' + Math.floor(Math.random()*100000000);
					url = this.url;

					console.network('PLAYER', this.url);

					while (this.el.firstChild) {
						this.el.removeChild(this.el.firstChild);
					}
					var source = document.createElement('source');

					//url = 'http://smarttv.mautilus.com/showmax/hisense/webini.xml';

					if(this.drmConfig.type === 'PLAYREADY') {
						// PlayReady
						source.setAttribute('type', 'application/vnd.ms-playready.initiator+xml');
					} else {
						source.setAttribute('type', 'video/mp4');
					}

					source.setAttribute('src', url);

					this.el.appendChild(source);

					this.initTimeStamp();
					this._loading = true;
				}
				this.el.playbackRate = 1;
				this._trickplaying = false;
				//console.log('LOOOADDD');

				// NEED to correct load video only at start (once)
				if(this.loadOnlyOnce) {
					this.el.load();
					this.loadOnlyOnce = false;
				}

				this.el.play();

				if (attrs && attrs.position) {
					this.seekOnPlay = attrs.position;
				}

			} else if (cmd === 'pause') {
				return this.el.pause();

			} else if (cmd === 'stop') {
				var stop;
				if (this.el) {
					stop = this.el.pause();
					while (this.el.firstChild) {
						console.log('SRC:' + this.el.firstChild.getAttribute('src'));
						this.el.firstChild.setAttribute('src', '');
						this.el.removeChild(this.el.firstChild);
					}
				}

				this.deinitNative();
				this.initNative();
				return stop;

			} else if (cmd === 'seek') {
				if(this.el.currentTime < 1) {
					Control.disable();
					setTimeout(function () {
						Control.enable();
					},1000)
				}

				// DO NOT SEEK  forward AT LAST 20 SECONDS !!!
				if(parseInt(attrs.position / 1000, 10) !== parseInt(this.duration / 1000, 10)) {
					if (this.currentState === this.STATE_BUFFERING) {
						this.seekOnPlay = attrs.position;
					} else {
						this.el.currentTime = parseInt(attrs.position / 1000, 10);
					}

					return true;
				} else {
					return true;
				}

			} else if (cmd === 'playbackSpeed') {
				this.el.playbackRate = attrs.speed;
				if(attrs.speed == 1){
					this._trickplaying = false;
					this.el.currentTime = parseInt(this.timeStamp.time,10);
					console.log('Time2: ' + this.timeStamp.time + ' playbackRate=' + this.el.playbackRate);
					if(!window.throbber && this.currentState != this.STATE_BUFFERING){
						this.state(this.STATE_BUFFERING);
					}
				}
				else{
					this._trickplaying = true;
				}
				return this.el.playbackRate;

			} else if (cmd === 'show') {
				this.width = attrs.width || this.width;
				this.height = attrs.height || this.height;
				this.top = (typeof attrs.top !== 'undefined' ? attrs.top : this.top);
				this.left = (typeof attrs.left !== 'undefined' ? attrs.left : this.left);

				this.el.style.visibility = 'visible';
				this.el.style.width = this.width + 'px';
				this.el.style.height = this.height + 'px';
				this.el.style.top = this.top + 'px';
				this.el.style.left = this.left + 'px';

			} else if (cmd === 'hide') {
				this.el.style.visibility = 'hidden';

			} else if (cmd === 'setVideoDimensions') {
				var h = Math.round((this.width / attrs.width) * attrs.height);

				this.el.style.top = Math.round((this.height - h) / 2);
				this.el.style.height = h + 'px';

			} else if (cmd === 'bitrate') {
				// @todo: implement bitrate
				return -1;
			}
			else if (cmd === 'license_server') {
				this.licenseServer = attrs.license_server || '';
			} else if (cmd === 'audioTrack') {
				// @todo: check if audioLanguage is implemented
				if (attrs.language) {
					this.el.audioLanguage = attrs.language;
				}
			}/* else if (cmd === 'reset') {
			 if(this.isVideoTag){
			 while (this.el.firstChild) {
			 this.el.removeChild(this.el.firstChild);
			 }
			 }
			 }*/
		},

		/**
		 * @private
		 */
		getESN: function () {
			//return SDK.device.getUID();
		},

		onDurationChange: function(duration){
			this.duration = Math.round(duration);
			this.trigger('durationchange', this.duration);
		},

		onStateChange: function(state){
			switch (this.currentState) {
				case this.STATE_IDLE:
					console.log('IDLE state ' + (this.el.currentTime || 0) + ' X ' + this.currentTime + ' ' + Player.playing);
					break;
				case this.STATE_PENDING:
					console.log('PENDING state ' + (this.el.currentTime || 0) + ' X ' + this.currentTime + ' ' + Player.playing);
					break;
				case this.STATE_BUFFERING:
					console.log('BUFFERING state ' + (this.el.currentTime || 0) + ' X ' + this.currentTime + ' ' + Player.playing);
					break;
				case this.STATE_PLAYING:
					console.log('PLAYING state ' + (this.el.currentTime || 0) + ' X ' + this.currentTime + ' ' + Player.playing);
					break;
				case this.STATE_PAUSED:
					console.log('PAUSED state ' + (this.el.currentTime || 0) + ' X ' + this.currentTime + ' ' + Player.playing);
					break;
				default:
					console.log('unknown state ' + (this.el.currentTime || 0) + ' X ' + this.currentTime + ' ' + Player.playing);
					break;
			}
		},

		/**
		 * @private
		 */
		onNativeError: function() {
			var code = this.el.error ? this.el.error.code : 0,
				msg = 'Unknown Error';
			this.onError(code, msg);
		}

	});

	return Device_Hisense_Player;

})(Events);