/**
 * Application class
 * 
 * @author Mautilus s.r.o.
 * @class App 
 * @singleton
 * @mixins Events
 * @mixins Deferrable
 */

App = (function(Events, Deferrable) {

	var App = {
	/**
	 * @property {Boolean} networkStatus Network status, TRUE if connected
	 */
	networkStatus: true
	};

	$.extend(true, App, Events, Deferrable, {
		/**
		 * @event network
		 * Will be called when network status changes
		 * @param {Boolean} status
		 */

		/**
		 * Initialize Application
		 */
		init: function() {
			var scope = this, $notifications = $('#notifications');

			// notification element
			if ($notifications.length)
				this.$notifications = $notifications;
			else {
				this.$notifications = $('<div id="notifications" />');
				$('body').append(this.$notifications);
			}
			// throbber interval
			this.throbberInt = null;
			// is throbber visible
			this.throbberIsShown = false;

			// monitor network connection
			setInterval(function() {
				scope.checkNetworkConnection();
			}, 1000);

			this.initRouter();
		},

		/**
		 * Register scenes and route to the `welcome` scene
		 * 
		 * @private
		 */
		initRouter: function() {
			// Global snippets
			this.colorNavSnip = new Snippet_ColorNavigation(null, {});
			
			// To register scenes
			Router.addScene('splashscreen', new Scene_Splashscreen('splashscreen'));
			Router.addScene('welcome', new Scene_Welcome('welcome'));
			Router.addScene('info', new Scene_Info('info'));
			Router.addScene('player', new Scene_Player('player'));
			Router.addScene('keyboard', new Scene_Keyboard('keyboard'));

			// Router to default scene
			Router.go('splashscreen');
		},

		/**
		 * @private
		 */
		checkNetworkConnection: function() {
			Device.checkNetworkConnection(function(status) {
				if (status !== this.networkStatus) {
					this.networkStatus = status;
					this.trigger('network', this.networkStatus);
				}
			}, this);
		},

		/**
		 * Throbber show
		 * @param {Boolean} disable all controls
		 */
		throbber: function(disable) {
			if (this.throbberIsShown)
				return;				// only one instance of throbber

			if (disable) {
				Control.disable();	// while throbber is loading, disable all controls
				Mouse.disable();
			}

			var $throbber = $('<div class="throbber" />');
			$('body').append($throbber);

			this.throbberIsShown = true;

			// animation
			var pos = 0, width = 71, max = -781;
			this.throbberInt = setInterval(function() {
				pos -= width;
				if (pos < max)
					pos = 0;
				$throbber.css('background-position', pos + 'px 0px');
			}, 100);
		},

		/**
		 * Throbber hide
		 * @param {Boolean} enable all controls
		 */
		throbberHide: function(enable) {
			if (this.throbberIsShown) {
				this.throbberIsShown = false;
				clearInterval(this.throbberInt);
				this.throbberInt = null;
				$('.throbber').remove();
				if (enable) {
					Control.enable();
					Mouse.enable();
				}
			}
		},

		/**
		 * Notification
		 * @param {String} msg
		 */
		notification: function(msg) {
			var $el = $('<div class="msg" />').html(msg);
			$('#notifications').html($el);

			$el.fadeIn();

			setTimeout(function() {
				if ($el) {
					$el.fadeOut();
				}
			}, 4000);
		}
	});

	// Initialize this class when Main is ready
	Main.ready(function() {
		App.init();
	});

	return App;

})(Events, Deferrable);