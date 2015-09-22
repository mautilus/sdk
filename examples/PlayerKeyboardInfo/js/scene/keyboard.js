/**
 * Keyboard scene
 * 
 * @author Mautilus s.r.o.
 * @class Scene_Keyboard
 * @extends Scene
 */

Scene_Keyboard = (function(Scene) {

	var Scene_Keyboard = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Keyboard.prototype, Scene.prototype, {
		init: function() {
			this.config.focusOnRender = false;

			this.input = new Input('font-size: 30px; font-weight: 400; font-family: ubuntu');
			this.input.create(this.$el.find('#test-input'));

			this.input.setValue('');
			this.input.blur();
		},

		/**
		 * @inheritdoc Scene#create
		 */
		create: function() {
			return $('#scene-keyboard');
		},

		activate: function() {
		},

		render: function() {
			App.colorNavSnip.render(this.name);
			this.showKeyboard();
		},

		/**
		 * To show keyboard
		 * @param {Object} input 
		 */
		showKeyboard: function() {
			Keyboard.show(this.input);
			this.input.off('change:value');
			this.input.on('change:value', this.onCharacterChange, this);

			Keyboard.on('exit', function() {
				this.focus();
				Keyboard.off('exit');
			}, this);
		},

		onLangChange: function(firstTime, langCode) {
			I18n.translateHTML(this.$el);
		},

		onClick: function($el, event) {
			return this.onEnter.apply(this, arguments);
		},

		onEnter: function($el, event) {
			var action = $el.attr('id');

			if (action == 'test-input') {
				this.showKeyboard();
			}
			return false;
		},

		onReturn: function() {
			Router.goBack();
			return false;
		},

		focus: function() {
			var $el = this.$el.find('#test-input');
			Focus.to($el);
		}

	});

	return Scene_Keyboard;

})(Scene);