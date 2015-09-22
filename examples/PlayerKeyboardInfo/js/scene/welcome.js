/**
 * Welcome scene
 * 
 * @author Mautilus s.r.o.
 * @class Scene_Welcome
 * @extends Scene
 */

Scene_Welcome = (function(Scene) {

	var Scene_Welcome = function() {
	this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Welcome.prototype, Scene.prototype, {
		init: function() {
			console.log('Welcome init');
			this.$lastFocused = null;
			this.config.focusOnRender = true;
		},

		/**
		 * @inheritdoc Scene#create
		 */
		create: function() {
			return $('#scene-welcome');
		},

		activate: function() {
			App.colorNavSnip.render(this.name);
		},

		onLangChange: function(firstTime, langCode) {
			I18n.translateHTML(this.$el);
		},

		onClick: function($el, event) {
			return this.onEnter.apply(this, arguments);
		},

		onEnter: function($el, event) {
			var action = $el.attr('data-id');

			switch(action) {
				case 'player':
					Router.go('player');
					break;
				case 'keyboard':
					Router.go('keyboard');
					break;
				case 'info':
					Router.go('info');
					break;
				default:
					break;
			}
			return false;
		},

		navigate: function(direction) {
			if (direction == 'left') Focus.to(this.getCircleFocusable(-1));
			else if (direction == 'right') Focus.to(this.getCircleFocusable(1));
		},

		focus: function() {
			if (this.$lastFocused) {
				Focus.to(this.$lastFocused);
			} else {
				var $el = this.$el.find('.focusable').eq(0);
				Focus.to($el);
			}
		},

		onFocus: function($el) {
			this.$lastFocused = $el;
		}

	});

	return Scene_Welcome;

})(Scene);