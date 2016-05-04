/**
 * Test scene
 * 
 * @author Mautilus s.r.o.
 * @class Scene_Test
 * @extends Scene
 */

Scene_Test = (function (Scene) {

	var Scene_Test = function () {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Test.prototype, Scene.prototype, {
        /**
         * @inheritdoc Scene#init
         */
        init: function () {
			var input = new Input();
			//input.setPasswordMode(); turn on / off password mode
			input.create(this.$el.find(".input-cover"));
			input.setValue("hodnota");
			input.blur();
			this.input = input;
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
            console.log('render test scene');
		},
		/**
		 * @inheritdoc Scene#activate
		 */
		activate: function () {
			Focus.to(this.$el.find(".btnorig"));
		},
		/**
		 * @inheritdoc Scene#onLangChange
		 */
		onLangChange: function () {
		},
		/**
		 * @inheritdoc Scene#onClick
		 */
		onClick: function ($el, event) {
			this.onEnter.apply(this, arguments);
		},
		/**
		 * @inheritdoc Scene#onEnter
		 */
		onEnter: function ($el, event) {
			if ($el.hasClass("btnorig")) Keyboard.show($("#originput"));
			else if ($el.hasClass("btnmine")) Keyboard.show(this.input);
		},
		/**
		 * @inheritdoc Scene#navigate
		 */
		navigate: function (direction) {
			if (direction == "left") Focus.to(this.getCircleFocusable(-1));
			else if (direction == "right") Focus.to(this.getCircleFocusable(1));
		},
		/**
		 * @inheritdoc Scene#onReturn
		 */
		onReturn: function ($el) {
			Router.goBack();
		}

	});

	return Scene_Test;

})(Scene);