## What this tutorial is about

As part of my Bachelor-Thesis I created a proof of concept peer-to-peer videochat-application in 2013 using HTML5 and JavaScript. You can see and try [the latest version here](webrtc-prototype.felixhagspiel.de). By that time there was only few documentation about WebRTC and not much tutorials, so I had to do a lot of trial & error. Also helpful was the ['Getting Started with WebRTC'-article](http://www.html5rocks.com/en/tutorials/webrtc/basics/) from html5rocks.com and ['Muaz Khan's Website](https://www.webrtc-experiment.com/).

Here i want to show you how to setup a basic P2P-connection and how to pass video and audio through it. I will not use any libraries like jQuery or RTCMultiConnection so you see how it actually works. However, if you just want to create an videochat without learning the basics I suggest you use some libraries like those from [www.rtcmulticonnection.org](http://www.rtcmulticonnection.org/). There you can create an cross-browser app with a few lines of code.

First of all I want to describe the complications related with WebRTC.

- WebRTC is still in development, so not all features can be used in the "regular" browsers. For example to use the screen-sharing option of WebRTC you will need the Chrome Canary browser or you have to set a flag
- Because it is still in development, there are differences between the major browsers. Quality in audio and video may differ. You will have to try out different audio codecs and settings
- Signaling is not part of WebRTC. If you want to create an application which can be used by nearly everyone outside your local network you will have to exchange connection- and mediainformation. We will use websockets in this example to accomplish this.
- As WebRTC uses a peer-to-peer-connection you will have to connect every user with every user he wants to talk to. This can - based on the quality of audio and video - use a lot of bandwith and CPU
- WebRTC can be annoying - especially the errorhunt. But the more frustrated you get, the happier you will be when your friends videochat finally pops up in your browser


