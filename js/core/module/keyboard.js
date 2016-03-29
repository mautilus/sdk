/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Keyboard class
 * TODO - config override for layouts
 * 
 * Limitations - Samsung - this virtual Keyboard doesn't work with External USB keyboard (keys a-z). It won't be fixed: http://www.samsungdforum.com/SamsungDForum/ForumView/df3455b529adf7c4?forumID=a44c9c78b565ea69
 * 
 * @author Mautilus s.r.o.
 * @class Keyboard
 * @abstract
 * @mixins Events
 */

Keyboard = (function (Events) {
	var Keyboard = {};

	$.extend(true, Keyboard, Events, {
		/**
		 * @property {Object} config General config hash
		 */
		config: {
			oneLayout: false // only one layout
		},
		/**
		 * Init object
		 * 
		 */
		init: function (config) {
			this.configure(config);
			this.create();
			this.layouts = { // v - values; s - size; t - type (K key, F function key, S space, N numeric key); sec - secundary button; w - change width in %;
				"SPECIAL": {
					layout: [
						[
							{ v: ".com", s: 2, t: "K" },
							{ v: "#", t: "K" },
							{ v: "$", t: "K" },
							{ v: "%", t: "K" },
							{ v: "-", t: "K" },
							{ v: "_", t: "K" },
							{ v: "+", t: "K" },
							{ v: "(", t: "K" },
							{ v: ")", t: "K" },
							{ v: "/", s: 1, t: "K" },
							{ v: "*", s: 1, t: "K" },
							{ v: "BSP", t: "F" },
							{ v: "7", t: "N" },
							{ v: "8", t: "N" },
							{ v: "9", t: "N" }
						],
						[
							{ v: ".net", s: 2, t: "K" },
							{ v: "\"", t: "K" },
							{ v: "'", t: "K" },
							{ v: ":", t: "K" },
							{ v: ";", t: "K" },
							{ v: "?", t: "K" },
							{ v: "~", t: "K" },
							{ v: "`", t: "K" },
							{ v: "|", t: "K" },
							{ v: "@", s: 1, t: "K" },
							{ v: "Done", id: "done", t: "F", s: 2 },
							{ v: "4", t: "N" },
							{ v: "5", t: "N" },
							{ v: "6", t: "N" }
						],
						[
							{ v: ".cz", s: 2, t: "K" },
							{ v: "{", t: "K" },
							{ v: "}", t: "K" },
							{ v: "^", t: "K" },
							{ v: "=", t: "K" },
							{ v: "[", t: "K" },
							{ v: "]", t: "K" },
							{ v: "\\", t: "K" },
							{ v: "<", t: "K" },
							{ v: ">", t: "K" },
							{ v: "!", t: "K" },
							{ v: "&", t: "K" },
							{ v: "1", t: "N" },
							{ v: "2", t: "N" },
							{ v: "3", t: "N" }
						],
						[
							{ v: "", s: 3, t: "F" }, // empty space
							{ v: "GEAR", s: 1, t: "F" },
							{ v: ".", s: 1, t: "K" },
							{ v: "SPACE", s: 4, t: "F" },
							{ v: ",", t: "K" },
							{ v: "CA", s: 1, t: "F" },
							{ v: "LC", t: "F" },
							{ v: "RC", t: "F" },
							{ v: "0", s: 1, t: "N" },
							{ v: "", s: 2, t: "F" }, // empty space
						]
					]
				},
				"ONELAYOUT": { // override for one layout - bottom 4th line
					layout: [
						{ v: ".cz", s: 2, t: "K" },
						{ v: ".com", s: 2, t: "K" },
						{ v: ".", s: 1, t: "K" },
						{ v: "SPACE", s: 4, t: "F" },
						{ v: "@", s: 1, t: "K" },
						{ v: "CA", s: 1, t: "F" },
						{ v: "LC", t: "F" },
						{ v: "RC", t: "F" },
						{ v: "0", s: 1, t: "N" },
						{ v: "/", s: 1, t: "K" },
						{ v: "*", s: 1, t: "K" }
					]
				},
				"EN": {
					layout: [
						[
							{ v: "+", t: "K" },
							{ v: "$", t: "K" },
							{ v: "q", t: "K" },
							{ v: "w", t: "K" },
							{ v: "e", t: "K" },
							{ v: "r", t: "K" },
							{ v: "t", t: "K" },
							{ v: "y", t: "K" },
							{ v: "u", t: "K" },
							{ v: "i", t: "K" },
							{ v: "o", t: "K" },
							{ v: "p", t: "K" },
							{ v: "BSP", t: "F" },
							{ v: "7", t: "N" },
							{ v: "8", t: "N" },
							{ v: "9", t: "N" }
						],
						[
							{ v: "Caps Lock", s: 2, t: "F", id: "CAPSLOCK" },
							{ v: "a", t: "K" },
							{ v: "s", t: "K" },
							{ v: "d", t: "K" },
							{ v: "f", t: "K" },
							{ v: "g", t: "K" },
							{ v: "h", t: "K" },
							{ v: "j", t: "K" },
							{ v: "k", t: "K" },
							{ v: "l", t: "K" },
							{ v: "Done", id: "done", t: "F", s: 2 },
							{ v: "4", t: "N" },
							{ v: "5", t: "N" },
							{ v: "6", t: "N" }
						],
						[
							{ v: "SHIFT", s: 2, t: "F" },
							{ v: "&", t: "K" },
							{ v: "z", t: "K" },
							{ v: "x", t: "K" },
							{ v: "c", t: "K" },
							{ v: "v", t: "K" },
							{ v: "b", t: "K" },
							{ v: "n", t: "K" },
							{ v: "m", t: "K" },
							{ v: "_", t: "K" },
							{ v: "-", t: "K" },
							{ v: "#", t: "K" },
							{ v: "1", t: "N" },
							{ v: "2", t: "N" },
							{ v: "3", t: "N" }
						],
						[
							{ v: "Arabic", s: 3, t: "F", id: "LANGCHANGE" },
							{ v: "GEAR", s: 1, t: "F" },
							{ v: ".", s: 1, t: "K" },
							{ v: "SPACE", s: 4, t: "F" },
							{ v: "@", s: 1, t: "K" },
							{ v: "CA", s: 1, t: "F" },
							{ v: "LC", t: "F" },
							{ v: "RC", t: "F" },
							{ v: "0", s: 1, t: "N" },
							{ v: "/", s: 1, t: "K" },
							{ v: "*", s: 1, t: "K" }
						]
					]
				},
				"AR": {
					layout: [
						[
							{ v: "ض", t: "K" },
							{ v: "ص", t: "K" },
							{ v: "ث", t: "K" },
							{ v: "ق", t: "K" },
							{ v: "ف", t: "K" },
							{ v: "غ", t: "K" },
							{ v: "ع", t: "K" },
							{ v: "ه", t: "K" },
							{ v: "خ", t: "K" },
							{ v: "ح", t: "K" },
							{ v: "ج", t: "K" },
							{ v: "د", t: "K" },
							{ v: "BSP", t: "F" },
							{ v: "7", t: "N" },
							{ v: "8", t: "N" },
							{ v: "9", t: "N" }
						],
						[
							{ v: "ش", t: "K" },
							{ v: "س", t: "K" },
							{ v: "ي", t: "K" },
							{ v: "ب", t: "K" },
							{ v: "ل", t: "K" },
							{ v: "ا", t: "K" },
							{ v: "ت", t: "K" },
							{ v: "ن", t: "K" },
							{ v: "م", t: "K" },
							{ v: "ك", t: "K" },
							{ v: "ط", t: "K" },
							{ v: "منتهى", id: "done", t: "F", s: 2 },
							{ v: "4", t: "N" },
							{ v: "5", t: "N" },
							{ v: "6", t: "N" }
						],
						[
							{ v: "#", t: "K" },
							{ v: "ئ", t: "K" },
							{ v: "ء", t: "K" },
							{ v: "ؤ", t: "K" },
							{ v: "ر", t: "K" },
							{ v: "لا", t: "K" },
							{ v: "ى", t: "K" },
							{ v: "ة", t: "K" },
							{ v: "و", t: "K" },
							{ v: "ز", t: "K" },
							{ v: "ظ", t: "K" },
							{ v: "_", t: "K" },
							{ v: "-", t: "K" },
							{ v: "1", t: "N" },
							{ v: "2", t: "N" },
							{ v: "3", t: "N" }
						],
						[
							{ v: "English", s: 3, t: "F", id: "LANGCHANGE" },
							{ v: ".", s: 1, t: "K" },
							{ v: "SPACE", s: 5, t: "F" },
							{ v: "@", s: 1, t: "K" },
							{ v: "CA", s: 1, t: "F" },
							{ v: "LC", t: "F" },
							{ v: "RC", t: "F" },
							{ v: "0", s: 1, t: "N" },
							{ v: "/", s: 1, t: "K" },
							{ v: "*", s: 1, t: "K" }
						]
					]
				}
			};

			this.initEvents();

			this.enums = { "BOTTOM": 0, "TOP": 1, "NORESTRICTION": 2, "ONLYNUMBERS": 3 };

			this.position = { x: 0, y: 0 };
			this.keyboardPosition = this.enums["BOTTOM"];
			this.mode = this.enums["NORESTRICTION"];

			this.capsLock = false;
			this.specialState = false;
			this.accentsState = false;

			// variables for repeat pressing on keys to write the accents
			this.accentsTime = 0;
			this.accentsTimeRepeat = 1000; // time in miliseconds
			this.accentsKey = false;

			// only one layout
			if (this.config.oneLayout) {
				this.layouts["EN"].layout[3] = this.layouts["ONELAYOUT"].layout;
			}
		},
		/**
			 * Set class config hash
			 * 
			 * @param {Object} config Hash of parameters
			 */
		configure: function (config) {
			this.config = $.extend(true, this.config || {}, config);
		},
		/**
		 * Bind events for mouse and keyboard.
		*/
		initEvents: function () {
			Control.on('key', this.onKeyDown, this);
			Mouse.on('click', this.onClick, this);
		},
		/**
		 * Handle keydown keyboard function.
		*/
		onKeyDown: function ($el, event) {
			if (!this.$el.is(":visible")) return;

			var keyCode;
			if (typeof event === 'object') {
				keyCode = event.keyCode;
			} else {
				keyCode = event;
			}

			if (keyCode == Control.key.RETURN) {
				this.exit();
				return false;
			}
			else if (keyCode == Control.key.ENTER) {
				return this.onEnter($el);
			}
			else if (keyCode == 32) { // spacebar todo
				if (typeof event === 'object') {
					event.preventDefault();
				}
				this.insertValue(" ", "SPACE");
			}
			else if (Control.isNavigational(keyCode)) {
				var direction = "left";
				if (keyCode == Control.key.RIGHT) direction = "right";
				else if (keyCode == Control.key.UP) direction = "up";
				else if (keyCode == Control.key.DOWN) direction = "down";

				this.navigate(direction);
			}
			else if(this.isForbiddenKey(keyCode)) {
				// do nothing
			} 
			else if (Control.isNumeric(keyCode)) {
				if (typeof event === 'object') {
					event.stopPropagation();
					event.preventDefault();
				}
				var value = Control.getTextValue(keyCode);
				this.insertValue(value, "NUMERIC");
				this.focusByInput(value);
			}
			else if (keyCode >= 65 && keyCode <= 90) {
				if (typeof event === 'object') {
					event.stopPropagation();
					event.preventDefault();
				}
				var value = String.fromCharCode(keyCode);
				value = value.toLowerCase();
				this.insertValue(value, "LETTER");
				this.focusByInput(value);
			}
		},

		/**
		 * Check forbidden keys for onKeyDown
		 */
		isForbiddenKey: function(keyCode) {
			var isForbiddenKey = false;
			if (Device.isSAMSUNG) {
				var forbiddenKeys = [Control.key.PLAY, Control.key.PAUSE, Control.key.STOP, Control.key.FF, Control.key.RW, 
									Control.key.PUP, Control.key.PDOWN, Control.key.CHLIST, Control.key.TOOLS];
				isForbiddenKey = forbiddenKeys.indexOf(keyCode) >= 0 ? true : false;
			}

			return isForbiddenKey;
		},

		/**
		 * Enter action for keys, this function also uses mouse click.
		*/
		onEnter: function ($el) {			
			var posx = parseInt(Focus.focused.attr("data-posx"), 10), posy = parseInt(Focus.focused.attr("data-posy"), 10),
				 selElem = this.specialState ? this.layouts["SPECIAL"].layout[posy][posx] : this.accentsState ? this.layouts["ACENTOS"].layout[posy][posx] : this.layouts[this.lang].layout[posy][posx];

			if (selElem.t == "K") {
				// normal letter assign
				var value = '';
				var date = new Date;
				var time = date.getTime();

				// test if the key was pressed again in the selected time
				if (selElem.sec && this.accentsKey == selElem.v && ((time - this.accentsTime) < this.accentsTimeRepeat)) {
					this.input.backspace();
					value = selElem.sec;
				} else if (selElem.sec && this.accentsKey == selElem.sec && ((time - this.accentsTime) < this.accentsTimeRepeat)) {
					this.input.backspace();
					value = selElem.v;
				} else {
					value = selElem.v;
				}
				this.accentsKey = value;
				this.accentsTime = time;
				this.insertValue(value, "LETTER");
			}
			else if (selElem.t == "N") {
				this.insertValue(selElem.v, "NUMERIC");
			}
			else if (selElem.t == "F") {
				if (selElem.v == "SPACE") {
					this.insertValue(" ", "SPACE");
				}
				else if (selElem.id === "done") {
					this.exit();
				}
				else if (selElem.v == "GEAR") {
					this.specialState = !this.specialState;
					
					if (this.specialState) {
						// show special keys
						this.capsLock = false;
						this.shift = false;
						this.createKeys(this.layouts["SPECIAL"].layout);
						this.input.moveCaret(0, "end"); // move cursor to the end
						// default focus
						Focus.to(this.$el.find(".key[data-val='GEAR']"));
					}
					else {
						// back to normal
						this.capsLock = false;
						this.shift = false;
						this.createKeys();
						Focus.to(this.$el.find(".key[data-val='GEAR']"));
					}
				}
				else if (selElem.v == "CA") {
					// clear all
					this.input.clearAllText();
					this.trigger("insert", ["", 0]); // callback function for inserted value
				}
				else if (selElem.v == "BSP") {
					// call interface
					this.input.backspace();
				}
				else if (selElem.v == "LC") {
					var direction = (this.lang == "AR" ? 1 : -1);
					// call interface
					this.input.moveCaret(direction);
				}
				else if (selElem.v == "RC") {
					var direction = (this.lang == "AR" ? -1 : 1);
					// call interface
					this.input.moveCaret(direction);
				}
				else if (selElem.v == "Caps Lock") {
					this.capsLock = !this.capsLock;
					var tt = (this.capsLock ? "uppercase" : "");

					this.$el.find(".tt").each(function () {
						$(this).css("text-transform", tt);
					});
				}
				else if (selElem.v == "SHIFT") {
					this.shift = !this.shift;
					this.capsLock = false;

					var tt = (this.shift ? "uppercase" : "");

					this.$el.find(".tt").each(function () {
						$(this).css("text-transform", tt);
					});
				}
				else if (selElem.v == "English") {
					this.switchLayout("EN");
				}
				else if (selElem.v == "Arabic") {
					this.switchLayout("AR");
				}
			}
			return false;
		},
		/**
		 * Navigate using cursor keys.
		*/
		navigate: function (direction) {
			this.position.x = parseInt(Focus.focused.attr("data-posx"), 10);
			this.position.y = parseInt(Focus.focused.attr("data-posy"), 10);

			if (direction == "left") this.move(-1, 0, "X");
			else if (direction == "right") this.move(1, 0, "X");
			else if (direction == "up") this.move(0, -1, "Y");
			else if (direction == "down") this.move(0, 1, "Y");
			return false;
		},
		/**
		 * This function is called from navigate. It focuse new key.
		*/
		move: function (dirX, dirY, axis) {
			// current x
			var currentX = 0, layout = this.specialState ? this.layouts["SPECIAL"].layout : this.layouts[this.lang].layout;

			for (var i = 0; i <= this.position.x; i++) {
				var item = layout[this.position.y][i];
				var size = (item.s ? item.s : 1);
				if (this.position.x == i) size = 1;
				currentX += size;
			}

			this.position.x += dirX;
			this.position.y += dirY;
			this.assingIndToArray(axis, currentX);

			Focus.to(this.$el.find(".key[data-posx='" + this.position.x + "'][data-posy='" + this.position.y + "']"));
		},
		/**
		 * Move between lines, assign new index to visible keys.
		*/
		assingIndToArray: function (axis, currentX) {
			var layout = this.specialState ? this.layouts["SPECIAL"].layout : this.layouts[this.lang].layout, newCurrentX = 0, newSize = 0;

			// for a line
			if (axis == "X") {
				var len = layout[this.position.y].length;
				if (this.position.x < 0) this.position.x = len - 1;
				if (this.position.x > len - 1) this.position.x = 0;
			}
			else if (axis == "Y") {
				var len = layout.length;
				if (this.position.y < 0) this.position.y = len - 1;
				if (this.position.y > len - 1) this.position.y = 0;

				// change on axis x
				for (var i = 0; i < layout[this.position.y].length; i++) {
					var item = layout[this.position.y][i];
					var size = (item.s ? item.s : 1);
					newSize += size;
					if (newSize >= currentX) { break; }
					newCurrentX++;
				}

				if (newCurrentX != this.position.x) this.position.x = newCurrentX;

				// problem with x ?
				var lenX = layout[this.position.y].length;
				if (this.position.x > lenX - 1) this.position.x = lenX - 1;
			}
		},
		/**
		 * Insert a new value to the input
		*/
		insertValue: function (value, type) {
			if (this.mode != this.enums["NORESTRICTION"]) { // "NUMERIC" "LETTER" "SPACE"
				if (this.mode == this.enums["ONLYNUMBERS"] && type != "NUMERIC") return;
			}

			if (this.capsLock) value = value.toUpperCase();
			else if (this.shift) {
				value = value.toUpperCase();
				this.shift = false;
				this.$el.find(".tt").each(function () {
					$(this).css("text-transform", "");
				});
			}

			if (value.length > 1) {
				for (var i = 0; i < value.length; i++) this.input.insert(value[i]);
			}
			else {
				this.input.insert(value);
			}
		},
		/**
		 * Switch between English and Arabic layout.
		*/
		switchLayout: function (lang) {
			if (this.lang != lang) {
				this.lang = lang;
				this.capsLock = false;
				this.shift = false;
				this.createKeys();
				this.input.moveCaret(0, "end"); // move cursor to the end
				// default focus on language
				Focus.to(this.$el.find(".key[data-id='LANGCHANGE']"));
			}
		},
		/**
		 * Press A and highlight this key on keyboard.
		*/
		focusByInput: function (value) {
			Focus.to(this.$el.find(".focusable[data-val='" + value.toUpperCase() + "']"));
		},
		/**
		 * Mouse onclick handle.
		*/
		onClick: function ($el, event) {
			if (!this.$el.is(":visible")) return;
			return this.onEnter($el);
		},
		/**
		 * Create function, cover is created only for default and LG driver.
		*/
		create: function () {
			if (Device && !Device.isPHILIPS) { this.cover(); } // because Philips bugs
			this.content();
		},
		/**
		 * Set keyboard mode. Keyboard works in these modes: 
		 * NORESTRICTION = this.enums["NORESTRICTION"] no restrictions
		 * ONLYNUMBERS = this.enums["ONLYNUMBERS"] only numbers are working
		*/
		setMode: function (mode) {
			this.mode = this.enums[mode];
		},
		/**
		 * Set keyboard position, only available modes are BOTTOM x TOP.
		*/
		setKeyboardPosition: function (position) { // position == BOTTOM x TOP
			this.keyboardPosition = this.enums[position];
		},
		/**
		 * Get available language. This is because default I18n locale does not have its own layout.
		*/
		getAvailableLang: function (lang) {
			if (!this.layouts[lang]) return "EN"; // default
			else return lang;
		},
		/**
		 * Main function for show keyboard in the application.
		*/
		show: function (input, lang) {
			if (!input) return;

			this.input = input;
			this.lang = this.getAvailableLang(lang || I18n.locale);
			this.createKeys();
			this.showKeyboard();
			this.input.moveCaret(0, "end"); // move cursor to the end
			this.$saveFocus = Focus.focused;
			Focus.to(this.$el.find(".key[data-id='done']"));
			document.body.onselectstart = function () { return false; };
		},
		/**
		 * Exit keyboard and go back to the scene.
		*/
		exit: function () {
			this.specialState = false;
			this.accentsState = false;
			this.capsLock = false;
			this.shift = false;
			this.input.blur();
			this.hideKeyboard();
			Focus.to(this.$saveFocus);
			this.trigger("exit");
			document.body.onselectstart = function () { return true; };
		},
		/**
		 * Because of different of each line, createKeys() need to count each width of the line.
		*/
		getLineSize: function(line) {
			if (!line || line.length == 0) return 1; // 0 divide zero

			var size = 0;
			
			for (var i = 0; i < line.length; i++) {
				if (!line[i].s) line[i].s = 1;
				size += line[i].s;
			}
			return size;
		},
		/**
		 * Create selected layout.
		*/
		createKeys: function (layout) {
			var $line = null, $key = null, $keyContent = null, signElemSize = 0;
			if (!layout) layout = this.layouts[this.lang].layout;

			this.$el.html("");

			for (var i = 0; i < layout.length; i++) {
				$line = $("<div class='line' />");
				signElemSize = 100 / this.getLineSize(layout[i]);
				this.$el.append($line);

				for (var j = 0; j < layout[i].length; j++) {
					$key = $("<span class='key focusable' />");
					$line.append($key);

					$keyContent = $('<span class="content" />');
					$keyContent.html(layout[i][j].v);
					$key.append($keyContent);

					if (layout[i][j].sec) {
						$keySecContent = $('<span class="seccontent" style="position: relative; top: -40px; right: -25px; color: #6c6e6e" />');
						$keySecContent.html(layout[i][j].sec);
						$key.append($keySecContent);
					}

					if (!layout[i][j].s) layout[i][j].s = 1;
					$key.attr("data-width", layout[i][j].s);
					$key.attr("data-posx", j);
					$key.attr("data-posy", i);
					if (layout[i][j].t == "K" || layout[i][j].t == "N") $key.addClass("tt");
					$key.css("width", (signElemSize * layout[i][j].s).toFixed(2) + "%");
					$key.attr("data-val", layout[i][j].v.toUpperCase());
					$key.attr("data-keycode", layout[i][j].v.toUpperCase().charCodeAt(0) ? layout[i][j].v.toUpperCase().charCodeAt(0) : "");
					if (layout[i][j].t === "F") {
						if (!layout[i][j].id) $keyContent.html("&nbsp;");
						else $key.attr("data-id", layout[i][j].id);
						$keyContent.addClass(layout[i][j].id === "CAPSLOCK" ? "CAPSLOCK" : layout[i][j].v.toUpperCase());
					}
				}
			}
		},
		/**
		 * Only show element of keyboard.
		*/
		showKeyboard: function () {
			if (this.keyboardPosition == this.enums["BOTTOM"]) this.$el.attr("style", "top: 410px");
			else if (this.keyboardPosition == this.enums["TOP"]) this.$el.attr("style", "top: 50px");

			if(this.$cover) { this.$cover.show(); }
			this.$el.show();
		},
		/**
		 * Only hide element of keyboard.
		*/
		hideKeyboard: function () {
			if(this.$cover) { this.$cover.hide(); }
			this.$el.hide();
		},
		/**
		 * Create clickable cover under the keyboard.
		*/
		cover: function () {
			var scope = this;

			this.$cover = $("<div class='keyboard-cover' />");
			this.$cover.bind("click", function () { scope.exit(); });
			this.$cover.hide();
			$("body").append(this.$cover);
		},
		/**
		 * Create content which holds the keyboard itself.
		*/
		content: function () {
			this.$el = $("<div class='keyboard-content' />");
			this.$el.hide();
			$("body").append(this.$el);
		}
	});

	Main.ready(function () {
		Keyboard.init(CONFIG.keyboard);
	});

	return Keyboard;

})(Events);
