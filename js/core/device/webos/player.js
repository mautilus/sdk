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
 * Samsung Player class
 * 
 * @author Mautilus s.r.o.
 * @class Device_Webos_Player
 * @extends Player
 */

Device_Webos_Player = (function(Events, Deferrable) {
	var Device_Webos_Player = {
	};

	$.extend(true, Device_Webos_Player, Deferrable, {
		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function(config) {
			/**
			 * @property {String} appId application id
			 */
			this.appId = '';
			/**
			 * @property {String} drmClientType Type of loaded DRM Client
			 */
			this.drmClientType = '';
			/**
			 * @property {String} clientId DRM Client ID
			 */
			this.clientId = '';
			
			var scope = this;
			this.el = document.createElement('video');
			this.$el = $(this.el).addClass('player');
			this.$el.appendTo('body');
			this.$el.css("position", "absolute");

			this.el.addEventListener('waiting', function() {
				//console.log('[Device_Webos_Player] waiting');
				scope.state(scope.STATE_BUFFERING);
			});

			this.el.addEventListener('playing', function() {
				//console.log('[Device_Webos_Player] playing');
				scope.state(scope.STATE_PLAYING);
				
				if(scope._seekOnPlay){
					scope.el.currentTime = scope._seekOnPlay / 1000;
					scope._seekOnPlay = 0;
				}
			});

			this.el.addEventListener('pause', function() {
				//console.log('[Device_Webos_Player] pause');
				if (!scope.duration || scope.duration > scope.currentTime) {
					scope.state(scope.STATE_PAUSED);
				}
			});

			this.el.addEventListener('ended', function() {
				//console.log('[Device_Webos_Player] ended');
				scope.onEnd();
			});
			
			this.el.addEventListener('loadeddata', function() {
				//console.log('[Device_Webos_Player] loadeddata');
			});
			
			this.el.addEventListener('canplay', function () {
				//console.log('[Device_Webos_Player] canplay');
				scope.el.play();
			});

			this.el.addEventListener('durationchange', function() {
				//console.log('[Device_Webos_Player] durationchange: ' + scope.el.duration);
				scope.onDurationChange(scope.el.duration * 1000);
			});

			this.el.addEventListener('timeupdate', function() {
				//console.log('[Device_Webos_Player] timeupdate: ' + scope.el.currentTime);
				scope.onTimeUpdate(scope.el.currentTime * 1000);
			});

			this.el.addEventListener('error', function(e) {
				console.log('[Device_Webos_Player] error: ' + e);  // e.target.error
				scope.onError(0, '');
			});
		},
		
		/**
		 * Call native API, override this method with your device player
		 *
		 * @private
		 * @param {String} cmd Command
		 * @param {Object} [attrs]
		 */
		native: function(cmd, attrs) {
			var scope = this, url;
			
			var sendDrmMessage = function(clientId) {
				scope.sendDrmMessage(clientId).done(function(result) {
					var drmType = scope.drmConfig.type;
					var options = {};
					if(drmType === 'PLAYREADY') {
						options.option = {};
						options.option.drm = {};
						options.option.drm.type = 'playready';
						options.option.drm.clientId = scope.clientId;
					}
					if(drmType === 'WIDEVINE') {
						options.mediaTransportType = 'WIDEVINE';
						options.option = {};
						options.option.drm = {};
						options.option.drm.type = 'widevine';
						options.option.drm.clientId = scope.clientId;
					}
					scope._play(url, options);
				}).fail(function() {
					scope.onError(-1, 'sendDrmMessage', arguments[0]);
				});
			};
			
			var loadDrmClient = function(drmType) {
				scope.loadDrmClient(drmType, webOS.fetchAppId()).done(function(result) {
					sendDrmMessage(scope.clientId);
				}).fail(function() {
					scope.onError(-1, 'loadDrmClient', arguments[0]);
				});
			};
			
			if (cmd === 'play') {
				if (attrs && attrs.url) {
					url = attrs.url;
					this._seekOnPlay = null; // clear
					
					var drmType = this.drmConfig.type;
					if (drmType === 'PLAYREADY') {
						// PlayReady DRM
						if(!this.isDrmClientLoaded) {
							loadDrmClient('playready');
						
						} else if(this.isDrmClientLoaded && this.drmClientType !== 'playready') {
							this.unloadDrmClient().done(function() {
								loadDrmClient('playready');
							}, this).fail(function() {
								scope.onError(-1, 'unloadDrmClient', arguments[0]);
							});
						
						} else {
							sendDrmMessage(this.clientId);
						}
					} else if (drmType === 'WIDEVINE') {
						// Widevine DRM
						if(!this.isDrmClientLoaded) {
							loadDrmClient('widevine');
						
						} else if(this.isDrmClientLoaded && this.drmClientType !== 'widevine') {
							this.unloadDrmClient().done(function() {
								loadDrmClient('widevine');
							}, this).fail(function() {
								scope.onError(-1, 'unloadDrmClient', arguments[0]);
							});
						
						} else {
							sendDrmMessage(this.clientId);
						}
						
					} else {
						// NO DRM
						this._play(url);
					}
				} else {
					this.el.play();
				}
				
				if (attrs && attrs.position) {
					this._seekOnPlay = attrs.position;
				}
				
				return true;
			} else if (cmd === 'pause') {
				return this.el.pause();
				
			} else if (cmd === 'stop') {
				this.$el.removeAttr('src'); // for html5 video player and reset
				return this.el.pause();
				
			} else if (cmd === 'seek') {
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

				this.$el.show();

			} else if (cmd === 'hide') {
				this.$el.hide();

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
			}
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
			
			this.unloadDrmClient();
		},
		
		/**
		 * Load DRM client
		 * 
		 * @private
		 * @param {String} drmType - "widevine" or "playready"
		 * @param {String} appId
		 * @return {Promise}	promise.done({Object} result)
		 * 						promise.fail({String} description)
		 */
		loadDrmClient: function(drmType, appId) {
			this.drmClientType = drmType;
			this.appId = appId;
			
			return this.when(function(promise) {
				var scope = this;
				var request = webOS.service.request("luna://com.webos.service.drm", {
					method:"load",
					parameters: {
						"drmType": drmType,
						"appId": scope.appId
					},
					onSuccess: function (result) {
						console.log("[Device_Webos_Player] loadDrmClient successful. clientId: " + result.clientId);
						scope.clientId = result.clientId;
						scope.isDrmClientLoaded = true;
						promise.resolve(result);
					},
					onFailure: function (result) {
						console.error("[Device_Webos_Player] loadDrmClient failed. [" + result.errorCode + "] " + result.errorText);
						promise.reject('Player.loadDrmClient onFailure: ' + '[' + result.errorCode + '] ' + result.errorText);	// Do something for error handling
					}
				});
			}, this);
		},
		
		/**
		 * Unload DRM client
		 * 
		 * @private
		 * @return {Promise}	promise.done({Object} result)
		 * 						promise.fail({String} description)
		 */
		unloadDrmClient: function() {
			var scope = this;
			return this.when(function(promise) {
				if(scope.isDrmClientLoaded) {
					var request = webOS.service.request("luna://com.webos.service.drm", {
						method:"unload",
						parameters: { "clientId": scope.clientId },
						onSuccess: function (result) {
							scope.isDrmClientLoaded = false;
							promise.resolve(result);
						},
						onFailure: function (result) {
							console.error("[Device_Webos_Player] unloadDrmClient failed. [" + result.errorCode + "] " + result.errorText);
							// Do something for error handling
							promise.reject('Player.unloadDrmClient onFailure: ' + '[' + result.errorCode + '] ' + result.errorText);
						}
					});
				}
			}, this);
		},
		
		/**
		 * Send DRM message
		 * 
		 * @private
		 * @param {String} clientId
		 * @return {Promise} 	promise.done({Object} result)
		 * 						promise.fail({String} description)
		 */
		sendDrmMessage: function(clientId) {
			return this.when(function(promise) {
				var scope = this;
				var msgId = '';
				var msgType = '';
				var drmSystemId = '';
				var msg = '';
				
				var drmType = this.drmConfig.type;
				if(drmType === 'PLAYREADY') {
					msgType = 'application/vnd.ms-playready.initiator+xml';     // Message type of DRM system
					drmSystemId = 'urn:dvb:casystemid:19219';                   // Unique ID of DRM system
					
					// Message for playready
//					msg = "<?xml version=\"1.0\" encoding=\"utf-8\"?> \
//					<PlayReadyInitiator xmlns=\"http://schemas.microsoft.com/DRM/2007/03/protocols/\"> \
//					  <LicenseAcquisition> \
//					    <Header> \
//					      <WRMHEADER xmlns= http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader version=\"4.0.0.0\"> \
//					        <DATA> \
//					          <PROTECTINFO> \
//					            <KEYLEN>16</KEYLEN> \
//					            <ALGID>AESCTR</ALGID> \
//					          </PROTECTINFO> \
//					          <LA_URL>https://sl.licensekeyserver.com/core/rightsmanager.asmx</LA_URL> \
//					        </DATA> \
//					      </WRMHEADER> \
//					    </Header> \
//					    <CustomData>"+customData+"</CustomData> \
//					  </LicenseAcquisition> \
//					</PlayReadyInitiator>";
					
					var drmOption = this.drmConfig.option || {};
					var customData = typeof(drmOption.CustomData) !== 'undefined' ? drmOption.CustomData : '';
					var licenseServer = typeof(drmOption.LicenseServer) !== 'undefined' ? drmOption.LicenseServer : '';
					
					// Message for PlayReady
					msg  = '<?xml version="1.0" encoding="utf-8"?>';
					msg += '<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">';
					msg +=   '<LicenseServerUriOverride>';
					msg +=     '<LA_URL>' + licenseServer + '</LA_URL>';
					msg +=   '</LicenseServerUriOverride>';
					msg +=   '<SetCustomData>';
					msg +=     '<CustomData>' + customData + '</CustomData>';
					msg +=   '</SetCustomData>';
					msg += '</PlayReadyInitiator>';
					
				} else if(drmType === 'WIDEVINE') {
					msgType = 'application/widevine+xml';       // Message type for widevine 'xml' 
					drmSystemId = 'urn:dvb:casystemid:19156';   // Unique ID of DRM system
					
					var drmOption = this.drmConfig.option || {};
					var ContentURL = typeof(drmOption.ContentURL) !== 'undefined' ? drmOption.ContentURL : '';
					var DRMServerURL = typeof(drmOption.DRMServerURL) !== 'undefined' ? drmOption.DRMServerURL : '';
					var DeviceID = typeof(drmOption.DeviceID) !== 'undefined' ? drmOption.DeviceID : '';
					var StreamID = typeof(drmOption.StreamID) !== 'undefined' ? drmOption.StreamID : '';
					var ClientIP = typeof(drmOption.ClientIP) !== 'undefined' ? drmOption.ClientIP : '';
					var DRMAckServerURL = typeof(drmOption.DRMAckServerURL) !== 'undefined' ? drmOption.DRMAckServerURL : '';
					var DRMHeartBeatURL = typeof(drmOption.DRMHeartBeatURL) !== 'undefined' ? drmOption.DRMHeartBeatURL : '';
					var DRMHeartBeatPeriod = typeof(drmOption.DRMHeartBeatPeriod) !== 'undefined' ? drmOption.DRMHeartBeatPeriod : '';
					var UserData = typeof(drmOption.UserData) !== 'undefined' ? drmOption.UserData : '';
					var Portal = typeof(drmOption.Portal) !== 'undefined' ? drmOption.Portal : '';
					var StoreFront = typeof(drmOption.StoreFront) !== 'undefined' ? drmOption.StoreFront : '';
					var BandwidthCheckURL = typeof(drmOption.BandwidthCheckURL) !== 'undefined' ? drmOption.BandwidthCheckURL : '';
					var BandwidthCheckInterval = typeof(drmOption.BandwidthCheckInterval) !== 'undefined' ? drmOption.BandwidthCheckInterval : '';
					
					// Message for Widevine
					msg  = '<?xml version="1.0" encoding="utf-8"?>';
					msg += '<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">';
					msg +=   '<ContentURL>'+ ContentURL +'</ContentURL>';
					msg +=   '<DeviceID>'+ DeviceID +'</DeviceID>';
					msg +=   '<StreamID>'+ StreamID +'</StreamID>';
					msg +=   '<ClientIP>'+ ClientIP +'</ClientIP>';
					msg +=   '<DRMServerURL>'+ DRMServerURL +'</DRMServerURL>';
					msg +=   '<DRMAckServerURL>'+ DRMAckServerURL +'</DRMAckServerURL>';
					msg +=   '<DRMHeartBeatURL>'+ DRMHeartBeatURL +'</DRMHeartBeatURL>';
					msg +=   '<DRMHeartBeatPeriod>'+ DRMHeartBeatPeriod +'</DRMHeartBeatPeriod>';
					msg +=   '<UserData>'+ UserData +'</UserData>';
					msg +=   '<Portal>'+ Portal +'</Portal>';
					msg +=   '<StoreFront>'+ StoreFront +'</StoreFront>';
					msg +=   '<BandwidthCheckURL>'+ BandwidthCheckURL +'</BandwidthCheckURL>';
					msg +=   '<BandwidthCheckInterval>'+ BandwidthCheckInterval +'</BandwidthCheckInterval>';
					msg += '</WidevineCredentialsInfo >';
				}
					
				var request = webOS.service.request("luna://com.webos.service.drm", {
					method:"sendDrmMessage",
					parameters: {
						"clientId": scope.clientId,
						"msgType": msgType,
						"msg": msg,
						"drmSystemId": drmSystemId
					},
					onSuccess: function (result) {
						if(drmType === 'PLAYREADY') {
							//console.log("sendDrmMessage Success: Message ID: " + msgId);
							var msgId = result.msgId;                  // only for PlayReady 
							var resultCode = result.resultCode || '';  // only for PlayReady 
							
							if (resultCode == 0){
								promise.resolve(result);
							} else {
								scope.subscribeLicensingError(clientId, msgId);
								// Do Handling DRM message error
								promise.reject('Player.sendDrmMessage onSuccess: ' + '[' + resultCode + '] ' + 'DRM message error');
							}
						} else if (drmType === 'WIDEVINE') {
							promise.resolve(result);
						}
					},
					onFailure: function (result) {
						if(drmType === 'PLAYREADY') {
							scope.subscribeLicensingError(clientId, msgId);
						}
						// Do something for error handling
						promise.reject('Player.sendDrmMessage onFailure: ' + '[' + result.errorCode + '] ' + result.errorText);
					}
				});
			}, this);
		},
		
		/**
		 * Subscribe Licensing Error
		 * 
		 * @private
		 * @param {String} clientId
		 * @param {String} msgId
		 */
		subscribeLicensingError: function(clientId, msgId) {
			var request = webOS.service.request("luna://com.webos.service.drm", {
				method:"getRightsError",
				parameters: {
					"clientId": clientId,
					"subscribe": true
				},
				onSuccess: function (result) { // Subscription Callback
					var contentId = result.contentId;
					console.log('errorState: ' + result.errorState);
					if (contentId == msgId) {
						if ( 0 == result.errorState) {
							console.log("No license");
							// Do something for error handling
						}
						else if ( 1 == result.errorState) {
							console.log("Invalid license");
							// Do something for error handling
						}
					}
				},
				onFailure: function (result) {
					console.log('Player.subscribeLicensingError onFailure: ' + '[' + result.errorCode + '] ' + result.errorText);
				}
			});
		},
		
		/**
		 * Play
		 * Create the source and append it to the video tag.
		 * 
		 * @private
		 * @param {String} url
		 * @param {Object} options
		 */
		_play: function(url, options) {
			var mediaType = this.mediaOption.mediaType || this.deriveMediaType(url);
			this.el.innerHTML = '';
			
			if(!options) {
				options = {};
				if(mediaType === 'HLS') {
					options.mediaTransportType = "HLS";
				} else if(mediaType === 'MP4'){
					options.mediaTransportType = "URI";
				} else if(mediaType === 'WIDEVINE') {
					options.mediaTransportType = "WIDEVINE";
				} else if(mediaType === 'SMOOTH_STREAMING') {
					// nothing
				}
				options.option = {};
			}
			
			var mediaOption = escape(JSON.stringify(options));
			var source = document.createElement("source");
			
			source.setAttribute('src', url);
			
			if(mediaType === 'SMOOTH_STREAMING') {
				source.setAttribute('type', 'application/vnd.ms-sstr+xml;mediaOption=' + mediaOption);
			} else if(mediaType === 'WIDEVINE') {
				source.setAttribute('type', 'video/mp4;mediaOption=' + mediaOption);
			} else if(mediaType === 'MP4') {
				source.setAttribute('type', 'video/mp4;mediaOption=' + mediaOption);
			} else if(mediaType === 'HLS') {
				source.setAttribute('type', 'application/vnd.apple.mpegurl;mediaOption=' + mediaOption);
			}
			
			this.el.appendChild(source);
			this.el.load();
		},
		
		/**
		 * Get ESN id
		 * 
		 * @private
		 */
		getESN: function() {
			return Device.getUID();
		},
		
	});

	return Device_Webos_Player;

})(Events, Deferrable);