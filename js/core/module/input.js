/*
********************************************************
* Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
* All rights reserved.
*
* You may obtain a copy of the License at LICENSE.txt
********************************************************
*/

/**
 * Input class
 * 
 * @author Mautilus s.r.o.
 * @class Input
 * @mixins Events
 */


Input = (function () {
	var Input = function () {
		this.init.apply(this, arguments);
	};

	$.extend(true, Input.prototype, Events, {
		/**
		* This value holds each signs in the input.
		*/
		valueArray: [], // {char: '', width: 0} 
		/**
		* Input which is called after the input is created.
		*/
		init: function (style, options) {

			this.$inputHelp = $('<div style="float:left;display: none;' + (style ? style : "") + '"></div>');
			this.passwordMode = false;
			this.value = "";
			this.valueArray = [];
			$("body").append(this.$inputHelp);
			if (options) {
				if (options.maxLength)
					this.setMaxLength(options.maxLength);
				if (options.cursorBorderColor)
					this.borderColor = options.cursorBorderColor;
				if (options.placeHolder)
					this.placeHolder = options.placeHolder;
				if (options.placeHolderFontSize)
					this.phfs = options.placeHolderFontSize;
			}

			I18n.on('langchange', function () {
				if (I18n.locale == "AR")
					this.setArabic();
				else
					this.setArabic(true);
			}, this);
		},
		/**
		* Set password mode.
		*/
		setPasswordMode: function () {
			this.passwordMode = true;
		},
		setArabic: function (dontSet) {
			if (this.$el != undefined && !dontSet) {
				this.$el.css('direction', 'rtl');
				this.$el.addClass('arabic');
			}
			else if (this.$el != undefined) {
				this.$el.css('direction', 'ltr');
				this.$el.removeClass('arabic');
			}

			this.isRTL = dontSet ? false : true;

			this.trigger('rtlChanged', this.isRTL);
		},
		/**
		* Create input.
		*/
		create: function ($parent, css) {
			this.$el = $("<div class='input' style='position:relative;'><span class='text' style='position: relative; left: 0px; white-space: nowrap;'></span></div>");
			this.$text = this.$el.find(".text");
			this.$cursor = $("<div class='cursor' style='position: absolute; left:0; top:0;display:absolute;'></div>");
			this.cursorBlinking = null;
			this.cursorPos = 0;
			this.$el.css(css || {});
			this.$el.append(this.$cursor);
			$parent.append(this.$el);

			this.$inputHelp.css("font-size", this.$el.css("font-size"));
			this.$inputHelp.css("font-family", this.$el.css("font-family"));
			this.$inputHelp.css("padding", this.$el.css("padding"));
			this.$inputHelp.css("color", this.$el.css("color"));

			if (this.isRTL || I18n.locale == "AR")
				this.setArabic();


			this.isRTL = this.$el.css('direction') == "rtl" ? true : false;

			if (this.placeHolder)
				this.setPlaceholder(true);
		},
		/**
		* Get dimensions from input text.
		*/
		getTextDimensions: function (text) {
			if (!text || text.length == 0) return 0;
			if (text == " ") text = "&nbsp;";
			if (this.passwordMode) text = "*";
			this.$inputHelp.html(text);
			return { width: this.$inputHelp.width(), height: this.$inputHelp.height() };
		},
		/**
		* Remove help input.
		*/
		destroy: function () {
			this.$inputHelp.remove();
		},
		/**
		* Set value to the input. The text is stored inside the variable.
		*/
		setValue: function (text, focus) {
			if (!text) text = "";

			this.value = text;
			this.valueArray = [];
			this.setText("");

			var xchar = "";
			for (var i = 0; i < text.length; i++) {
				if (i >= this.maxLength)
					break;

				xchar = text[i];
				this.valueArray.push({ char: xchar, width: this.getTextDimensions(xchar).width });
			}

			this.setText(text);

			if (focus)
				this.cursor();
		},
		setPlaceholder: function (set) {
			if (set) {
				this.$el.css('color', 'grey');
				this.$text.css('font-size', (this.phfs || "12") + "px");
				this.setText(this.placeHolder, true);
			}
			else {
				this.$el.css('color', this.$inputHelp.css('color'));
				this.$text.css('font-size', this.$inputHelp.css('font-size'));
			}
		},
		/**
		* Set text, which user can see on the screen.
		*/
		setText: function (text, isPlaceholder) {
			if (this.passwordMode && !isPlaceholder) {
				this.$text.html(text.replace(new RegExp(".", "gm"), "*"));
			} else {
				text = text.replace(new RegExp("&", "gm"), "&amp;");
				text = text.replace(new RegExp(" ", "gm"), "&nbsp;");
				text = text.replace(new RegExp("<", "gm"), "&lt;");
				text = text.replace(new RegExp(">", "gm"), "&gt;");
				
				this.$text.html(text);
			}

			if (this.$text.html().length < 1 && this.placeHolder) {
				this.setPlaceholder(true);
			} else if (!isPlaceholder) {
				this.setPlaceholder();
			}
		},
		/**
		* set max count of characters
		**/
		setMaxLength: function (length) {
			if (!length)
				this.maxLength = -1;
			else
				this.maxLength = length;
		},
		/**
		* Get current input value.
		*/
		getValue: function () {
			return this.value;
		},
		/**
		* Insert new char to the input.
		*/
		insert: function (xchar) {
			var len = this.valueArray.length;
			if (this.maxLength > -1 && this.maxLength <= len)
				return;

			if (len == this.cursorPos) {
				this.valueArray.push({ char: xchar, width: this.getTextDimensions(xchar).width });
				this.value += xchar;
				this.setText(this.value);

				this.cursor();
			} else {
				// insert inside

				var left = this.valueArray.splice(0, this.cursorPos), right = this.valueArray,
					leftS = this.value.substr(0, this.cursorPos), rightS = this.value.substr(this.cursorPos, this.value.length - this.cursorPos);

				this.valueArray = left.concat([{ char: xchar, width: this.getTextDimensions(xchar).width}], right);
				this.value = leftS + xchar + rightS;
				this.setText(this.value);
				this.cursorPos++;
				this.cursor(this.cursorPos);
			}
			this.trigger('inserted', this.getValue());
		},
		/**
		* Cursor functionality inside the input.
		*/
		cursor: function (position) {
			var width = 1, len = this.valueArray.length, newWidth = 0, parentWidth = this.$el.width(), diff = 0;

			if (typeof position === "undefined") position = len;

			for (var i = 0; i < len; i++) {
				if (position == i) break;
				width += this.valueArray[i].width;
			}

			newWidth = width + parseInt(this.$el.css("padding-left"), 10);

			//it wrong display length of arabic text
			if (this.isRTL) {
				var text = this.$text.text().substr(0, position || this.valueArray.length);
				this.$inputHelp.html(text);
				var helpWidth = this.$inputHelp.width();
				newWidth = this.$el.width() - helpWidth - 1//this.$el.find('.text').width();
			}
			this.$cursor.show();

			var textHeight = this.$text.height() > 0 ? this.$text.height() : this.getTextDimensions("T").height, inputHeight = this.$el.height();
			if (inputHeight < 1) inputHeight = textHeight;
			var mt = (Math.floor((inputHeight - textHeight) / 2) + parseInt(this.$el.css('padding-top'), 10)), scope = this;
			
			this.$cursor.css("height", textHeight + "px");
			this.$cursor.css("width", newWidth + "px");
			
			this.$cursor.css("top", mt + "px");
			this.$cursor.css("border", "1px solid " + (this.borderColor ? this.borderColor : "black"));
			this.$cursor.css("border-width", "0px 1px 0px 0px");

			this.cursorPos = position;

			this.clearCursor();
			this.cursorBlinking = setInterval(function () {
				if (textHeight == 0) scope.cursor(position);
				else scope.$cursor.toggle();
			}, 650);

			// empty
			if (this.$text.width() == 0) {
//				this.$el.css("height", this.getTextDimensions("T").height + "px"); // PP
				if(!this.$el.height()) {this.$el.css('height', (this.getTextDimensions('T').height + 2) + 'px');}
				this.$cursor.css("top", ((this.$el.height() - textHeight) / 2 + parseInt(this.$el.css('padding-top'), 10)) + "px");
			}
			else {
				//this.$el.css("height", "auto"); // PP
				if(!this.$el.height()) {this.$el.css("height", "auto");} // PP
			}
			// move text
			if (newWidth > parentWidth) {
				// move
				diff = -1 * (newWidth - parentWidth);
				if (newWidth >= this.$el.width()) this.$cursor.css("width", (this.$el.width()-1) + "px");
				
				this.$text.css("left", diff + "px");
			}
			else if (newWidth < 0 && this.isRTL) {
				diff = -1 * newWidth;
				if (newWidth > this.$el.width()) this.$cursor.css("width", this.$el.width() + "px");
				this.$text.css("left", diff + "px");
			}
			else this.$text.css("left", "0px");
		},
		/**
		* Hide cursor.
		*/
		cursorHide: function () {
			this.clearCursor();
			this.cursorPos = -1;
			this.$cursor.hide();
		},
		/**
		* Cleart cursor timeout.
		*/
		clearCursor: function () {
			if (this.cursorBlinking) {
				clearInterval(this.cursorBlinking);
				this.cursorBlinking = null;
			}
		},
		/**
		* Public function for keyboard for moving with the cursor.
		*/
		moveCaret: function (direction, special) { // public function for keyboard
			// special
			if (special) {
				if (special == "start") this.cursor(0);
				else if (special == "end") this.cursor(this.valueArray.length);
				else this.move(direction);
			}
			else this.move(direction);
		},
		/**
		* Support function for moveCaret.
		*/
		move: function (direction) {
			if (this.cursorPos == -1) this.cursor();
			else {
				var len = this.valueArray.length;

				this.cursorPos += direction;
				if (this.cursorPos < 0) this.cursorPos = 0;
				else if (this.cursorPos > len - 1) this.cursorPos = len;

				this.cursor(this.cursorPos);
			}
		},
		/**
		* Backspace function.
		*/
		backspace: function () {
			var len = this.valueArray.length;
			if (len == this.cursorPos) {
				this.valueArray.splice(len - 1, 1);
				this.value = this.value.substr(0, this.value.length - 1);
				this.setText(this.value);

				this.cursor();
			} else if (this.cursorPos > 0) {
				// remove at position
				var left = this.valueArray.splice(0, this.cursorPos - 1);
				this.valueArray.splice(0, 1);
				leftS = this.value.substr(0, this.cursorPos - 1), rightS = this.value.substr(this.cursorPos, this.value.length - this.cursorPos);
				this.valueArray = left.concat(this.valueArray);
				this.value = leftS + rightS;
				this.setText(this.value);
				this.cursorPos--;
				if (this.cursorPos < 0) this.cursorPos = 0;
				this.cursor(this.cursorPos);
			}
		},
		/**
		* Remove all text from input. 
		*/
		clearAllText: function () {
			this.cursorPos = 0;
			this.value = "";
			this.valueArray = [];
			this.setText("");
			this.cursor();
		},
		/**
		* This functions is the same like standart input blur, which is removes cursor.
		*/
		blur: function () {
			this.clearCursor();
			this.$cursor.hide();
		}
	});

	return Input;
})()