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
			var scope = this;

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
			Router.addScene('main', new Scene_Main);

			Router.go('main');
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
		}
	});

	// Initialize this class when Main is ready
	Main.ready(function() {
		App.init();
	});

	return App;

})(Events, Deferrable);