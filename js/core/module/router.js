/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Manages scenes
 * 
 * @author Mautilus s.r.o.
 * @class Router
 * @singleton
 * @mixins Events
 * @mixins Deferrable
 */

Router = (function(Events, Deferrable) {
	var Router = {
		/**
		 * @property {Object} config General config hash
		 */
		config: null,
		/**
		 * @property {Array} scenes All registered scenes
		 */
		scenes: [],
		/**
		 * @property {Array} history Scene history
		 */
		history: [],
		/**
		 * @property {Scene} activeScene Currently active scene
		 */
		activeScene: null,
		/**
		 * @property {String} activeSceneName Currently active scene's name
		 */
		activeSceneName: null,

		activeSceneArgs: null
	};

	$.extend(true, Router, Events, Deferrable, {
		/**
		 * @event scene
		 * Will be called when a scene is changed, args: sceneName, Scene, config
		 * @param {String} name
		 * @param {Object} scene
		 * @param {Array} arguments
		 */
		init: function(config) {
			this.configure(config);
			
			this.showPromise = null;
		},
		/**
		 * Set class config hash
		 * 
		 * @param {Object} config Hash of parameters
		 */
		configure: function(config){
			this.config = $.extend(true, this.config || {}, config);
		},
		/**
		 * Register new Scene
		 * 
		 * @chainable
		 * @param {String} name Unique scene name
		 * @param {Scene} Scene
		 */
		addScene: function(name, Scene) {
			this.scenes[name] = Scene;
			return this;
		},
		/**
		 * Find registered scene by its name
		 * 
		 * @param {String} name
		 * @returns {Scene} Returns FALSE if not found
		 */
		getScene: function(name) {
			return (this.scenes[name] || false);
		},
		/**
		 * Go to the specified scene
		 * 
		 * @param {Boolean} [historyPush=false] Set to FALSE if you don't want to push this scene into a history stack
		 * @param {String} name Scene's name
		 * @returns {Scene} Return FALSE if failed
		 */
		go: function(name) {
			var args = Array.prototype.slice.call(arguments, 0), scene, currentScene, destruct = true, show, hide, onShow, onHide, historyPush, promise = new Promise();
			
			if(typeof name === 'boolean'){
				historyPush = name;
				name = args[1];
				args = args.slice(1);
			}

			console.log('[Router] Go to ' + name);
			
			onHide = function() {
				if (typeof scene === 'function') {
					currentScene = new scene(name, args.slice(1));

				} else {
					currentScene = scene;
				}
				
				this.showPromise = show = currentScene.show.apply(currentScene, args.slice(1));

				if (show instanceof Promise) {
					show.then(function(status) {
		    	p_args = Array.prototype.slice.call(arguments, 1);	// PP!
			if (status) {
			    onShow.apply(this, p_args);							// PP!
						} else if(this.activeScene) {
							if(currentScene.revert() === true){
								// go back if rejected
								this.go.apply(this, this.activeSceneArgs);  
							}

							promise.reject();
						}
					}, this);

				} else if (show !== false) {
					onShow.call(this);

				} else {
					// go back if rejected
					this.go.apply(this, this.activeSceneArgs);  
					
					promise.reject();
				}
			};

			onShow = function() {
				if (this.activeScene) {
					this.activeScene.remove();
					
					if(destruct){
					this.activeScene.desctruct();
					}
				}

				if(historyPush !== false){
					this.history.unshift(args);
				}

				this.activeScene = currentScene;
				this.activeSceneName = name;
				this.activeSceneArgs = args;
				
				this.trigger('scene', name, this.activeScene, args);
				
		this.activeScene.render.apply(this.activeScene, arguments);		// PP!

				if(this.activeScene.config.focusOnRender !== false){
					this.activeScene.focus();
				}
				
				promise.resolve();
			};

			if ((scene = this.getScene(name)) !== false) {
				if (this.activeScene === scene && this.activeScene.isVisible) {
					this.activeScene.refresh(args.slice(1));
					
					if(this.activeScene.config.focusOnRender !== false){
						this.activeScene.focus();
					}
					
					return false;
				}
				
				if(this.showPromise instanceof Promise && this.showPromise.state !== this.showPromise.STATE_RESOLVED){
					this.showPromise.reject();
				}

				if (this.activeScene) {
					hide = this.activeScene.hide();

					if (hide instanceof Promise) {
						hide.then(function(status) {
							if(! status){
								destruct = false;
							}
							
							onHide.call(this);
						}, this);

					} else if (hide === false) {
						destruct = false;
						onHide.call(this);

					} else {
						onHide.call(this);
					}
					
				}else{
					onHide.call(this);
				}
			}

			return promise;
		},
		/**
		 * Routes to the previous scene
		 * 
		 * @returns {Scene} Return FALSE if failed
		 */
		goBack: function() {
			var args, promise, returnScene = null;
			
			if((args = this.history.shift())){
				if(args && args[0] === this.activeSceneName){
					return this.goBack();
				}
				
				returnScene = (args && args[0] ? this.getScene(args[0]) : null);
				promise = new Promise();
				
				this.go.apply(this, args).then(function(status){
					if(status){
						promise.resolve();
					
					}else{
						promise.reject();
					}
				}); 
			
			}else{
				promise = new Promise();
				promise.reject();
			}

			return promise;
		},
		/**
		 * Check, if given scene name is the current active scene
		 * 
		 * @param {String} name
		 * @returns {Boolean}
		 */	
		isSceneActive: function(name){
			return (this.activeSceneName === name);
		},
		/**
		 * Clear router history
		 */
		clearHistory: function(){
			this.history = [];
		},
		/**
		 * Shift the last scene from a history
		 * 
		 * @param {String} [sceneName] sceneName
		 * @returns {Object}
		 */
		shiftHistory: function(sceneName){
			if(sceneName){
				if(this.history[0] && this.history[0][0] === sceneName){
					return this.history.shift();
				}
				
				return false;
			}
			
			return this.history.shift();
		}
	});
	
	// Initialize this class when Main is ready
	Main.ready(function(){
		Router.init();
	});

	return Router;

})(Events, Deferrable);