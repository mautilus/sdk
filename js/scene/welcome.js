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
		init: function(){
			console.log("Welcome init");
			 this.$h3 = this.$el.find('.title');
			 this.$buttonEn = this.$el.find(".button[data-action='en']");
			 this.$buttonCs = this.$el.find(".button[data-action='cs']");
			 this.$buttonTest = this.$el.find(".button[data-action='test']");
		},
		render: function() {
			if(Main.device[0] === 'webos') {
				Device.clearHistory();
			}
		},
		activate: function() {
			 App.throbber();
			setTimeout(bind(function() {
				App.throbberHide();
				App.notification(__("welcome"));
				Focus.to(this.$buttonTest);
			}, this), 750);
		},
		onLangChange: function () {
			this.$h3.html(__("h3"));
			this.$buttonEn.html(__("button_en"));
			this.$buttonCs.html(__("button_cs"));
			this.$buttonTest.html(__("button_test"));
		},
		onClick: function($el, event) {
		   this.onEnter.apply(this, arguments);
		},
		onEnter: function($el, event) {
			var action = $el.attr("data-action");
			if (action === "cs") I18n.changeLanguage("CS");
			else if (action === "en") I18n.changeLanguage("EN");
			else if (action === "test") Router.go("test");
			return false;
		},
		navigate: function(direction) {
			if (direction == "left") Focus.to(this.getCircleFocusable(-1));
			else if (direction == "right") Focus.to(this.getCircleFocusable(1));
		},
		/**
		 * @inheritdoc Scene#create
		 */
		create: function() {
			return $('#scene-welcome');
		},
		/**
		 * @inheritdoc Scene#render
		 */
		render: function() {
		}

	});

	return Scene_Welcome;

})(Scene);