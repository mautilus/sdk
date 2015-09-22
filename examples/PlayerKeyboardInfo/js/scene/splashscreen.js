/**
 * Splashscreen scene
 * 
 * @author Mautilus s.r.o.
 * @class Scene_Splashscreen
 * @extends Scene
 */

Scene_Splashscreen = (function(Scene) {

	var Scene_Splashscreen = function() {
	this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Splashscreen.prototype, Scene.prototype, {
		init: function() {
			console.log('Splashscreen init');
		},

		/**
		 * @inheritdoc Scene#create
		 */
		create: function() {
			return $('#scene-splashscreen');
		},

		activate: function() {
			App.colorNavSnip.render(this.name);

			App.throbber();
			setTimeout(bind(function() {
				App.throbberHide();

				Router.go('welcome');
			}, this), 1000);
		}

	});

	return Scene_Splashscreen;

})(Scene);