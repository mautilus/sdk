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
* Playstation Player class
* 
* @author Mautilus s.r.o.
* @class Device_Playstation_Player
* @extends Player
*/

Device_Playstation_Player = (function (Events) {
	var Device_Playstation_Player = {
	};

	$.extend(true, Device_Playstation_Player, {
		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function () {
			var scope = this;
			this.callbacks = [];
			var updateTime = function (json) {
				scope.OnCurrentPlayTime(json.elapsedTime);
			};
			this.callbacks.push({ command: 'getPlaybackTime', callback: updateTime });
			this.updateTimeInterval = setInterval(function () {
				scope.tick();
			}, 500);

		},

		/**
		 * Internal player timer
		 * 
		 * @private
		 */
		tick: function () {
			var scope = this;
			if (this.currentState == this.STATE_PLAYING) {
				if (this._seekOnPlay) {
					console.log('setting playback time ', this._seekOnPlay);
					this.nativeCommand({ command: 'setPlayTime', playTime: this._seekOnPlay });
					this._seekOnPlay = null;
				}
				this.nativeCommand({ command: 'getPlaybackTime' });
			}
		},

		/**
		 * Handler for current player time
		 * 
		 * @param {Number} time Current player time 
		 * @private
		 */
		OnCurrentPlayTime: function (time) {

			this.onTimeUpdate(parseInt(time, 10) * 1000);

			if (this.duration && this.looping && time >= this.duration - 1200) {
				// stop 1.2s before its end, because it solves hang issue while looping
				this.onEnd();

			} else if (this.duration && time >= this.duration) {
				this.onEnd();
			}
		},

		/**
		 * Handler for change duration
		 * 
		 * @param {Number} duration
		 * @private
		 * @fires durationchange
		 */
		onDurationChange: function (duration) {
			this.duration = Math.round(duration);
			this.trigger('durationchange', this.duration);
		},

		/**
		 * @inheritdoc Player#deinitNative
		 */
		deinitNative: function () {

		},

		/**
		 * Adding Playstation execute command from stack
		 *
		 * @param {Object} json Command which should be executed
		 * @private
		 */
		executeCommand: function (json) {
			var data = {};

			$.extend(true, data, json);

			var command = data.command, callback = null;
			delete data.command;

			//console.log(JSON.stringify(data));

			for (var i = 0; i < this.callbacks.length; ++i) {
				if (this.callbacks[i].command == command) {
					callback = this.callbacks[i];

					if (this.callbacks[i].remove) {
						this.callbacks.splice(i, 1);
					}

					callback.callback.call(this, json);
				}
			}
		},

		/**
		 * Adding Playstation native command to stack
		 *
		 * @param {Object} json Command in JSON format
		 * @param {Function} callback Callback function with defined functionality
		 * @param {Boolean} remove Flag if command be removed or not after executing
		 * @private
		 */
		nativeCommand: function(json, callback, remove) {
			window.external.user(JSON.stringify(json));
			if (callback) {
				this.callbacks.push({ command: json.command, callback: callback, remove: remove });
			}
		},

		/**
		 * @inheritdoc Player#native
		 */
		native: function (cmd, attrs) {
			var url;

			if (cmd === 'play') {
				if (attrs && attrs.url) {
					url = this.url;
					this._seekOnPlay = null; // clear

					console.network('PLAYER', this.url);

					var loadData = { command: 'load', contentUri: this.url };
					
					if(this.drmConfig.type === 'PLAYREADY') {
						var drmConfigOption = this.drmConfig.option || {};
						var customData = drmConfigOption.CustomData;
						if (typeof(customData) !== 'undefined') {
							// set DRM custom data
							loadData.customData = customData;
						}
						var licenseServer = drmConfigOption.LicenseServer;
						if (typeof(licenseServer) !== 'undefined') {
							// set DRM license server URL
							loadData.licenseUri = licenseServer;
						}
					}

					this.nativeCommand(loadData);

					this.nativeCommand({ command: 'play' });
					//this.nativeCommand('{"command":"contentAvailable"}');

					this.state(this.STATE_BUFFERING);

				} else {
					this.nativeCommand({ command: 'play' });
				}
				//console.log('pos ', attrs.position);
				if (attrs.position) {
					this._seekOnPlay = parseInt((attrs.position / 1000), 10);
					//console.log('seekonplay ', this._seekOnPlay);
				}

			} else if (cmd === 'pause') {
				this.nativeCommand({ command: 'pause' });
				this.state(this.STATE_PAUSED);

				return;

			} else if (cmd === 'stop') {
				this.nativeCommand({ command: 'stop' });
			} else if (cmd === 'seek') {
				if (this.currentState === this.STATE_BUFFERING) {
					this._seekOnPlay = attrs.position;
				} else {
					var position = parseInt(attrs.position / 1000);
					this.nativeCommand({ command: 'setPlayTime', playTime: position });
				}

				return true;

			} else if (cmd === 'playbackSpeed') {
				var speed;

				if (attrs.speed === 1) {
					speed = 256;

				} else if (attrs.speed === 4) {
					speed = 1024;

				} else if (attrs.speed === 8) {
					speed = 2048;

				} else if (attrs.speed === -4) {
					speed = -1024;

				} else if (attrs.speed === -8) {
					speed = -2048;

				} else {
					speed = 256;
				}

				//not supported from february 2013
				//this.nativeCommand('{"command": "setPlaybackSpeed", "speed":' + speed + '}');

			} else if (cmd === 'show') {
				this.width = attrs.width || this.width;
				this.height = attrs.height || this.height;
				this.top = (typeof attrs.top !== 'undefined' ? attrs.top : this.top);
				this.left = (typeof attrs.left !== 'undefined' ? attrs.left : this.left);

				/**
				 * PS has coordination from -1.0,1.0 to 1.0,-1.0 where coordination 0.0,0.0 is center. Because of this, the coordination from pixels have to be recalculate to this range
				 * and be parsed as float because in json, they have to be without apostrofs. For example, coordinations 640,360(in pixels) are in PS world 0.0, 0.0
				 */
				var ltx = parseFloat((this.left / 1280 * 2 - 1).toFixed(2));
				var lty = parseFloat((this.top / (-720) * 2 + 1).toFixed(2));

				var rbx = parseFloat(((this.left + this.width) / 1280 * 2 - 1).toFixed(2));
				var rby = parseFloat(((this.top + this.height) / (-720) * 2 + 1).toFixed(2));

				this.nativeCommand({ command: 'setVideoPortalSize', ltx: ltx, lty: lty, rbx: rbx, rby: rby });

			} else if (cmd === 'hide') {


			} else if (cmd === 'setVideoDimensions') {
				// @todo: implement setVideoDimensions

			} else if (cmd === 'audioTrack') {
				//this.API.setAudioTrack(attrs.index || 0);
				if (attrs.language) {
					// this.nativeCommand('{"command": "setAudioTrack", "audioTrack": "' + attrs.language + '"}');
					this.nativeCommand({ command: 'setAudioTrack', audioTrack: attrs.language });

				}
			}
		},

		/**
		 * Handling ready event
		 * @private
		 */
		onReady: function () {
			console.log('ready');
		},

		/**
		 * Handling changes in player state
		 * @private
		 */
		onState: function (state) {
			state = state.toLowerCase();
			console.log('ONSTATE: ' + state);
			switch (state) {
				case 'playing':
				case 'displayingvideo':
					this.state(this.STATE_PLAYING);
					break;
				case 'buffering':
					this.state(this.STATE_BUFFERING);
					break;
				case 'ended':
					this.onEnd();
					break;
				case 'endofstream':
					this.onEnd();
					break;
				case 'ready':
					this.onReady();
					break;
			}
		},

		/**
		 * Get unique ESN code. It is used for DRM verification.
		 * 
		 * @private
		 */
		getESN: function () {
			return Device.getUID();
		},

		/**
		 * Function accessing responses from playstation sdk
		 * @param {Object} json JSON object which be executed
		 */
		accessfunction: function (json) {
			if (json) {
				if (json.playerState) {
					this.onState(json.playerState);
				}
				else if (json.totalLength) {
					this.onDurationChange(parseInt(json.totalLength) * 1000);
				}
				else {
					this.executeCommand(json);
				}
			}
		}
    });

    return Device_Playstation_Player;

})(Events);