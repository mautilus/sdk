/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Smart TV Alliance Player class
 * 
 * @author Mautilus s.r.o.
 * @class Device_Alliance_Player
 * @extends Player
 */

Device_Alliance_Player = (function(Events) {
    var Device_Alliance_Player = {
		/**
		 * @property {String} type MIME type, video/mp4 or application/oipfContentAccess for DRM
		 */
		type: 'video/mp4'
    };

    $.extend(true, Device_Alliance_Player, {
	/**
	 * @inheritdoc Player#initNative
	 */
	initNative: function() {
	    var scope = this;
	    
	    this.createPlayer(this.type);
	    
	    this.ticker = setInterval(function() {
		scope.tick();
	    }, 500);
	},
	/**
	 * @inheritdoc Player#deinitNative
	 */
	deinitNative: function() {
	    this.PLAYER.stop();
	    this.$el.remove();
	},
	/**
	 * @private
	 */
	createPlayer: function(type){
	    var scope = this;
	    
	    if(this.PLAYER){
		this.deinitNative();
	    }
	    
	    this.$el = $('<object id="ALLIANCEPLAYER" type="'+type+'"'
		    +'data="" width="'+this.config.width+'" height="'+this.config.height+'" style="width:'+this.config.width+'px;height:'+this.config.height+'px;'
		    +'top:'+this.config.top+'px;left:'+this.config.left+'px;'
		    +'position:absolute;z-index:0;visibility:hidden"></object>').appendTo('body');
	    this.PLAYER = this.$el[0];
	    
	    this.PLAYER.onPlayStateChange = function() {
		scope.onNativePlayStateChange();
	    };
	    
	    this.PLAYER.ondrmmessageresult = this.onNativeDrmMessageResult;
	    
	    this.type = type || null;
	},
	/**
	 * @private
	 */
	tick: function() {
	    var pos = 0;
	    
	    if (this.url && this.PLAYER && typeof this.PLAYER.playTime !== 'undefined') {
		if (!this.duration && this.PLAYER.playTime && this.PLAYER.playTime < 4294967295000) {
		    this.onDurationChange(this.PLAYER.playTime);
		}

		pos = Math.round(this.PLAYER.playPosition >> 0);

		if (pos && pos !== this.currentTime) {
		    this.onTimeUpdate(pos);
		}
	    }
	},
	/**
	 * @inheritdoc Player#native
	 */
	native: function(cmd, attrs) {
	    var url;
	    
	    if (cmd === 'play') {
		if (attrs && attrs.url) {
		    url = this.url;
		    
		    console.network('PLAYER', this.url);
		    
		    this.PLAYER.data = url;
		}
		
		this.PLAYER.play(1);
		
		if (attrs && attrs.position) {
		    this._seekOnPlay = attrs.position;
		}
		
	    } else if (cmd === 'pause') {
		return this.PLAYER.play(0);

	    } else if (cmd === 'stop') {
		return this.PLAYER.stop();

	    } else if (cmd === 'seek') {
		if(this.currentState === this.STATE_BUFFERING){
		    this._seekOnPlay = attrs.position;
		    
		}else{
		    this.PLAYER.seek(attrs.position);
		}
		
		return true;

	    }  else if (cmd === 'playbackSpeed') {
		return this.PLAYER.play(attrs.speed);

	    } else if (cmd === 'show') {
		this.width = attrs.width || this.width;
		this.height = attrs.height || this.height;
		this.top = (typeof attrs.top !== 'undefined' ? attrs.top : this.top);
		this.left = (typeof attrs.left !== 'undefined' ? attrs.left : this.left);

		this.$el.css('visibility', 'visible');

	    } else if (cmd === 'hide') {
		this.$el.css('visibility', 'hidden');
		
	    } else if (cmd === 'setVideoDimensions') {
		// @todo: implement setVideoDimensions

	    } else if (cmd === 'audioTrack') {
		// @todo: check if audioLanguage is implemented
		if(attrs.language){
		    this.PLAYER.audioLanguage = attrs.language;
		}
	    }
	},
	/**
	 * @private
	 */
	getESN: function() {
	    return Device.getUID()+'|60';
	},
	/**
	 * @private
	 */
	onNativePlayStateChange: function(){
	    var state = this.PLAYER.playState;
	    
	    if(state === 0){
		// stopped
		this.onEnd();
		
	    }else if(state === 1){
		// playing
		if (!this.duration && this.PLAYER.playTime) {
		    this.onDurationChange(this.PLAYER.playTime);
		}
		
		this.state(this.STATE_PLAYING);
		
		if(this._seekOnPlay){
		    this.PLAYER.seek(this._seekOnPlay);
		    this._seekOnPlay = 0;
		}
		
	    }else if(state === 2){
		// paused
		this.state(this.STATE_PAUSED);
		
	    }else if(state === 3 || state === 4){
		// connecting || buffering
		if(this.currentState !== this.STATE_BUFFERING){
		    this.state(this.STATE_BUFFERING);
		}
		
	    }else if(state === 5){
		// finished
		this.onEnd();
		
	    }else if(state === 6){
		// error
		this.onNativeError();
	    }
	},
	/**
	 * @private
	 */
	onNativeDrmMessageResult: function(msgId, resultMsg, resultCode){
	    if(resultCode > 0){
		this.onError(4, 'drm', null);
	    }
	},
	/**
	 * @private
	 */	
	onNativeError: function(){
	    var code = this.PLAYER.error, msg = 'Unknown Error';
	    
	    this.onError(code, msg);
	}
    });

    return Device_Alliance_Player;

})(Events);