/**
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * File Youbora class
 * 
 * @author Mautilus s.r.o.
 * @class Youbora
 * @singleton
 * @mixins Events
 */

// time v pingu je zly (max)
// buffer underrun duration je nan
// buffer underrun time je zly (max)

Youbora = (function(Events) {
	var Youbora =  {
		pluginVersion: '2.0.0',
		serverUrl: 'http://nqs.nice264.com',
		data: {},
		inited: false
	};

	$.extend(true, Youbora, Events, {
		
		/**
		 * Call this, when user clicks on play button
		 * 
		 * @param {Object} settings Custom initialization settings
		 * @param {String} settings.id Youbora account ID
		 * @param {String} settings.user Application user name (if user is logged)
		 * @param {Boolean} settings.live Stream that is being played is live stream, or not?
		 * @param {Object} properties Stream related informations - see START section in Youbora Open API documentation, JSON properties
		 * @param {Function} cb Function callback
		 * @param {Object} _scope Callback scope
		 */
		init: function(settings,properties,cb,_scope) {
			var scope = this;
			if (this.inited) {
				this.deinit();
			}
			this.settings = settings;
			this.properties = properties;
			this.initTime = new Date().getTime();
			this.joined = false;
	
			var apiPromise = Ajax.request(this.serverUrl+'/data', {
				type: 'text',
				timeout: 30000,
				data: {
					system: settings.id,
					pluginVersion: this.pluginVersion,
					outputformat: 'jsonp'
				}
			}, null, this);

			apiPromise.then(function(status,data) {
				if (!status) {
					return false;
				}
				var parsedData = JSON.parse(data.substring(7).slice(0,-1));
				this.requestUrl = 'http'+'://'+parsedData.q.h+'/';	// https later?
				this.uniqueId = parsedData.q.c;
				this.pingTime = parsedData.q.pt;
				
				cb.call(_scope);
			},this);

			Player.on('play', function(url,position) {
				scope._play({
					url: url
				});
			 }).on('end', function() {
				scope._stop();
			 }).on('stop', function() {
				scope._stop();
			 }).on('statechange', function(state) {
				 switch (state) {
					case Player.STATE_PLAYING:
						if (!scope.joined) {
							scope._join();
							return false;
						}
						scope._buffered();
						break;
					case Player.STATE_BUFFERING:
						console.log("setting this.bufferingStartTime");
						scope.bufferingStartTime = new Date().getTime();
						break;
				 };
			 }).on('pause', function() {
				 scope._pause();
			 }).on('resume', function() {
				 scope._resume();
			 }).on('error', function(code,msg,details) {
				 scope._error(code,msg,details);
			 });
			 
			 this.inited = true;
		},

		/**
		 * Call this whenever you are leaving page on you have called init()
		 */
		deinit: function() {
			this.settings = {};
			this.properties = {};
			this.initTime = false;
			this.serverUrl = 'http://nqs.nice264.com/';
			this.joined = false;
			this.requestUrl = null;
			this.uniqueId = null;
			this.pingTime = null;
			if (this.pingInterval) {
				clearInterval(this.pingInterval);
			}
			Player.off('play')
				.off('end')
				.off('stop')
				.off('statechange')
				.off('pause')
				.off('resume')
				.off('error');
		},

		/**
		 * Internal method called when first frames of video appears to the user
		 * @private
		 */
		_join: function() {
			this.joined = true;
			var apiPromise = Ajax.request(this.requestUrl+'/joinTime', {
				type: 'text',
				timeout: 30000,
				data: {
					code: this.uniqueId,
					time: (new Date().getTime() - this.initTime)
					/*
					eventTime
					*/
				}
			}, null, this);
			this.bufferingStartTime = null;
		},

		/**
		 * Internal method called when Player starts loading the video stream
		 * @param {Object} data play data
		 * @param {String} data.url playback URL
		 * @private
		 */
		_play: function(data) {
			var scope = this;
			this.pingInterval = setInterval(function() {
				scope._ping();
			},scope.pingTime*1000);
			
			var apiPromise = Ajax.request(this.requestUrl+'/start', {
				type: 'text',
				timeout: 30000,
				data: {
					code: this.uniqueId,
					resource: encodeURIComponent(data.url),
					system: this.settings.id,
					live: this.settings.live,
					properties: JSON.stringify(this.properties),
					user: this.settings.user,
					referer: '',
					totalBytes: 0,
					pingTime: this.pingTime,
					pluginVersion: this.pluginVersion
					/*
					transcode
					param1...param10
					duration
					nodeHost
					nodeType
					isBalanced
					isResumed
					randomNumber
					hashTitle
					cdn
					isp
					ip
					*/
				}
			}, null, this);
		},

		/**
		 * Internal method called when playback is stopped (end of stream or interrupted by user)
		 * @private
		 */
		_stop: function() {
			if (this.pingInterval) {
				clearInterval(this.pingInterval);
			}
			var apiPromise = Ajax.request(this.requestUrl+'/stop', {
				type: 'text',
				timeout: 30000,
				data: {
					code: this.uniqueId
					/*
					diffTime
					*/
				}
			}, null, this);
			this.bufferingStartTime = null;
		},

		/**
		 * Internal method called while stream is being played
		 * @private
		 */
		_ping: function() {
			var apiPromise = Ajax.request(this.requestUrl+'/ping', {
				type: 'text',
				timeout: 30000,
				data: {
					code: this.uniqueId,
					pingTime: this.pingTime,
					bitrate: -1,
					time: parseInt(Player.currentTime/1000,10),
					diffTime: Math.round((new Date().getTime() - this.lastPingTime) / 1000) || 0
					/*
					totalBytes
					dataType
					diffTime - implemented
					nodeHost
					nodeType
					*/
				}
			}, null, this);
			this.lastPingTime = new Date().getTime();
		},
		
		/**
		 * Internal method called when playback is paused
		 * @private
		 */
		_pause: function() {
			var apiPromise = Ajax.request(this.requestUrl+'/pause', {
				type: 'text',
				timeout: 30000,
				data: {
					code: this.uniqueId
				}
			}, null, this);
		},

		/**
		 * Internal method called when playback is resumed from pause
		 * @private
		 */
		_resume: function() {
			var apiPromise = Ajax.request(this.requestUrl+'/resume', {
				type: 'text',
				timeout: 30000,
				data: {
					code: this.uniqueId
				}
			}, null, this);
		},
		
		/**
		 * Internal method called when error is raised in player
		 * @param {String} code Error code
		 * @param {String} msg Error message
		 * @param {String} details Error details
		 * @private
		 */
		_error: function(code,msg,details) {
			var apiPromise = Ajax.request(this.requestUrl+'/resume', {
				type: 'text',
				timeout: 30000,
				data: {
					player: "Smart TV native player",
					errorCode: code,
					msg: msg + ' ... '+details,
					code: this.uniqueId,
					resource: encodeURIComponent(window.location),
					system: this.settings.id,
					live: this.settings.live,
					properties: JSON.stringify(this.properties),
					referer: "",
					totalBytes: 0,
					pingTime: this.pingTime,
					pluginVersion: this.pluginVersion
					/*
					transcode
					user
					param1…param10 Yes (if they exist)
					duration
					nodeHost
					nodeType
					isBalanced
					isResumed
					randomNumber
					hashTitle
					cdn
					isp
					ip
					*/
				}
			}, null, this);
		},

		/**
		 * Internal method called when Player buffering is finished
		 * @private
		 */
		_buffered: function() {
			if (!this.bufferingStartTime) {
				return false;
			}
			var apiPromise = Ajax.request(this.requestUrl+'/bufferUnderrun', {
				type: 'text',
				timeout: 30000,
				data: {
					time: parseInt(Player.currentTime/1000,10),
					duration: (new Date().getTime() - this.bufferingStartTime),
					code: this.uniqueId
				}
			}, null, this);
			this.bufferingStartTime = null;
		}

	});
	return Youbora;
})(Events);

