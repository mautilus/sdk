/**
 ********************************************************
 * (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Samsung Player class
 * 
 * @author Mautilus s.r.o.
 * @class Device_WebOS_Player
 * @extends Player
 */

Device_WebOS_Player = (function(Events, Deferrable) {
	var Device_WebOS_Player = {
	};

	$.extend(true, Device_WebOS_Player, Deferrable, {
		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function(config) {
			/**
			 * @property {String} DRM Type
			 */
			this.drmType = '';
			
			/**
			 * @property {String} APP ID
			 */
			this.appId = '';
			
			/**
			 * @property {String} DRM Client ID
			 */
			this.clientId = '';
			
			var scope = this;
			this.el = document.createElement('video');
			this.$el = $(this.el).addClass('player');
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
		 * Call native API, override this method with your device player
		 *
		 * @private
		 * @param {String} cmd Command
		 * @param {Object} [attrs]
		 */
		native: function(cmd, attrs) {
			var scope = this, url;
			
			var sendDrmMessage = function(clientId, customData) {
				scope.sendDrmMessage(clientId, customData).done(function(result) {
					var options = {};
					if(scope.drmType == 'playready') {
						options.mediaTransportType = "URI";
						options.option = {};
						options.option.drm = {};
						options.option.drm.type = scope.drmType;
						options.option.drm.clientId = scope.clientId;
					}
					if(scope.drmType == 'widevine') {
						options.mediaTransportType = "WIDEVINE";
						options.option = {};
						options.option.drm = {};
						options.option.drm.type = scope.drmType;
						options.option.drm.clientId = scope.clientId;
					}
					scope._play(url, options);
				}).fail(function() {
					scope.onError(-1, 'sendDrmMessage', arguments[0]);
				});
			};
			
			var loadDrmClient = function(drmType) {
				scope.loadDrmClient(drmType, webOS.fetchAppId()).done(function(result) {
					sendDrmMessage(scope.clientId, scope.customData);
				}).fail(function() {
					scope.onError(-1, 'loadDrmClient', arguments[0]);
				});
			};
			
			if (cmd === 'play') {
				if (attrs && attrs.url) {
					if (attrs.url.match(/\/manifest/i)) {
						// PlayReady DRM
						url = attrs.url;
						if(!this.isDrmClientLoaded) {
							loadDrmClient('playready');
						
						} else if(this.isDrmClientLoaded && this.drmType != 'playready') {
							this.unloadDrmClient().done(function() {
								loadDrmClient('playready');
							}, this).fail(function() {
								scope.onError(-1, 'unloadDrmClient', arguments[0]);
							});
						
						} else {
							sendDrmMessage(this.clientId, this.customData);
						}
					} else if (attrs.url.match(/\.wvm/)) {
						// Widevine DRM
						url = attrs.url;
						if(!this.isDrmClientLoaded) {
							loadDrmClient('widevine');
						
						} else if(this.isDrmClientLoaded && this.drmType != 'widevine') {
							this.unloadDrmClient().done(function() {
								loadDrmClient('widevine');
							}, this).fail(function() {
								scope.onError(-1, 'unloadDrmClient', arguments[0]);
							});
						
						} else {
							sendDrmMessage(this.clientId, {url: url});
						}
						
					} else if (attrs && attrs.url && this.el.src !== this.url) {
						// NO DRM
						this._play(attrs.url);
					}
				} else {
					this.el.play();
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
			this.drmType = drmType;
			this.appId = appId;
			
			return this.when(function(promise) {
				var scope = this;
				var request = webOS.service.request("luna://com.webos.service.drm", {
					method:"load",
					parameters: {
						"drmType": scope.drmType,
						"appId": scope.appId
					},
					onSuccess: function (result) {
						console.log("DRM Client is loaded successfully.");
						scope.clientId = result.clientId;
						scope.isDrmClientLoaded = true;
						promise.resolve(result);
					},
					onFailure: function (result) {
						console.error("[" + result.errorCode + "] " + result.errorText);
						promise.reject('Plaer.loadDrmClient onFailure: ' + '[' + result.errorCode + '] ' + result.errorText);	// Do something for error handling
					}
				});
			}, this);
		},
		
		/**
		 * Unload DRM client
		 * 
		 * @private
		 * @retrun {Promise}	promise.done({Object} result)
		 * 						promise.fail({String} description)
		 */
		unloadDrmClient: function() {
			var scope = this;
			return this.when(function(promise) {
				if(isDrmClientLoaded) {
					var request = webOS.service.request("luna://com.webos.service.drm", {
						method:"unload",
						parameters: { "clientId": scope.clientId },
						onSuccess: function (result) {
							isDrmClientLoaded = false;
							console.log("DRM Client is unloaded successfully.");
							promise.resolve(result);
						},
						onFailure: function (result) {
							console.error("[" + result.errorCode + "] " + result.errorText);
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
		 * @param {String} customData
		 * @return {Promise} 	promise.done({Object} result)
		 * 						promise.fail({String} description)
		 */
		sendDrmMessage: function(clientId, customData) {
			return this.when(function(promise) {
				var scope = this;
				var msgId = '';
				var msgType = '';
				var drmSystemId = '';
				var msg = '';
				
				if(this.drmType == 'playready') {
					/*
					*********************************************************
					* PLAYREADY
					*********************************************************
					*/
					msgType = 'application/vnd.ms-playready.initiator+xml';		// Message type of DRM system
					drmSystemId = 'urn:dvb:casystemid:19219';					// Unique ID of DRM system
					
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
					
					// Message for playready
					msg = '<?xml version="1.0" encoding="utf-8"?>' +
					'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
						'<LicenseServerUriOverride>' +
							'<LA_URL>http://sl.licensekeyserver.com/core/rightsmanager.asmx</LA_URL>' +
						'</LicenseServerUriOverride>' +
						'<SetCustomData>' +
							'<CustomData>' + customData + '</CustomData>' +
						'</SetCustomData>' +
					'</PlayReadyInitiator>';
					
				} else if(this.drmType == 'widevine') {
					/*
					*********************************************************
					* WIDEVINE		!!! NEDOKONCENO - ROZPRACOVANO !!!
					*********************************************************
					*/
					msgType = 'application/widevine+xml';       // Message type for widevine 'xml' 
					drmSystemId = 'urn:dvb:casystemid:19156';   // Unique ID of DRM system
					
					// Message for widevine
					msg = '<?xml version="1.0" encoding="utf-8"?>'+
						'<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">'+
						'<ContentURL>'+this.url+'</ContentURL>'+
						'<DeviceID>'+this.clientId+'</DeviceID>'+
						'<StreamID></StreamID>'+
						'<ClientIP></ClientIP>'+
						'<DRMServerURL>'+this.config.DRMconfig.DRM_URL+'</DRMServerURL>'+
						'<DRMAckServerURL></DRMAckServerURL>'+
						'<DRMHeartBeatURL></DRMHeartBeatURL>'+
						'<DRMHeartBeatPeriod></DRMHeartBeatPeriod>'+
						'<UserData>'+this.customData+'</UserData>'+
						'<Portal>'+this.config.DRMconfig.PORTAL+'</Portal>'+
						'<StoreFront></StoreFront>'+
						'<BandwidthCheckURL></BandwidthCheckURL>'+
						'<BandwidthCheckInterval></BandwidthCheckInterval>'+
					'</WidevineCredentialsInfo >';
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
						// !!! DRM API does not return the msgId, resultCode, resultMsg for Widevine type !!
						msgId = (scope.drmType == 'playready')? result.msgId : '';
						var resultCode = (scope.drmType == 'playready')? result.resultCode : '';
						var resultMsg = (scope.drmType == 'playready')? result.resultMgs : '';
						
						
						if(scope.drmType == 'playready') {
							if (resultCode == 0){
								promise.resolve(result);
							} else {
								scope.subscribeLicensingError(clientId, msgId);
								// Do Handling DRM message error
								promise.reject('Player.sendDrmMessage onSuccess: ' + '[' + resultCode + '] ' + 'DRM message error');
							}
						} else {
							promise.resolve(result);
						}
						
					},
					onFailure: function (result) {
						scope.subscribeLicensingError(clientId, msgId);
						console.error("[" + result.errorCode + "] " + result.errorText);
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
						//console.log("DRM System ID: " + result.drmSystemId);
						//console.log("License Server URL: " + result.rightIssueUrl);
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
			var scope = this;
			
			this.el.innerHTML = '';
			
			if(!options) {
				options = {};
				options.mediaTransportType = "URI";
				options.option = {};
			}
			
			var mediaOption = escape(JSON.stringify(options));
			var source = document.createElement("source");
			
			source.setAttribute('src', url);
			if(String(url).match(/\/manifest/i)) {
				source.setAttribute('type', 'application/vnd.ms-sstr+xml;mediaOption=' + mediaOption);
				//source.setAttribute('type', 'application/vnd.ms-playready.initiator+xml;mediaOption=' + mediaOption);
			} else if(String(url).match(/\.wvm/)) {
				source.setAttribute('type', 'video/mp4;mediaOption=' + mediaOption);
			} else if(String(url).match(/\.mp4/)){
				source.setAttribute('type', 'video/mp4;mediaOption=' + mediaOption);
			} else if(String(url).match(/\.m3u8/)){
				source.setAttribute('type', 'application/vnd.apple.mpegurl;mediaOption=' + mediaOption);
			}
			
			this.el.appendChild(source);
			this.el.load();
			this.el.play();
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

	return Device_WebOS_Player;

})(Events, Deferrable);