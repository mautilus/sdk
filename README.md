Mautilus Smart TV SDK™
===========

### 1. Introduction

Smart TV applications become more and more popular around the globe. In some parts of the world, the number of people watching video on smart TVs significantly exceeds the number of people, who use mobile phones and tablets for video streaming due to expensive data tariffs, limitations of 3G and LTE connection bandwidth, and data caps.

Mautilus is the biggest design and development house for smart TV applications in Europe with a track of applications installed on all continents (except Antarctica:). We cooperate closely with all major TV, set-top box and game console manufacturers in order to produce the best quality applications for every platform our customers request.
 
Our applications are based on our open source and BSD licensed cross-platform Mautilus Smart TV SDK™. Using the SDK, the applications are developed only once, and thanks to drivers dynamically loaded from the SDK, they can be installed and run on any TV platform.
 
Applications based on Mautilus Smart TV SDK™ share the same source code across all platforms. That approach enormously reduces the effort required for the application development and simplifies the long-term maintenance.

### 2. SDK Documentation
[http://smarttv.mautilus.com/SDK](http://smarttv.mautilus.com/SDK)

### 3. Architecture
![Architecture](./img/Mautilus_SmartTV_SDK_Schema.png?raw=true)

### 4. Examples
                        
The SDK is delivered with two examples, which are showing use of the virtual keyboard, player and network communication. They are located in the `examples` subfolder. Both examples include packages, which could be immediatelly installed on Samsung and LG televisions.

### 5. Current version

Version: 2.1.292 

Release notes 2.1.292:

-	Samsung Tizen 2016 support added
-	LG webOS 3.x support added
-	Enhancement of SONY PlayStation 3/4 drivers
-	Hisense Vidaa 2015 and 2016 TV support added
-	Improved SDK Documentation (How to use DRM, VAST module guide)
-	The support for 4K playback on Samsung Tizen TVs added
-	Method Player.play() improved and extended
-	DRM support improved and simplified (method Player.setDRM())
-	Video player improvements and fixes
-	The VAST standard is supported in following scope:
    * VAST 3.0 is supported, see [specification](http://www.iab.com/guidelines/digital-video-ad-serving-template-vast-3-0/)
    * `InLine`, `Wrapper` (VAST servers could be chained) and `Error` elements are supported 
    * `Linear` ad types are supported
    * `Duration` and `MediaFiles` elements are supported for `Linear` ads
    * Only MPEG-4 progressive download ad video playback is supported
    * Skippable ads are supported (see chapter 2.3.2 of the VAST 3.0 specification) 
    * `Impression` element is supported
    * Tracking of following events is supported: `start`, `firstQuartile`, `midpoint`, `thirdQuartile`, `complete`, `skip` 
    * Support for tracking of multiple events and impressions


Release notes 2.0.230:

-	Instant On feature on Samsung Tizen 
-	Improved help generation
-	New example (3PlayersDemo)
-	Added support for LG NetCast Simple SmartTV 2016
-	Added support for LG webOS 3.x (2016)

Release notes 2.0.220:

-	Support for Panasonic Firefox devices (2015 models) added 
-	Support for Arris (KreaTV) added
-	Support for MPEG-DASH on Samsung Orsay models enhanced
-	Support for HbbTV 1.1.1 and 1.2.1 enhanced

Release notes 2.0.188:

-	Tizen support added
-	Widevine support in webOS Player added
-	PlayReady support in Tizen player added
-	Small improvements in developer console
-	Keyboard handling improvements
-	Keyboard support secondary button for special characters
-	Partial HbbTV support
-	Bug-fixing
-	RSS reader example optimized and new PlayerKeyboardInfo example added

Currently supported platforms:
                            
-	Samsung SmartTV/Orsay (2012, 2013, 2014, 2015)
-	Samsung Tizen (2015, 2016)
-	LG NetCast 3.x+ (2012, 2013, 2014, 2015)
-	LG Simple SmartTV 2016
-	LG webOS 1.x, 2.x, 3.x (2014, 2015, 2016)
-	Philips NetTV 4.x+ (2013, 2014, 2015)
-	Sony BRAVIA (2012, 2013, 2014, 2015)
-	Panasonic VIERA (2012, 2013, 2014)
-	Panasonic Firefox (2015)
-	VESTEL
-	DuneHD
-	Arris/KreaTV (limited support) 
-	HbbTV 1.1.1 and 1.2.1
-	Hisense Vidaa (2015, 2016)

### 6. Projects, which use the SDK
            
-	VOYO (CEE countries)
-	icflix (MENA)
-	ShowMax (70+ countries)
-	FILMIN (Spain, Mexico, Portugal)
-	Virtual Radio OE3 (Austria)
-	ChannelLive (USA)
-	Stream.cz (Czech Republic, Slovakia)
-	HBO.GO (Europe)
-	Telefonica O2TV (Czech Republic)
-	DittoTV (India)
-	Mobily mView (Saudi Arabia)
-	Sledovani.tv (Czech Republic, Slovakia) [link](http://www.samsung.com/cz/experience/tv/smarttv/aplikace-sledovanitv.html)
-	RFE/RL (Many countries) [link](http://www.broadbandtvnews.com/2014/09/22/rferl-to-go-worldwide-on-smart-tvs/)
-	4K Telekom (Slovakia) [link](http://www.broadbandtvnews.com/2016/08/05/4k-streaming-first-in-cee/)
-	Markíza HbbTV (Slovakia) [link](http://www.broadbandtvnews.com/2016/05/02/first-hbbtv-app-for-tv-markiza/)
-	HbbTV advertisements - Hyundai, Vodafone (Czech Republic) [link](http://www.broadbandtvnews.com/2016/01/27/key-hbbtv-ad-test-in-czech-republic/)
-	Frekvence 1 / Lagardère (Czech Republic, Slovakia)
-	Smart TV/HbbTV white-label
-	and many more ...

### 7. License

SDK is licensed under [New BSD License](https://en.wikipedia.org/wiki/BSD_licenses):

    Copyright (c) 2013, Mautilus, s.r.o. (www.mautilus.com)
    All rights reserved.
    
    Redistribution and use in source and binary forms, with or without modification, are permitted provided 
    that the following conditions are met:
    
    1. Redistributions of source code must retain the above copyright notice, this list of conditions and 
       the following disclaimer.
    
    2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions 
       and the following disclaimer in the documentation and/or other materials provided with the distribution.
    
    3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or 
       promote products derived from this software without specific prior written permission.
    
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED 
    WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A 
    PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR 
    ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED 
    TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) 
    HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING 
    NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
    POSSIBILITY OF SUCH DAMAGE.
    
### 8. Contact

- E-mail: [technical_support@mautilus.com](mailto:technical_support@mautilus.com)
- Web: [www.mautilus.com](http://www.mautilus.com)

Feel free to contact us if you have any technical question or if you are looking for smart TV or HbbTV application.