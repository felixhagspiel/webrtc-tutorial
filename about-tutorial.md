As part of my Bachelor-Thesis I created a proof of concept peer-to-peer videochat-application in 2013 using HTML5 and JavaScript. You can see and try [the latest version here](webrtc-prototype.felixhagspiel.de). By that time there was only few documentation about WebRTC and not much tutorials, so I had to do a lot of trial & error. Helpful links were the [Getting Started with WebRTC-article](http://www.html5rocks.com/en/tutorials/webrtc/basics/) from html5rocks.com and [Muaz Khan's Website](https://www.webrtc-experiment.com/).

## What this tutorial is about

Here I want to show you how to setup a basic P2P-connection and how to pass video and audio through it. I will not use any libraries like jQuery or RTCMultiConnection so you can see how WebRTC actually works. However, if you just want to create an videochat without learning the basics I suggest you use some libraries like those from [www.rtcmulticonnection.org](http://www.rtcmulticonnection.org/). Then you can create an cross-browser app with a few lines of code.

First of all I want to describe what the finished app will do:

- We will create an very simple real-time application where you can create a room
- Each room has a uniquie ID which can be used by another person to join your room
- Audio and Video will be transferred using DTLS encryption
- Only recent versions of Chrome and Opera are supported
- The code I wrote has alot of room for improvement
- It will NOT be an finished application
- It will NOT work all the time as expected, if you want to build an chatapplication for regular use you will have to put in some extra work
- It will only work when audio AND video is available

Secondly I want to explain the complications related with WebRTC:

- WebRTC is still in development, so not all features can be used in the "regular" browsers. For example, if you want to use the screen-sharing option of WebRTC you will need the Chrome Canary browser or you have to set a flag.
- Because it is still in development, there are differences between the major browsers. Also, audio- and video-quality may differ. You will have to try out different audio codecs and settings.
- Signaling is not part of WebRTC. If you want to create an application which can be used by nearly everyone outside your local network you will have to exchange connection- and mediainformation. We will use websockets in this example to accomplish this.
- As WebRTC uses a peer-to-peer-connection you will have to connect every user with every user he wants to talk to. This can - based on the quality of audio and video - use a lot of bandwith and CPU.
- WebRTC can be annoying - especially the hunt for errors. But the more frustrated you get, the happier you will be when your friend's videochat finally pops up in your browser.

### What you need for this example

- Current Chrome or Opera browser
- A terminal with SSH (you can use cmd.exe or [cygwin](http://www.cygwin.com/) for Windows)
- A node.js-Server which uses Websockets. If you have none I can recommend [www.uberspace.de](https://uberspace.de/). You will get your own virtual machine with SSH-access for 30 days free. After that you can choose how much you want to pay, the minimum is 1 Euro. My proof of concept also runs on uberspace and I will explain how to setup an account in the Server-part.
- Any texteditor. I am using [Sublime Text 2](http://www.sublimetext.com/2)
- Any FTP-Client which supports SFTP if you don't want to use the terminal too much (I am using [FileZilla](https://filezilla-project.org) )
- Some time and patience :)

For easier implementation and understanding I provide you with the (nearly) finished files and describe what each part of the code does.

### To test the application on one computer you can open one regular and one private tab in Chrome (press CTRL+N) to simulate two individual persons.

### [Download the ZIP](/webrtc-tutorial.zip)

The application exists of 3 files:

- server.js: The node-server which is responsible for signaling
- client.js: Our client-application which handles all the fancy WebRTC-stuff
- index.html: The view of our application


### Important: I am not an expert in WebRTC nor in Websecurity. I just wrote down what I learned while programming the WebRTC-App for my Bachelor-Thesis, so this tutorial is not to be understood as a complete and finished example!
### I will not be reliable for any problems or issues you have during creating or while using the application! If you want to build an commercial application or an application where security is highly important you should not use this tutorial!

Alright, let's get started!

