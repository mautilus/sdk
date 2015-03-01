/**
 * Test scene
 * 
 * @author Mautilus s.r.o.
 * @class Scene_Welcome
 * @extends Scene
 */

Scene_Test = (function (Scene) {

	var Scene_Test = function () {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Test.prototype, Scene.prototype, {
		init: function () {
			var input = new Input();
			//input.setPasswordMode(); turn on / off password mode
			input.create(this.$el.find(".input-cover"));
			input.setValue("hodnota");
			input.blur();
			this.input = input;
		},
		activate: function () {
			Focus.to(this.$el.find(".btnorig"));
		},
		onLangChange: function () {
		},
		onClick: function ($el, event) {
			this.onEnter.apply(this, arguments);
		},
		onEnter: function ($el, event) {
			if ($el.hasClass("btnorig")) Keyboard.show($("#originput"));
			else if ($el.hasClass("btnmine")) Keyboard.show(this.input);
		},
		navigate: function (direction) {
			if (direction == "left") Focus.to(this.getCircleFocusable(-1));
			else if (direction == "right") Focus.to(this.getCircleFocusable(1));
		},
		/**
		 * @inheritdoc Scene#create
		 */
		create: function () {
			return $('#scene-test');
		},
		/**
		 * @inheritdoc Scene#render
		 */
		render: function () {
		},
		onReturn: function ($el) {
			Router.goBack();
		}

	});

	return Scene_Test;

})(Scene);