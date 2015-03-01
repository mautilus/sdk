/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Dune HD Player class
 * 
 * @author Mautilus s.r.o.
 * @class Device_Dunehd_Player
 * @extends Player
 */

Device_Dunehd_Player = (function(Events) {
    var Device_Dunehd_Player = {
    };

    $.extend(true, Device_Dunehd_Player, {
	/**
	 * @inheritdoc Player#initNative
	 */
	initNative: function() {
	    var scope = this;
            this.volumeValue = -1;
	    this.API = Device.API;

	    this.ticker = setInterval(function() {
		scope.tick();
	    }, 500);
	},
	/**
	 * @inheritdoc Player#deinitNative
	 */
	deinitNative: function() {

	},
	/**
	 * @private
	 */
	tick: function() {
	    var pos = 0;
            //actual state
            if (this.API) {
                if (this.actualState != this.API.getPlaybackState()) {
                    this.onEvent(this.API.getPlaybackState());
                }
            }

            //livestream
            //hasLength doesn't work for livestreams, always returns false
            if (this.url && this.API && !this.API.hasLength() && this.state() == this.STATE_PLAYING) {


                pos = Math.round((this.API.getPositionInSeconds() >> 0) * 1000);


                if (!this.duration) {
                    console.log('duration change');
                    this.onDurationChange(9000 * 1000);
                    this.liveStream = true;
                }

                if (pos && pos !== this.currentTime) {
                    this.onTimeUpdate(pos);
                }
            }

            //VOD            
	    if (this.url && this.API && this.API.hasLength()) {
		if (!this.duration && this.API.hasLength()) {
                    this.onDurationChange(parseInt(this.API.getLengthInSeconds()) * 1000);
		    this.state(this.STATE_PLAYING);

		    if (this._showOnPlay) {
			this.native('show', this._showOnPlay);
			this._showOnPlay = null;
		    }

		    if (this._seekOnPlay) {
			this.native('seek', this._seekOnPlay);
			this._seekOnPlay = null;
		    }
		}

		pos = Math.round((this.API.getPositionInSeconds() >> 0) * 1000);

		if (pos && pos !== this.currentTime) {
                    this.onTimeUpdate(pos);
		}

		if (pos >= this.duration) {
                    this.onEnd();
		}

            } else if (this.duration && this.API && !this.API.hasLength() && !this.liveStream) {
                this.onEnd();
		this.duration = 0;
	    }
	},
	/**
	 * @inheritdoc Player#native
	 */
        onEvent: function (eventCode) {
            this.actualState = eventCode;

            switch (eventCode) {
                case 1: //stopped
                    break;
                case 2: //initializing
                    break;
                case 3: //playing
                    this.state(this.STATE_PLAYING);
                    break;
                case 4: //paused
                    break;
                case 5: //seeking
                    break;
                case 6: //buffering
                    this.state(this.STATE_BUFFERING);
                    break;
                case 7: //finished
                    console.log('finished');
                    break;
                case 8: //deinitializing
                    break;
            }
        },
	native: function(cmd, attrs) {
	    var url;

	    if (cmd === 'play') {
		if (attrs && attrs.url) {

                    url = this.url;
                    //console.network('can play url ', this.API.canPlayVideo(this.url));
		    console.network('PLAYER', this.url);

                    this.liveStream = false;

		    this.API.play(url);
		    this.state(this.STATE_BUFFERING);

		} else {
		    this.API.resume();
		}

		if (attrs && attrs.position) {
		    this._seekOnPlay = attrs.position;
		}

	    } else if (cmd === 'pause') {
		this.API.pause();
		this.state(this.STATE_PAUSED);

		return;

	    } else if (cmd === 'stop') {
		return this.API.stop();

	    } else if (cmd === 'seek') {
		if (this.currentState === this.STATE_BUFFERING) {
		    this._seekOnPlay = attrs.position;

		} else {
		    this.API.setPositionInSeconds(Math.round(attrs.position / 1000));
		    this.API.resume();
		}

		return true;

	    } else if (cmd === 'playbackSpeed') {
		var speed;

		if (attrs.speed === 1) {
		    speed = 256;

		} else if (attrs.speed === 4) {
		    speed = 1024;

		} else if (attrs.speed === 8) {
		    speed = 2048;

		} else if (attrs.speed === -4) {
		    speed = -1024;

		} else if (attrs.speed === -8) {
		    speed = -2048;

		} else {
		    speed = 256;
		}

		return this.API.setSpeed(speed);

	    } else if (cmd === 'show') {
		this.width = attrs.width || this.width;
		this.height = attrs.height || this.height;
		this.top = (typeof attrs.top !== 'undefined' ? attrs.top : this.top);
		this.left = (typeof attrs.left !== 'undefined' ? attrs.left : this.left);

		if (!this.duration) {
		    this._showOnPlay = attrs;

		} else {
		    this.API.setWindowRect(this.left, this.top, this.width, this.height);
		}

	    } else if (cmd === 'hide') {


	    } else if (cmd === 'setVideoDimensions') {
		// @todo: implement setVideoDimensions

	    } else if (cmd === 'audioTrack') {
		this.API.setAudioTrack(attrs.index || 0);
	    }
            else if (cmd == 'volume') {
                if (this.volumeValue == -1) //dune hd hasn't good implementation of getVolume, so we need to get this property only once
                    this.volumeValue = this.API.getVolume();

                console.log('actual volume ' + this.volumeValue);

                if (attrs.percent) {
                    percent = attrs.percent;
                    if (attrs.direction)
                        percent += attrs.direction;
                }
                else {
                    if (attrs.direction)
                        this.volumeValue += (attrs.direction);
                    else
                        this.volumeValue += 1;
                }

                if (this.volumeValue < 0)
                    this.volumeValue = 0;
                if (this.volumeValue > 100)
                    this.volumeValue = 100;

                this.API.setVolume(this.volumeValue);
                this.trigger('volume', this.volumeValue);
            }
            else if (cmd == 'mute') {

                var muteEnabled = this.API.isMuteEnabled();

                if (muteEnabled)
                    this.API.disableMute();
                else
                    this.API.enableMute();

                this.trigger('muteAudio', !muteEnabled);
            }
            else if (cmd == 'unmute') {
                this.API.disableMute();
                this.trigger('muteAudio', false);
            }

	},
	/**
	 * @private
	 */
	getESN: function() {
	    return Device.getUID() + '|60';
        },
        isMuteEnabled: function () {
            if (this.API)
                return this.API.isMuteEnabled();

            return false;
	}
    });

    return Device_Dunehd_Player;

})(Events);