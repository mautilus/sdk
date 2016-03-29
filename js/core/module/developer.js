/**
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Developer tools, press 0 (by default) key four times to display developer tools
 * 
 * @author Mautilus s.r.o.
 * @class Developer
 * @singleton
 * @mixins Events
 */

Developer = (function() {
	var Developer = {
	/**
	 * @property {Object} config General config hash
	 */
	config: {
		/**
		 * @cfg {Boolean} debug Toggle debug mode
		 */
		debug: false,
		/**
		 * @cfg {Boolean} active TRUE to active tools after start up
		 */
		active: false,
		/**
		 * @cfg {String} console URL address to the remote console
		 */
		console: null,
		/**
		 * @cfg {Boolean} consoleActive TRUE to connect to the remote console after start up (`active` must be set to TRUE)
		 */
		consoleActive: false,
		/**
		 * @cfg {String/Number} activationKey Name of actiovation key
		 */
		activationKey: 'ZERO',
		/**
		 * @cfg {Boolean} alertToConsole TRUE to redirect alert into console.log
		 */
		alertToConsole: true,
		/**
		 * @cfg {Number} limitStack Amount of records stored in a console stack (0 = unlimited)
		 */
		limitStack: 40,
		/**
		 * @cfg {Number} limitNetworkStack Amount of records stored in a network stack (0 = unlimited)
		 */
		limitNetworkStack: 0
	}
	};

	$.extend(true, Developer, {
		init: function(config) {
			var onerror, scope = this;

			this.pressCount = 0;
			this.pressTime = 0;
			this.onScreenConsole = false;
			this.onScreenNetworkConsole = false;
			this.inputActive = false;
			this.inputBuffer = '';
			this.consoleStack = [];
			this.networkConsoleStack = [];
			this._console = null;
			this.canAccessError = this.isErrorAvailable();

			this.configure(config);

			this.polyfillConsole();

			if (this.config.alertToConsole) {
				window.alert = function() {
					return console.log.apply(console, arguments);
				};
			}

			onerror = window.onerror;

			window.onerror = function(message, url, lineNumber) {
				if (typeof onerror === 'function') {
					onerror.apply(window, arguments);
				}

				if (Main.getDevice()[0] !== 'default') {
					console.error(message, url, lineNumber);
				} else {
					scope.toConsole('error', arguments);
				}
			};

			if (typeof console !== 'undefined' && typeof console.network === 'undefined') {
				console.network = function() {
				};
			}

			if (this.config.debug) {
				Control.on('beforekey', this.onKeyDown, this);

				if (this.config.active) {
					this.activate();
				}
			} else {
				this.offConsole();
			}
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
		 * Polyfill console object if not present
		 * 
		 * @private
		 */
		polyfillConsole: function() {
			var scope = this;

			if (typeof window.console === 'undefined') {
				window.console = {
					log: function() {
					},
					warn: function() {
					},
					info: function() {
					},
					error: function() {
					},
					network: function() {
					}
				};

			} else if (window.console.polyfilled) {
				return;
			}

			if (!this.config.debug) {
				return;
			}

			window.console.polyfilled = true;
			window.console.__log = window.console.log;
			window.console.__warn = window.console.warn;
			window.console.__info = window.console.info;
			window.console.__error = window.console.error;

			window.console.log = function() {
				var args = Array.prototype.slice.call(arguments, 0);

				if (scope.canAccessError) {
					var stack = new Error().stack, allFiles = (stack ? stack.match(new RegExp("[_a-zA-Z0-9]*.js[^)]*", "g")) : []),
						file = "";
					if (allFiles && allFiles.length >= 1 && typeof(allFiles[1]) !== "undefined") {
						// only file + line number
						file = allFiles[1].replace(new RegExp("(.*[/])([^:]+):([^:]+)(.*)", "g"), "$2 $3"); // first is console, second is a file
						// remove part after ?
						file = file.replace(new RegExp("([^?]+)[?]([^ ]+)[ ]?(.*)", "g"), "$1 $3");
						// add to an array
						args.push("[" + file + "]");
					}
				}

				scope.toConsole('log', args);
				return window.console.__log.apply(window.console, args);
			};

			window.console.warn = function() {
				scope.toConsole('warn', arguments);
				return window.console.__warn.apply(window.console, arguments);
			};

			window.console.info = function() {
				scope.toConsole('info', arguments);
				return window.console.__info.apply(window.console, arguments);
			};

			window.console.error = function() {
				scope.toConsole('error', arguments);
				return window.console.__error.apply(window.console, arguments);
			};

			window.console.network = function() {
				return scope.toNetworkConsole(arguments);
			};
		},
		/**
		 * When debug mode is off, override console methods and turn off loggin
		 * 
		 * @private
		 */
		offConsole: function() {
			window.console = {
				log: function() {
				},
				warn: function() {
				},
				info: function() {
				},
				error: function() {
				},
				network: function() {
				}
			};
		},
		/**
		 * Test, if the current browser / viewer supports error object.
		 * 
		 * @private
		 * @returns {Boolean}
		 */
		isErrorAvailable: function() {
			try {
				var obj = new Error(), stack = obj.stack;
				return true;
			}
			catch (err) {
				return false;
			}
		},
		/**
		 * @private
		 * @param {String} addr URL of the remote console script
		 */
		loadConsole: function(addr) {
			var scope = this, id = 'developer-remote-console', s;
			if (document.getElementById(id) && typeof RemoteConsole !== "undefined") {
				RemoteConsole.init();
				return;
			}

			s = document.createElement('script');
			s.id = id;
			s.src = addr;

			s.onload = function() {
				scope.updateNotifications();
			};

			document.head.appendChild(s);
		},
		/**
		 * Activate developer tools
		 */
		activate: function() {
			this.isActive = true;
			this.showUI();

			if (this.config.consoleActive && this.config.console) {
				this.loadConsole(this.config.console);
			}
		},
		/**
		 * De-activate developer tools
		 */
		deactivate: function() {
			this.isActive = false;
			this.pressCount = 0;
			this.onScreenConsole = false;
			this.hideUI();
		},
		/**
		 * Toggle developer tools
		 */
		toggle: function() {
			if (this.isActive) {
				this.deactivate();
			} else {
				this.activate();
			}
		},
		/**
		 * Reload application
		 */
		reload: function() {
			window.location.reload();
		},
		/**
		 * @private
		 */
		onKeyDown: function(keyCode,event,fromRC) {
			var scope = this;
			if (this.isActive) {
				if (document.activeElement && document.activeElement.nodeName === 'INPUT') {
					return;
				}

				if (this.inputActive) {
					if (Control.isNumeric(keyCode)) {
						this.inputBuffer += Control.getTextValue(keyCode);

					} else if (keyCode === Control.key.TXTMIX) {
						this.inputBuffer += '.';

					} else if (keyCode === Control.key.PRECH) {
						this.inputBuffer = this.inputBuffer.substr(0, this.inputBuffer.length - 1);

					} else if (keyCode === Control.key.ENTER) {
						this.config.console = 'http://' + this.inputBuffer + ':8080';
						this.inputActive = false;

						if (Storage) {
							Storage.set('developer_console', this.inputBuffer);
						}

						this.loadConsole(this.config.console);
						this.showUI();

					} else if (keyCode === Control.key.RETURN) {
						this.uiToggleInputIP();
						return false;
					}

					this.$elContent.find('.developer-ui-ip').text(this.inputBuffer);

					return false;
				}

				if (fromRC) {
					return;
				}

				if (keyCode === Control.key.ZERO) {
					this.toggle();
					return false;
				} else if (keyCode === Control.key.ONE) {
					this.uiToggleInfo();
					return false;
				} else if (keyCode === Control.key.TWO) {
					this.uiToggleConsole();
					return false;
				} else if (keyCode === Control.key.THREE || keyCode == Control.key.TRIANGLE) {
					this.uiToggleNetworkConsole();
					return false;
				} else if (keyCode === Control.key.FOUR) {
					if (this.config.console) {
						this.loadConsole(this.config.console);
					} else {
						this.uiToggleInputIP();
					}
					return false;
				} else if (keyCode === Control.key.FIVE) {
					this.reload();
					return false;
				} else if (keyCode === Control.key.SIX) {
					this.execTests();
					return false;
				} else if (keyCode === Control.key.PDOWN) {
					if (this.scollContent(1)) {
						return false;
					}
				} else if (keyCode === Control.key.PUP) {
					if (this.scollContent(-1)) {
						return false;
					}
				}
			}

			if (this.pressTime && this.pressTime < (new Date().getTime() - 1500)) {
				this.pressCount = 0;
			}

			if (typeof this.config.activationKey === 'string' && keyCode === Control.key[this.config.activationKey]) {
				this.pressCount += 1;
				this.pressTime = new Date().getTime();

			} else if (typeof this.config.activationKey === 'number' && keyCode === this.config.activationKey) {
				this.pressCount += 1;
				this.pressTime = new Date().getTime();

			} else {
				this.pressCount = 0;
			}

			if (this.pressCount === 4) {
				this.pressCount = 0;
				this.pressTime = 0;
				this.toggle();
			}
		},
		
		/**
		 * Show remote console connected status
		 */
		remoteState: function(state) {
			if (state) {
				this.$elConnected.show().html('&#10003');
			} else {
				this.$elConnected.hide().html('');
			}
		},
		
		/**
		 * Show developer UI
		 * 
		 * @private
		 */
		showUI: function() {
			var scope = this;

			if (!this.$el) {
				this.$el = $('<div id="developer-ui" />').appendTo(document.body);
				this.appendUIStyles();
			}

			this.$el.show();
			this.$el.html('<div id="developer-ui-content" /><ul>'
				+ '<li data-dev-action="toggle">[0] Hide</li>'
				+ '<li data-dev-action="uiToggleInfo">[1] Info</li>'
				+ '<li data-dev-action="uiToggleConsole">[2] Console <span class="developer-ui-errors" /></li>'
				+ '<li data-dev-action="uiToggleNetworkConsole">[3] Network <span class="developer-ui-network-errors" /></li>'
				+ '<li data-dev-action="uiToggleInputIP">[4] Connect (' + (this.config.console || '...') + ') <span class="developer-ui-connected" /></li>'
				+ '<li data-dev-action="reload">[5] Reload</li>'
				+ '<li data-dev-action="execTests">[6] Exec. Tests</li>'
				+ '</ul>');

			this.$elContent = this.$el.find('#developer-ui-content');
			this.$elErrors = this.$el.find('.developer-ui-errors');
			this.$elNetworkErrors = this.$el.find('.developer-ui-network-errors');
			this.$elConnected = this.$el.find('.developer-ui-connected');

			this.$el.find('[data-dev-action]').bind('click', function() {
				var action = $(this).attr('data-dev-action');

				if (action && typeof scope[action] === 'function') {
					scope[action].call(scope);
				}

				return false;
			});

			this.updateNotifications();
		},
		/**
		 * Hide developer UI
		 * 
		 * @private
		 */
		hideUI: function() {
			if (this.$el) {
				this.$el.hide().empty();
			}
		},
		/**
		 * Execute unit tests
		 * 
		 * @private
		 */
		execTests: function() {
			if (typeof jasmine === 'undefined') {
				throw new Error('jasmine.js is not defined');
			}

			if (!this.jasmineEnv) {
				this.jasmineEnv = jasmine.getEnv();
				this.jasmineEnv.updateInterval = 1000;

				this.jasmineEnv.addReporter(new jasmine.ConsoleReporter());
			}

			this.jasmineEnv.execute();
		},
		/**
		 * Show/Hide device info
		 * 
		 * @private
		 */
		uiToggleInfo: function() {
			this.$elContent.toggle();

			if (this.$elContent.is(':visible')) {
				this.$elContent.html(Device.getInfo());
			}
		},
		/**
		 * Show/Hide on-screen console
		 * 
		 * @private
		 */
		uiToggleConsole: function() {
			this.$elContent.toggle();
			this.$elContent.empty();
			this.onScreenNetworkConsole = false;
			this.onScreenConsole = this.$elContent.is(':visible');
			this.renderConsole();
		},
		/**
		 * Show/Hide on-screen network console
		 * 
		 * @private
		 */
		uiToggleNetworkConsole: function() {
			this.$elContent.toggle();
			this.$elContent.empty();
			this.onScreenConsole = false;
			this.onScreenNetworkConsole = this.$elContent.is(':visible');
			this.renderNetworkConsole();
		},
		/**
		 * Show/Hide remote console IP setting
		 * 
		 * @private
		 */
		uiToggleInputIP: function() {
			this.$elContent.toggle();
			this.$elContent.empty();

			if (this.$elContent.is(':visible')) {
				this.inputActive = true;
				this.inputBuffer = '192.168.';

				if (Storage) {
					this.inputBuffer = Storage.get('developer_console') || this.inputBuffer;
				}

				this.$elContent.html('Enter IP address of the Remote Console:<div class="developer-ui-ip">' + this.inputBuffer + '</div>');

			} else {
				this.inputActive = false;
				this.inputBuffer = '';
			}
		},
		/**
		 * Scroll up/down main content
		 * 
		 * @param {Number} dir UP=-1 / DONW=1
		 * @return {Boolean}
		 */
		scollContent: function(dir) {
			if (this.$elContent.is(':visible')) {
				this.$elContent.scrollTop(this.$elContent.scrollTop() + (22 * dir));
				return true;
			}
		},
		/**
		 * @private
		 */
		toConsole: function(type, args) {
			var line, t;

			args = Array.prototype.slice.apply(args);

			for (var i in args) {
				if (typeof args[i] === 'object') {
					try {
						args[i] = JSON.stringify(args[i]); // fix problems with jquery objects in console.log (cyclic structures)
					}
						catch (error) {
						args[i] = "";
					}
				}
			}

			t = Device.getDate();
			line = $('<div class="line"><span class="t">' + (('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2) + ':' + ('0' + t.getSeconds()).slice(-2)) + '</span>'
				+ Array.prototype.slice.apply(args).join((type == 'error' ? '\n' : '')).replace(/\&/g, '&amp;') + '</div>');

			if (type === 'warn') {
				line.css('color', 'yellow');

			} else if (type === 'info') {
				line.css('color', '#a6edff');

			} else if (type === 'error') {
				line.css('color', '#ff8484');
				line.isError = true;
			}

			if (this.config.limitStack && this.consoleStack.length >= this.config.limitStack) {
				this.consoleStack.splice(this.config.limitStack - 1, 10);
			}

			this.consoleStack.unshift(line);

			this.renderConsole();
		},
		/**
		 * @private
		 */
		toNetworkConsole: function(args) {
			var line, t, time = new Date().getTime(), uid = time + Math.round(Math.random() * 10000), time2;

			args = Array.prototype.slice.apply(args);

			for (var i in args) {
				if (typeof args[i] === 'object') {
					args[i] = JSON.stringify(args[i]);
				}
			}

			if (typeof args[0] === 'number') {
				for (var i in this.networkConsoleStack) {
					if (this.networkConsoleStack[i].UID === args[0]) {
						line = this.networkConsoleStack[i];
						break;
					}
				}

				if (line) {
					time2 = new Date().getTime() - line.TIME;

					if (args[1] === 'error') {
						line.append(' [Failed ' + Math.round(time2) + 'ms]' + "\n" + Array.prototype.slice.apply(args, [2]).join(' '));
						line.css('color', '#ff8484');
						line.isError = true;

					} else {
						line.append(' <span>[OK ' + Math.round(time2) + 'ms]</span>');
						line.css('color', '#90EE90');
					}
				}

				this.renderNetworkConsole();
				return;
			}

			t = Device.getDate();
			line = $('<div class="line" data-dev-uid="' + uid + '" data-time="' + time + '"><span class="t">' + (('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2) + ':' + ('0' + t.getSeconds()).slice(-2)) + '</span>'
				+ Array.prototype.slice.apply(args).join(' ').replace(/\&/g, '&amp;') + '</div>');

			line.UID = uid;
			line.TIME = time;

			if (args[0] === 'error') {
				line.css('color', '#ff8484');
				line.isError = true;

			} else {
				line.css('color', '#a6edff');
			}

			if (this.config.limitNetworkStack && this.networkConsoleStack.length >= this.config.limitNetworkStack) {
				this.networkConsoleStack.splice(this.config.limitNetworkStack - 1, 10);
			}

			this.networkConsoleStack.unshift(line);

			this.renderNetworkConsole();

			return uid;
		},
		/**
		 * @private
		 */
		renderConsole: function() {
			if (this.onScreenConsole) {
				this.$elContent.html(this.consoleStack);
			}

			this.updateNotifications();
		},
		/**
		 * @private
		 */
		renderNetworkConsole: function() {
			if (this.onScreenNetworkConsole) {
				this.$elContent.html(this.networkConsoleStack);
			}

			this.updateNotifications();
		},
		/**
		 * @private
		 */
		updateNotifications: function() {
			var errors = 0, networkErrors = 0;

			for (var i in this.consoleStack) {
				if (this.consoleStack[i].isError) {
					errors++;
				}
			}

			for (var i in this.networkConsoleStack) {
				if (this.networkConsoleStack[i].isError) {
					networkErrors++;
				}
			}

			if (errors > 0 && this.$elErrors) {
				this.$elErrors.text(errors).show();

			} else if (this.$elErrors) {
				this.$elErrors.text('0').hide();
			}

			if (networkErrors > 0 && this.$elNetworkErrors) {
				this.$elNetworkErrors.text(networkErrors).show();

			} else if (this.$elNetworkErrors) {
				this.$elNetworkErrors.text('0').hide();
			}

			if (this.config.console && typeof LOGGING !== 'undefined') {
				this.$elConnected.show().html('&#10003;');
			}
		},
		/**
		 * @private
		 */
		appendUIStyles: function() {
			var s = document.createElement('style');
			var cssText = "\
#developer-ui {\
position: absolute;\
z-index: 9999999;\
bottom: 0;\
left: 0;\
right: 0;\
background: #000;\
background-color: rgba(0,0,0,0.6);\
color: #fff;\
padding: 10px;\
text-shadow: 1px 1px 2px #000;\
}\
#developer-ui #developer-ui-content {\
display: none;\
height:420px;\
white-space: pre-wrap;\
font-family: monospace, sans-serif;\
font-size: 16px;\
overflow: auto;\
}\
#developer-ui #developer-ui-content div.developer-ui-ip {\
background: rgba(255,255,255,0.3);\
padding: 5px 10px;\
margin: 10px 0 0 0;\
width: 200px;\
height: 40px;\
line-height: 40px;\
font-size: 22px;\
}\
#developer-ui #developer-ui-content div.line {\
padding-left: 100px;\
margin-bottom: 4px;\
}\
#developer-ui #developer-ui-content span.t {\
float: left;\
margin-left: -100px;\
}\
#developer-ui ul {\
margin: 0;\
padding: 0;\
list-style: none;\
}\
#developer-ui ul li {\
cursor:pointer;\
position: relative;\
display: inline-block;\
vertical-align: top;\
margin-right: 20px;\
}\
#developer-ui ul li span {\
display: none;\
position: absolute;\
line-height: 14px;\
top: -6px;\
right: -11px;\
background: red;\
padding: 3px 5px;\
border-radius: 3px;\
color: #fff;\
}\
#developer-ui ul li span.developer-ui-connected {\
background: green;\
}\
";
			if(typeof(s.textContent) !== "undefined") {
				s.textContent = cssText;  // new style
			} else {
				s.innerText = cssText;   // old style - not supported by Firefox
			}

			document.head.appendChild(s);
		}
	});
	// Initialize this class when Main is ready
	Main.ready(function() {
		Developer.init(CONFIG.developer);
	});

	return Developer;

})();