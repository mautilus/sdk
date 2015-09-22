/**
 * Color navigation snippet
 * 
 * @author Mautilus s.r.o.
 * @class Snippet_ColorNavigation
 * @extends Snippet
 */

Snippet_ColorNavigation = (function (Scene) {

	var Snippet_ColorNavigation = function () {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Snippet_ColorNavigation.prototype, Snippet.prototype, {

		init: function (parent, config) {
			console.log('[Snippet_ColorNavigation] init');
			
			this.buttons = [];
		},

		/**
		* @inheritdoc Snippet#create
		*/
		create: function () {
			return $('#snippet-color-navigation');
		},

		/**
		* @inheritdoc Snippet#render
		*/
		render: function (sceneName) {
			this.clear();
			this.show();

			this.buttons = this.getButtons(sceneName);
			
			// make HTML template
			var html = this.getTemplate({
				buttons: this.buttons
			});

			// append HTML to DOM
			this.$el.html(html);
		},

		/**
		 * To get Html template
		 */
		getTemplate: function (data) {
			var html = '';
			for(var i = 0; i < data.buttons.length; i++) {
				html += '<div class="item clickable ' + data.buttons[i].color + '" data-id="' + data.buttons[i].id + '">' + data.buttons[i].label + '</div>';
			}

			if (html) {
				html = '<div class="color-buttons">' + html + '</div>';
			}

			return html;
		},

		/**
		 * @inheritdoc Snippet#refresh
		 */
		refresh: function(sceneName) {
			sceneName = sceneName || Router.activeScene.name;
			this.render(sceneName);
		},

		/**
		 * To get List of buttons for render
		 * @param {String} sceneName - name of scene
		 * @returns {Array.Object} List of buttons for given sceneName
		 */
		getButtons: function(sceneName) {
			var buttons = [];

			if (sceneName == 'splashscreen') {
				// nothing
			} else if (sceneName == 'welcome') {
				buttons.push({id: 'exit', label: I18n.translate('Exit'), color: 'red'});

			} else if (sceneName == 'info') {

			} else if (sceneName == 'keyboard') {

			} else {
				// nothing
			}

			return buttons;
		},

		/**
		 * @overwritetdoc Snippet#onKeyDown
		 */
		onKeyDown: function(keyCode, ev, stop) {
			if (this.isVisible && (typeof(Keyboard) === 'undefined' || Keyboard.$el.css('display') !== 'block')) {
				if ((keyCode === Control.key.RED || (Device.isDEFAULT && keyCode == 82)) && this.isActiveColor('red')) {
					console.log('red');
					var id = this.getIdOfColor('red');
					this.handleAction(id);
				} else if ((keyCode === Control.key.YELLOW || (Device.isDEFAULT && (keyCode == 90 || keyCode == 89))) && this.isActiveColor('yellow')) {
					console.log('yellow');
					var id = this.getIdOfColor('yellow');
					this.handleAction(id);
				} else if ((keyCode === Control.key.BLUE || (Device.isDEFAULT && keyCode == 66)) && this.isActiveColor('blue')) {
					console.log('blue');
					var id = this.getIdOfColor('blue');
					this.handleAction(id);
				} else if ((keyCode === Control.key.GREEN || (Device.isDEFAULT && keyCode == 71)) && this.isActiveColor('green')) {
					console.log('green');
					var id = this.getIdOfColor('green');
					this.handleAction(id);
				}
			}
		},

		/**
		 * To check if button with specified color is visible (active)
		 * @param {String} color - color of button (e.g. 'red', 'yellow')
		 * @returns {Boolean}
		 */
		isActiveColor: function(color) {
			for(var i = 0; i < this.buttons.length; i++) {
				if (this.buttons[i].color == color) {
					return true;
				}
			}
			return false;
		},

		/**
		 * To get id of button specified by color
		 * @param {String} color - color of button (e.g. 'red', 'yellow')
		 * @returns {String} id
		 */
		getIdOfColor: function(color) {
			for(var i = 0; i < this.buttons.length; i++) {
				if (this.buttons[i].color == color) {
					return this.buttons[i].id;
				}
			}
			return false;
		},

		/**
		 * To handle action
		 * @param {String} id - identifier of action
		 */
		handleAction: function(id) {
			switch(id) {
				case 'back': this.goBack(); break;
				case 'exit': this.goExit(); break;
				default: break;
			}
		},

		goBack: function() {
			console.log('[Snippet_ColorNavigation] goBack');
			Router.goBack();
		},

		goExit: function() {
			console.log('[Snippet_ColorNavigation] goExit');
			Device.exit();
		},

		onClick: function ($el, event) {
			if (this.trigger('click', $el, event) === false) {
				return false;
			}
			return this.onEnter.apply(this, arguments);
		},

		onEnter: function ($el, event) {
			console.log('[Snippet_ColorNavigation] onEnter');

			var id = $el.attr('data-id');
			this.handleAction(id);
			
			return false;
		},

		navigate: function (direction) {
			if (direction == 'up')         { this.trigger('focus:out', this, direction); }
			else if (direction == 'down')  { this.trigger('focus:out', this, direction); }
			else if (direction == 'left')  { Focus.to(this.getCircleFocusable(-1)); }
			else if (direction == 'right') { Focus.to(this.getCircleFocusable(1));  }
			return false;
		},

		focus: function ($el) {
			if ($el && $el.jquery && $el.length) {
				return Focus.to($el);
			} else {
				return Focus.to(this.$el.find('.focusable').eq(0));
			}
		},

		isFocusable: function () {
			return this.getFocusable().length ? true : false;
		},

		clear: function () {
			this.$el.empty();
		}

	});

	return Snippet_ColorNavigation;

})(Scene);