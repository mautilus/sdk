/**
 * Video player scene
 *
 * @author Mautilus s.r.o.
 * @class Scene_Player
 * @extends Scene
 */
Scene_Player = (function(Scene) {

	var Scene_Player = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Player.prototype, Scene.prototype, {
		/**
		 * @inheritdoc Scene#init
		 */
		init: function(){
			var scope = this;

			this.playerControls = new Snippet_PlayerControls(this);

			// get video path
			var videoPath = './';
			if (Device.isSAMSUNG) {
				videoPath = '/mtd_down/widgets/user/' + curWidget.id + '/';
			}
			if (Device.isTIZEN) {
				var packageInfo = tizen.package.getPackageInfo(null);
				videoPath = '/opt/usr/apps/' + packageInfo.id + '/res/wgt/';
			}

			this.video = (Device.isSAMSUNG || Device.isTIZEN)? videoPath + CONFIG.video : './' + CONFIG.video;

			// mouse position
			this.mousePageX = 0;
			this.mousePageY = 0;

			// elements init
			this.$elCurrentTime = this.$el.find('.current-time');
			this.$elDuration = this.$el.find('.duration');
			this.$elProgressBar = this.$el.find('.progress-bar .inner');
			this.$elPlayBtn = this.$el.find('li[data-value="play"]');
			this.$elPlayBtnIcon = this.$elPlayBtn.find('> span');

			if (!this.inited) {
				this.inited = true;

				/* ** init player events ** */

				Player.on('statechange', function(state) {

					if (this.isVisible) {
						// pause/play icon
						this.$elPlayBtnIcon.toggleClass('icon-player-pause', state === Player.STATE_PLAYING || state === Player.STATE_BUFFERING);
						this.$el.toggleClass('ui-paused', state === Player.STATE_PAUSED);

						// show controls
						if (this.rendered) {
							this.playerControls.show();
						}

						// throbbers
						if (state === Player.STATE_BUFFERING){
							App.throbber(false);
						} else if (state === Player.STATE_PLAYING) {
							App.throbberHide(true);
						} else {
							App.throbberHide(true);
						}
					}
				}, this);

				Player.on('timeupdate', function(time) {

					if (Player.currentState == Player.STATE_PLAYING || (Device.isTIZEN && time > 0)) {

						var position = Math.floor(time/1000);

						if (this.isVisible) {
							if (this.seekPosition >= 0 && Player.STATE_PLAYING && time > 100) {
								this.firstSeekProcess();
							}
							this.update();
						}
					}
				}, this);

				Player.on('durationchange', function(time) {
					if (this.isVisible) {
						App.throbberHide(true);
					}
				}, this);

				Player.on('play', function() {
					console.log('PLAYER: PLAY');
				}, this);

				Player.on('seek', function(time) {
					console.log('PLAYER: SEEK ' + time);
				}, this);

				Player.on('pause', function() {
					console.log('PLAYER: PAUSE');
				}, this);

				Player.on('stop', function() {
					console.log('PLAYER: STOP');
				}, this);

				Player.on('end', function() {
					console.log('PLAYER: END');
				}, this);

				Player.on('reset', function() {
					console.log('PLAYER: RESET');
					if (this.isVisible) {
						this.reset();
					}
				}, this);

				Player.on('error', function() {
					console.log('PLAYER: ERROR');
				}, this);

				/* ** init event beforekey ** */

				this.on('beforekey', function(keyCode){
					if (keyCode === Control.key.RETURN){
						return;
					}

					if (keyCode === Control.key.PLAY){
						if ((Player.currentState === Player.STATE_PAUSED) && (Player.currentTime > 0)) {
							this.play();
						} else if (Player.currentState !== Player.STATE_PLAYING) {
							this.play(this.video);
						}
						return false;
					} else if (keyCode === Control.key.PAUSE) {
						scope.pause();
						return false;
					} else if (keyCode === Control.key.FF) {
						scope.forward();
						return false;
					} else if (keyCode === Control.key.RW) {
						scope.backward();
						return false;
					} else if (keyCode === Control.key.STOP) {
						this.onReturn();
						return false;
					}

				}, this);

				/* ** check mousemove ** */

				this.$el.mousemove(function(event) {
					var divPageX = Math.abs(scope.mousePageX - event.pageX),
						divPageY = Math.abs(scope.mousePageY - event.pageY);

					if (divPageX >= 10 || divPageY >= 10) {
						scope.mousePageX = event.pageX;
						scope.mousePageY = event.pageY;
						if (scope.rendered) {
							scope.playerControls.show();
						}
					}
				});
			}
		},

		/**
		 * @inheritdoc Scene#create
		 */
		create: function() {
			return $('#scene-player');
		},

		/**
		 * @inheritdoc Scene#render
		 */
		render: function() {
			return this.when(function(promise) {
				var scope = this;

				App.colorNavSnip.render(this.name);
				this.playerControls.focus();
				this.playerControls.show();

				this.reset();
				this.play(this.video);

				this.rendered = true;
				promise.resolve();
			}, this);
		},

		/**
		 * @inheritdoc Scene#activate
		 */
		activate: function() {
			var scope = this;

			this.rendered = false;
			this.stoped = true;
			this.playerControls.hide();
		},

		/**
		 * @inheritdoc Scene#deactivate
		 */
		deactivate: function() {

		},

		/**
		 * Seek Process function on first play or advertising 
		 */
		firstSeekProcess: function() {
			if (this.seekPosition > 0) {
				this.seek(this.seekPosition);
			}

			this.seekPosition = -1;
			this.$el.removeClass('seek-process');
		},

		/**
		 * Player update progress bar
		 * 
		 * @private
		 */
		update: function() {
			var time = Player.currentTime,
				duration = Player.duration,
				state = Player.currentState,
				percentage = 0;

			if (time <= 100) return;

			if (this.$el.hasClass('seek-process')) {
				time = this.seekPosition;
			}

			percentage = 100 / duration * time;
			if (!this.$elCurrentTime) {
				return;
			}

			// TIME UPDATE
			if (Math.floor((duration / 1000) / 3600)) {
				this.$elCurrentTime.text(secondsToHours(time / 1000));
				this.$elDuration.text('-' + secondsToHours((duration - time) / 1000));
			} else {
				this.$elCurrentTime.text(secondsToMinutes(time / 1000));
				this.$elDuration.text('-' + secondsToMinutes((duration - time) / 1000));
			}

			// PROGRESS BAR UPDATE
			this.$elProgressBar.width(percentage + '%');
		},

		/**
		 * Reset Vedeo Player scene
		 * 
		 * @private
		 */
		reset: function() {
			this.$elProgressBar.width('0%');
			this.$elDuration.text('-00:00');
			this.$elCurrentTime.text('00:00');
		},

		/*
		*********************************************************
		* Player controls
		*********************************************************
		*/

		/**
		 * STOP video player
		 */
		stop: function() {
			this.stoped = true;
			Player.stop();
		},

		/**
		 * PLAY video player
		 * @param {String} url (video)
		 * @param {Number} position (ms)
		 */
		play: function(url) {
			var scope = this;

			// TROBBER
			App.throbber(false);
			this.stoped = false;

			// URL
			if (url) {
				this.video = url;
				Player.play(url);
			} else if (Player.currentState != Player.STATE_PLAYING) {
				Player.play();
			}

			// FULLSCREEN
			Player.fullscreen();
		},

		/**
		 * PAUSE video player
		 */
		pause: function() {
			if (Player.currentState === Player.STATE_PLAYING && Player.currentTime > 0) {
				Player.pause();
			}
		},

		/**
		 * FORWARD video player
		 */
		forward: function() {
			if (Player.currentState === Player.STATE_PLAYING && Player.currentTime > 0) {
				Player.forward();
			}
		},

		/**
		 * BACKWARD video player
		 */
		backward: function() {
			if (Player.currentState === Player.STATE_PLAYING && Player.currentTime > 0) {
				Player.backward();
			}
		},

		/**
		 * SEEK video player
		 * @param {Number} position (ms)
		 */
		seek: function(position) {
			Player.seek(position);
		},

		/*
		*********************************************************
		* Scene events
		*********************************************************
		*/

		/**
		 * @inheritdoc Scene#onLangChange
		 */
		onLangChange: function(firstTime, langCode) {
			I18n.translateHTML(this.$el);
		},

		/**
		 * @inheritdoc Scene#onReturn
		 */
		onReturn: function($el,e,stop) {
			if (stop) {stop()};
			this.stop();
			Router.goBack(null);
		},

		/**
		 * Handle other than usual key (i.e. color keys)
		 * @param {Number} keyCode Numeris code representation
		 * @param {Object} $el jQuery object
		 * @param {Event} event HTML event
		 */
		onOther: function(keyCode, $el, event) {
			if (keyCode == Control.key.YELLOW) {

			}
		},

		/**
		 * @inheritdoc Scene#onClick
		 */
		onClick: function($el,e,stop) {
			if (stop) {stop()};

			this.onEnter($el,e,stop);
			this.trigger('click', $el, event);
		},

		/**
		 * Event called after Enter is pressed
		 * @param {Object} $el jQuery object of element on enter was triggered
		 * @param {Object} e HTML event
		 * @param {Function} stop Stop function 
		 */
		onEnter: function($el,e,stop) {
			if (stop) {stop()};
		},
	});

	return Scene_Player;

})(Scene);