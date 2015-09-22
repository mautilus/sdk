/**
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * WebOS device, overrides Device
 * 
 * @author Mautilus s.r.o.
 * @class Device_Webos
 * @extends Device
 */

Device_Webos = (function(Events) {
    var Device_Webos = {isWEBOS: true};

    $.extend(true, Device_Webos, Events, {
		/**
		 * @inheritdoc Device#init
		 */
		init: function(callback, _scope) {
			var scope = this;
			this.eexit = false;		// blocking onReturn event delegate
			
			console.log('WEB_OS_INIT');
			
		    this.setKeys();
		    if(!this.inited) {
		    	this.inited = true;
		    	
		    	// override default modules
			    this.override();
		    	0
		    	// init return
			    this.initReturnEvent();
			    
			    // init connection manager
			    this.initConnectionManager();
			    
			    // init webOS events
		    	document.addEventListener('webOSLaunch', function() {
			       scope.trigger('webOSLaunch');
			    }, true);
			    
			    document.addEventListener('webOSRelaunch', function() {
			    	scope.trigger('webOSRelaunch');
			    }, true);
			    
			    document.addEventListener ('visibilityChange', function() {
			    	scope.trigger('visibilityChange');
			    }, true);
			    
			    // init Router go event
			    Router.on('scene', function() {
			    	if(!this.eexit) {
			    		scope.pushHistory();
			    	}
			    }, this);
		    }
		    
		    if (callback) {
		    	callback.call(_scope || this);
		    }
		},
		
		/**
		 * Override default modules
		 * 
		 * @private
		 */
		override: function () {
			// extend default player
		    if (typeof Device_WebOS_Player !== 'undefined' && Player) {
		    	Player = $.extend(true, Player, Device_WebOS_Player);
		    }
		},
		
		/**
		 * Init Return event for WebOS
		 * 
		 * @private
		 */
		initReturnEvent: function() {
			var scope = this;
			
			this.returnEvent = function() {
				if(!scope.eexit) {
					scope.pushHistory();
					Control.onKeyDown({
						keyCode: Control.key.RETURN,
						preventDefault: function() {}
					});					
				}
			};
			
		    window.addEventListener("popstate", scope.returnEvent);
		},
		
		/**
		 * Init webOS Connection Manager
		 * 
		 * @private
		 */
		initConnectionManager: function() {
			var scope = this;
			//change this to false to disable subscription
			var subscribeStatus = true;
			//change this to false to disable resubscription
			var resubscribeStatus = true;
			
			var request = webOS.service.request("luna://com.palm.connectionmanager", {
			    method:"getStatus",
			    parameters: {},
			    onSuccess: function(inResponse) {
			    	var success = inResponse.returnValue;
			    	
				    if (!success) {
				        return true;
				    }
				    
				    scope.CONNECTIONMANAGER = inResponse;
				    
				    return true;
			    },
			    onFailure: function(inError) {
			        //....
			    },
			    onComplete: function(inResponse) {
			        //....
			    },
			    subscribe: subscribeStatus,
			    resubscribe: resubscribeStatus
			});
			 
			request.send();
		},
		
		/**
		 * Pseudo remove history = history go to end
		 * + Remove eventListener!!
		 */
		removeHistory: function() {
			var scope = this;
			
			window.removeEventListener('popstate', scope.returnEvent);
			history.go(-(history.length-1));
			
			console.log('REMOVE-HISTORY: ' + history.length);
		},
		
		/**
		 * Pseudo clear history = history go to end
		 */
		clearHistory: function() {
			var scope = this;
			this.eexit = true;
			
			if(history.length > 1) {
				window.removeEventListener("popstate", scope.returnEvent);
				history.go(-(history.length-1));
				setTimeout(function() {
					window.addEventListener("popstate", scope.returnEvent);
				}, 500);
			}
			
			console.log('CLEAR-HISTORY length: ' + history.length);
		},
		
		/**
		 * Push to page history
		 */
		pushHistory: function() {
			var scope = this;
			this.eexit = false;
			
			if(history.length <= 1) {
				history.pushState({"position": history.length});
			} else {
				window.removeEventListener("popstate", scope.returnEvent);
				history.go(1);
				setTimeout(function() {
					window.addEventListener("popstate", scope.returnEvent);
				}, 500);
			}
			
			console.log('PUSH-HISTORY length: ' + history.length);
		},
		
		stateHistory: function() {
			console.log('STATE-HISTORY length: ' + history.length);
			return history.state;
		},
		
		/**
		 * @inheritdoc SDK_Device#exit
		 * Not TESTED - may not correct for QA
		 */
		exit: function(dvb) {
			console.log('EXIT!!!!s');
			if(dvb) {
				this.removeHistory();
			    window.open('', '_self').close();
			}
			else {
				this.removeHistory();
				console.log('deactivate_0');
				PalmSystem.deactivate();
				console.log('deactivate_1');
			}
			return;

			this.clearHistory();
		    window.open('', '_self').close();			
		},
		
		/**
		 * @inheritdoc Device#getFirmware
		 */
		getFirmware: function() {
		    return webOS.device.platformVersion;
		},
		
		/**
		 * @inheritdoc Device#getIP
		 */
		getIP: function() {
			if (this.CONNECTIONMANAGER) {
		    	var wired = this.CONNECTIONMANAGER.wired,
		    		wifi = this.CONNECTIONMANAGER.wifi;
		    	
		    	if(wired.state == 'connected') {
		    		return wired.ipAddress;
		    	} else if(wifi.state == 'connected') {
		    		return wifi.ipAddress;
		    	}
		    }
			
		    return '0.0.0.0';
		},
		
		/**
		 * @inheritdoc Device#getDeviceName
		 */
		getDeviceName: function(stripSpaces) {
		    var name = webOS.device.modelNameAscii + ' ' + webOS.device.platformVersion;

		    if (stripSpaces) {
			name = name.replace(/\s/g, '');
		    }

		    return name;
		},
		
		/**
		 * @inheritdoc Device#getUID
		 */
		getUID: function() {
			return webOS.fetchAppId();
		},
		
		/**
		 * @inheritdoc Device#checkNetworkConnection
		 */
		checkNetworkConnection: function(callback, scope) {
		    var status = true;

		    if (this.CONNECTIONMANAGER) {
		    	status = this.CONNECTIONMANAGER.isInternetConnectionAvailable;
		    }

		    if (callback) {
		    	callback.call(scope || this, status);
		    }
		},
		
		/**
		 * Set code keys
		 * 
		 * @private
		 */
		setKeys: function() {
		    Control.setKeys({
		    	RIGHT: 39,	//0x27	*
				LEFT: 37,	//0x25	*
				UP: 38,		//0x26	*
				DOWN: 40,	//0x28	*
				RETURN: 461,//		*
				ENTER: 13,	//		*
				PLAY: 415,	//0x19F	*
				PAUSE: 19,	//0x13	*
				STOP: 413,	//0x19D	*
				FF: 417,	//0x1A1	*
				RW: 412,	//0x19C	*
				RED: 403,	//0x193	*
				GREEN: 404,	//0x194	*
				YELLOW: 405,//0x195	*
				BLUE: 406,	//0x196	*
				ZERO: 48,	//		*
				ONE: 49,	//		*
				TWO: 50,	//		*
				THREE: 51,	//		*
				FOUR: 52,	//		*
				FIVE: 53,	//		*
				SIX: 54,	//		*
				SEVEN: 55,	//		*
				EIGHT: 56,	//		*
				NINE: 57,	//		*
				
				NUMERIC_ZERO: 96,	// keyCode of numeric keys on External USB keyboard
				NUMERIC_ONE: 97,	// keyCode of numeric keys on External USB keyboard
				NUMERIC_TWO: 98,	// keyCode of numeric keys on External USB keyboard
				NUMERIC_THREE: 99,	// keyCode of numeric keys on External USB keyboard
				NUMERIC_FOUR: 100,	// keyCode of numeric keys on External USB keyboard
				NUMERIC_FIVE: 101,	// keyCode of numeric keys on External USB keyboard
				NUMERIC_SIX: 102,	// keyCode of numeric keys on External USB keyboard
				NUMERIC_SEVEN: 103,	// keyCode of numeric keys on External USB keyboard
				NUMERIC_EIGHT: 104,	// keyCode of numeric keys on External USB keyboard
				NUMERIC_NINE: 105,	// keyCode of numeric keys on External USB keyboard
				
				PUP: 33,	//		*
				PDOWN: 34,	//		*
				PRECH: 46,	// Delete
				TXTMIX: 110,// Del
				INFO: 457,	//
				CHLIST: -1,	//
				PRECH: -1,	//
				TXTMIX: -1,	//
				FAVCH: -1,	//
				EXIT: -1,	//
				TOOLS: -1,	//
		    });
		},
		
		/**
		 * Load specific JS library or file
		 * 
		 * @private
		 * @param {String} src
		 */
		loadJS: function(src) {
		    var s = document.createElement('script');
		    document.head.appendChild(s);
		    s.src = src;
		},
		
		/**
		 * Load specific OBJECT
		 * 
		 * @private
		 * @param {String} id
		 * @param {String} clsid
		 */
		loadObject: function(id, type) {
		    var objs = document.getElementsByTagName('object');

		    if (objs) {
				for (var i in objs) {
				    if (objs[i] && objs[i].id === id) {
				    	return objs[i];
				    }
				}
		    }

		    var obj = document.createElement('object');
		    obj.id = id;
		    obj.setAttribute('type', type);

		    document.body.appendChild(obj);

		    return obj;
		}
    });

    if (typeof document.head === 'undefined') {
    	document.head = document.getElementsByTagName('head')[0];
    }

    if (typeof document.body === 'undefined') {
    	document.body = document.getElementsByTagName('body')[0];
    }

    return Device_Webos;

})(Events);