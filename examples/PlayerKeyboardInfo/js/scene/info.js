/**
 * Info scene
 * 
 * @author Mautilus s.r.o.
 * @class Scene_Info
 * @extends Scene
 */

Scene_Info = (function(Scene) {

	var Scene_Info = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Info.prototype, Scene.prototype, {
		init: function() {
			console.log('Info init');
			this.focusOnRender = false;
		},

		/**
		 * @inheritdoc Scene#create
		 */
		create: function() {
			return $('#scene-info');
		},

		activate: function() {
		},

		render: function() {
			var html = this.getTemplateToRender();

			App.colorNavSnip.render(this.name);
			this.$el.html(html);
			I18n.translateHTML(this.$el);
		},

		getTemplateToRender: function() {
			var html = '';
			html += '<div class="title">Info</div>'
					+ 	'<div class="subtitle">'
					+		'<span class="par"><span data-i18n="Download_SDK_on"></span> <span class="url">https://github.com/mautilus/sdk</span></span>'
					+		'<span class="par"><span data-i18n="SDK_documentation_on"></span> <span class="url">http://smarttv.mautilus.com/SDK/</span></span>'
					+	'</div>'
					+ '<div class="description"></div>';
			return html;
		},

		onLangChange: function(firstTime, langCode) {
			I18n.translateHTML(this.$el);
		},

		onClick: function($el, event) {
			return this.onEnter.apply(this, arguments);
		},

		onEnter: function($el, event) {
			return false;
		},

		onReturn: function() {
			Router.goBack();
			return false;
		}

	});

	return Scene_Info;

})(Scene);