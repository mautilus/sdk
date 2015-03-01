/*
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
		    this.setKeys();
		    
		    if(!this.inited) {
		    	this.inited = true;
		    	
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
			    	scope.pushHistory();
			    });
		    }
		    
		    if (callback) {
		    	callback.call(_scope || this);
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
				if(Router.activeScene) {
		    		Router.activeScene.onReturn(null, null, function() {});
		    	}
			}
			
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
		 * Pseudo clear history = history go to end
		 */
		clearHistory: function() {
			var scope = this;
			
			console.log('Clear history: ' + history.length);
			window.removeEventListener("popstate", scope.returnEvent);
			history.go(-(history.length-1));
			setTimeout(function() {
				window.addEventListener("popstate", scope.returnEvent);
			}, 500);
		},
		
		/**
		 * Push to page history
		 */
		pushHistory: function() {
			history.pushState({"data": "some data"});
		},
		
		/**
		 * @inheritdoc Device#exit
		 */
		exit: function() {
			//....
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
		    	RIGHT: 39,	//0x27
				LEFT: 37,	//0x25
				UP: 38,		//0x26
				DOWN: 40,	//0x28
				RETURN: 8,	//!! not tested !!
				ENTER: 13,	//!! not tested !!
				PLAY: 415,	//0x19F
				PAUSE: 19,	//0x13
				STOP: 413,	//0x19D
				FF: 417,	//0x1A1
				RW: 412,	//0x19C
				RED: 403,	//0x193
				GREEN: 404,	//0x194
				YELLOW: 405,//0x195
				BLUE: 406,	//0x196
				ZERO: 96,	//!! not tested !!
				ONE: 97,	//!! not tested !!
				TWO: 98,	//!! not tested !!
				THREE: 99,	//!! not tested !!
				FOUR: 100,	//!! not tested !!
				FIVE: 101,	//!! not tested !!
				SIX: 102,	//!! not tested !!
				SEVEN: 103,	//!! not tested !!
				EIGHT: 104,	//!! not tested !!
				NINE: 105,	//!! not tested !!
				PUP: 33,	//!! not tested !!
				PDOWN: 34,	//!! not tested !!
				PRECH: 46,	// Delete
				TXTMIX: 110	// ,Del
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