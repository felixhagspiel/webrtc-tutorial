# WebRTC-Tutorial
---

As part of my Bachelor-Thesis I created a proof of concept peer-to-peer videochat-application in 2013 using HTML5 and JavaScript. You can see and try [the latest version here](http://webrtc-prototype.felixhagspiel.de). By that time there was only few documentation about WebRTC and not much tutorials, so I had to do a lot of trial & error. Helpful links were [Getting Started with WebRTC-article](http://www.html5rocks.com/en/tutorials/webrtc/basics/) from html5rocks.com and [Muaz Khan's Website](https://www.webrtc-experiment.com/).

## What this tutorial is about

In this tutorial I want to show you how to setup a basic P2P-connection and how to pass video and audio through it. By the end of this tutorial you will (hopefully ;) ) understand how the signaling works and how to use WebRTC to build your own realtime applications. I try to do so by not using any libraries like jQuery or RTCMultiConnection. However, if you just want to create an videochat without learning the basics I suggest you use some libraries like those from [www.rtcmulticonnection.org](http://www.rtcmulticonnection.org/). Then you can create an cross-browser app with a few lines of code.

First of all I want to describe what the finished app will do:

- We will create an very simple real-time application where you can create a room
- Each room has a uniquie ID which can be used by another person to join your room
- Audio and Video will be transferred using DTLS encryption
- Only recent versions of Chrome and Opera are supported
- The code I wrote has alot of room for improvement
- It will NOT be an finished application
- It will NOT work all the time as expected, if you want to build an chatapplication for regular use you will have to put in some extra work
- It will only work when audio AND video is available (this means every user needs a microphone and webcam)

Secondly I want to explain some general problems related with WebRTC:

- WebRTC is still in development, so not all features can be used in the "regular" browsers. For example, if you want to use the screen-sharing option of WebRTC you will need the Chrome Canary browser or you have to set a flag.
- Because it is still in development, there are differences between the major browsers. Also, audio- and video-quality may differ. You will have to try out different audio codecs and settings.
- Signaling is not part of WebRTC. If you want to create an application which can be used by everyone outside your local network you will have to exchange connection- and mediainformation. We will use websockets in this example to accomplish this.
- As WebRTC uses a peer-to-peer-connection you will have to connect every user with every user he wants to talk to. This can - based on the quality of audio and video - use a lot of bandwith and CPU.
- WebRTC can be annoying - especially the error-hunt. But the more frustrated you get, the happier you will be when your friend's videochat finally pops up in your browser :)

### What you need for this example

- Current Chrome or Opera browser
- A terminal with SSH (you can use cmd.exe or [cygwin](http://www.cygwin.com/) for Windows)
- A node.js-Server which uses Websockets. If you have none I can recommend [www.uberspace.de](https://uberspace.de/). You will get your own virtual machine with SSH-access for 30 days for no charge. After that you can choose how much you want to pay, the minimum is 1 Euro. This tutorial is using uberspace and I will explain you how to set up your server.
- Any texteditor. I am using [Sublime Text 2](http://www.sublimetext.com/2)
- If you don't want to use the terminal too much you will need an FTP-client to upload files and create the folders. I am using [FileZilla](https://filezilla-project.org)
- Some time and patience :)

For easier implementation and better understanding I provide you with the (nearly) finished files and describe what each part of the code does.

### Note: To test the application on one computer you can open one regular and one private tab in Chrome (press CTRL+N) to simulate two individual persons.

The application exists of 3 files:

- `private/server.js`: The node-server which is responsible for signaling
- `public/client.js`: Our client-application which handles all the fancy WebRTC-stuff
- `public/index.html`: The view of our application

The ZIP-File also contains the turoial's markdown-files.

### [Download the ZIP](http://blog.felixhagspiel.de/webrtc-tutorial.zip)

### [View on Github](https://github.com/felixhagspiel/webrtc-tutorial/tree/development)

### Important: I am not an expert in WebRTC nor in Websecurity. I just wrote down what I learned while programming the WebRTC-App for my Bachelor-Thesis, so this tutorial is not to be understood as a complete and finished example!
### I will not be reliable for any problems or issues you have during creating or while using the application! If you want to build an commercial application or an application where security is highly important you should not use this tutorial!

Alright, let's get started!

# The Server
---

### Setting up a WebSocket Server for Signaling using uberspace.de

If you want to use uberspace.de you will have to ask them to open up a port for you so you can use websockets. Usually they respond in 1-2 days max., for this example it took them half an hour to reply (a Monday at 4pm). Where you have to write the email to is described below. If you do not want to wait you have to use another nodehosting service, a [list can be found here](https://github.com/joyent/node/wiki/Node-Hosting).

If you still want to use uberspace, go to [uberspace.de/register](https://uberspace.de/register) and enter a name below 'DEIN UBERSPACE'. On the next page select a password right below where it says 'ICH WÄHLE LIEBER EIN PASSWORT' (you will need a strong password, just keep typing until the text gets green). After that your account is created. Hurray! On the following page you will find your account-related email address, in my case it is webrtcer@vulpecula.uberspace.de. `vulpecula` is the name of the server where your VM is hosted, you will need that a lot so better write it down (your password also, of course).
Then login to webmail via via `http://webmail.yourvmservername.uberspace.de`, send an email to `hallo@uberspace.de` and kindly ask them to open up a port between 61000 and 65535 so you can use websockets (you can write in English).

Next you will have to set your SSH-password (or SSH-key, if you prefer). Click on 'ZUGÄNGE' and enter a password where it says '… via Passwort' or add an SSH-Key where it says '… via SSH-Schlüssel'.

Once you have done that open up your terminal and SSH into your VM:

	ssh yourusername@sourvmservername.uberspace.de

Then check if node and npm is installed by typing these commands (if they are installed you should see a version number on the console):

`node -v`

`npm -v`

Then we have to create a few new folders where we can store our project files (of course you can do that also by using an FTP-Client and just upload the package):

`mkdir /var/www/virtual/yourusername/webrtc`

`cd /var/www/virtual/yourusername/webrtc`

`mkdir public`

`mkdir private`

`/public` is the folder where we store all the HTML, JS and CSS. In `/private` we will store the nodeserver file. It is important that the private-folder is outside your /html-folder! Now go into the private-folder, create a file called `server.js` and open it inside the nano-editor in the terminal:

`cd private`

`touch server.js`

`nano server.js`

Then copy all the code from the server.js-file you downloaded before and paste it inside the terminal.

Now exit the editor (you can exit it by pressing `CTRL+X` on Windows, but it should show you the shortcut to exit at the bottom of your terminal), it will ask you then to save the file, press `y` and then hit `enter`.

Now lets install the server-dependencies:

`npm install websocket`

`npm install uuid`

The uuid-module is a random number generator and will be used to create your room's ID.

Now let's try to start the server:

`node server.js`

If you see something like this:

`Mon Feb 17 2014 16:47:39 GMT+0100 (CET) Server is listening on port 61234`

your server is up and running. For now we will start it manually, which means that you have to restart it everytime it crashes or you logout, which is better for debugging purposes. Later you can read [here](https://uberspace.de/dokuwiki/development:nodejs) on how to start a daemon which automatically starts the server.

#### Note: As node.js is written in JavaScript, the whole server will be down for all users when an error occurs, even if the error happens just on one single connection!

### Now let's have a look at the code

I will not describe all the things I already mentioned in the comments. I will rather give a look how the message-flow works.

First you have to replace the portnumber with the one assigned by uberspace:

	var webSocketsServerPort = 61234,

The following function is called each time someone connects to the server

	wsServer.on('request', function(request) { ... });

It stays opened until the connection is closed. Inside it you can see

	connection.on('message', function(message) { ... });

which will be executed each time we call the connection.send()-function on the client side. Inside it we try to parse the message to JSON and handle the different kind of message-types. The different kinds relevant for the server are `roomCreated` and `offer`. If the type does not match those types the message will be delivered to the partner who is inside the same room.

### createRoom

This is the first message to the server before a room can be joined. This is executed whenever someone presses the "create room"-button.
First, a unique ID is created which will identify the room:

	var roomId = uuid.v1();

Then we store the current connection as `creatorConnection` in the `rooms`-object and set the `partnerConnection` to false:

	rooms[roomId] = {
		creatorConnection: connection,
		partnerConnection: false,
	}

Next we create the response-message and send it as JSON to the creator of the room:

	var data = {
		type: 'roomCreated',
		payload: roomId
	};
	return send(rooms[roomId].creatorConnection, data);

#### Note: As this is a full-duplex permanent connection, we do not have to wait for request from the user like you have to when using regular HTTP. We can send messages to the user whenever we want. This is one of the big advantages of websockets.

And voilà, the room is created.

Now let's see what happens when someone wants to join our room.

### offer

When a user wants to enter our room, he has to have the room-id first, so you have to pass it to him somehow (IM, email, phone, etc ...). Of course you could show all available room-ID's on the login-page, but then everyone could join your room, not just your friend.
So after he clicked on the `join room`-button, the server receives a message with the type `offer`. It checks then if a room by that ID is present and if the partnerConnection is empty. If not it will send an error to the user. If it is free the connection will be stored as partnerConnection inside the rooms-object:

	if(rooms[data.roomId].partnerConnection) {
		// send error to user
		var data = {
			type: 'error',
			payload: 'room is already full'
		};
		return send(connection, data);
	}
	// this refers to the current connection-object of the user
	rooms[data.roomId].partnerConnection = this;

Because the rooms-object is above the scope of the `wsServer.on('request', function(request) { ... });`-function, every connected user can access it. This makes it possible to share connection data and messages between the users. This means we can inform the creator of the room that someone wants to join:

	// we just pass on the data-object we received from the partner who wants to join
	return send(rooms[data.roomId].creatorConnection, data);

### default

After that we have both creator- and partner-connection. Now each message will be just transferred to the opposite member of the room without any special action taken:

	default:
		if(this === rooms[data.roomId].partnerConnection) {
			return send(rooms[data.roomId].creatorConnection, data);
		}
		return send(rooms[data.roomId].partnerConnection, data);
	break;

That's basically everything we need. Of course you can do a lot more error-handling and store more userdata, but for this simple example it is enough.

# The View
---

In this part we create the view which is represented by the `index.html`-file inside our `/public`-folder. I just added some basic CSS-styling. You can style it as you wish, of course. Just be aware that this is going to be a single-page application, so we have to hide/show some parts of it via JavaScript (I accomplish this by adding and removing the `active`-class via JavaScript).

As before I will not explain the parts of the index-file which I think are self-explaining or which have already been commented.

The two `video`-elements will represent the video- and audiostreams once the connection is established. Note that the `ownVideo`-element is muted. This is important because otherwise you will hear your own voice all the time. The autoplay-parameter ensures that the video plays even if we do not call the `.play()`-function ourself (at least in Chrome, in FF you still have to to that).
Now to the JavaScript - here we create a new WebRTC-object which we will define in the client.js-file later (This is explained in the client-part of this tutorial). Then we execute the `connectToSocket()`-function which establishes the connection to the websocket-server (needless to say that you have to put in your server-name and the related port):

	var WebRTC = new WebRTC();
	WebRTC.connectToSocket('ws://yourservername.uberspace.de:63949');

Then we add a custom eventlistener which is used to communicate between the view and the WebRTC-object (In the next part of the tutorial you will see where and when it is fired):

	document.addEventListener('socketEvent', function(socketEvent){ ... });

Next we add the clickhandlers for the "create room"- and "join room"-button. When clicked, we try to get the user's media-stream of microphone and camera and add it as source to the `ownVideo`-element. This is done by the `success`-function which will be executed if you click "allow" on the browser's request for permission to access your microphone and camera. After that we call the `createRoom()`- respectively `joinRoom()`-function of the WebRTC-object:

	// get media-stream
	var success = function(myStream){
		// set videostream on ownVideo-object
        ownVideo.src = URL.createObjectURL(myStream);
		// join a room
		WebRTC.joinRoom(roomidInput.value);
	};
	WebRTC.getMedia({audio: true, video: true},success);

Now we have to create the file on the server. As before, you can also use your FTP-Client instead.

`cd /var/www/virtual/yourusername/webrtc/public`

`touch index.html`

`nano index.html`

Now we paste all content from the downloaded index.html-file inside the terminal and save it like we did when creating the server.js-file.
As we have no domain associated with our VM yet and the public-folder is outside the html-folder, we have to create a symlink to be able to access it from outside:

`ln -s /var/www/virtual/yourusername/webrtc/public /var/www/virtual/yourusername/yourusername.yourservername.uberspace.de`

If you enter then `http://yourusername.yourservername.uberspace.de` inside your Browser, you should see the login-screen. If not there is most likely something wrong with the symlink. If you have a 'www.' infront of the domainname it will not work as you have to create a second symlink for that.

# The Client
---

Now we come to the WebRTC part. As we have to communicate with the view via eventlisteners we have to take short looks at the `index.html`-file. Note also that I am talking about two different kind of connections in the following text - the websocket-connection to the server and the peer-to-peer-connection to your partner. I will not explain too much about the websocket-connection as it is self-explaining and similar to the things I explained when creating the server. What I will explain later on is the stuff that happens inside `.onmessage()`.
In this part the offerer is the one who wants to join a room and the answerer is the creator of the room.
Do as we did before and create a file `client.js` inside your `/public`-folder. At this point, the application should already work.

So now I will explain what happens when someone clicks on the `join room`-button (we assume that someone already created a room as described in the server-part of this tutorial).

### Offer

First, we try to get the audio- and videostream of the person and add it to our `ownVideo`-element. This happens in the `index.html`:

	// get media-stream
	var success = function(myStream){
		// set videostream on ownVideo-object
        ownVideo.src = URL.createObjectURL(myStream);
		// join a room
		WebRTC.joinRoom(roomidInput.value);
	};
	WebRTC.getMedia({audio: true, video: true},success);

Inside the `client.js`-file the function `.getMedia()` is called. We pass some constraints to the function as well as a success-callback. The constraints tell the browser what it should be asking for, in this case for audio AND video. There is an [webapplication on chromium.org](http://src.chromium.org/svn/trunk/src/chrome/test/data/webrtc/manual/constraints.html) which generates the constraints based on your input. You can [read more about constraints here](http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00#page-4).

	// set default constraints if none passed
	if(!constraints) {
		constraints = {audio: true, video: true};
	}

After some prefix-checking for the different browsers we call the real `getUserMedia()` which receives the contraints and a function for success and for fail (Note: This is not the success function we passed from the `index.html`. That function will be called inside the `getUserMedia()`-function). At this point the browser will ask you for permission to access the microphone and camera. If you can provide a secured connection the user of your site is able to save the permission, otherwise he will be asked every time. If you hit allow, the first callback receives the stream which we save in the `myStream`-variable for later usage:

	// call getUserMedia
	getUserMedia(constraints, function (stream) {
		// set stream
		myStream = stream;

Okay, now we got the mediastream and saved it. Next we execute the `success()`-function we declared inside the view and pass the stream:

	// call success-callback
	if(success) {
		success(myStream);
	}

The last function passed to `getUserMedia()` is a fail-callback. There we just print out the error if something went wrong or the user denied the access. [Here is the full documentation of getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator.getUserMedia).
Inside the `success()`-function (you have to look at your view again) we set the stream as source-attribute of the `ownVideo`-element which should immediately play the video because we set the `autoplay`-attribute on the video-element:

	// get media-stream
	var success = function(myStream){
		// set videostream on ownVideo-object
        ownVideo.src = URL.createObjectURL(myStream);
		// join a room
		WebRTC.joinRoom(roomidInput.value);
	};

The `URL.createObjectURL(myStream)` creates a URL out of the stream-object, representing your local media stream. [Here you can read more about it](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL).

For an working WebRTC-connection we need to create an offer, then answer the offer and then complete the handshake. So the `.joinRoom()`-function saves the room-ID and then executes 'createOffer()':

	// connect to a room
	this.joinRoom = function(id){
		roomId = id;
		createOffer();
	};

In `createOffer()` we create a new peerConnection-object by passing a STUN-server-URL (which is declared at the top of `client.js`):

	// create new peer-object
    if( typeof(RTCPeerConnection) === 'function') {
        peerConnection = new RTCPeerConnection(peerConfig);
    }
    else if( typeof(webkitRTCPeerConnection) === 'function') {
        peerConnection = new webkitRTCPeerConnection(peerConfig);
    }

The STUN-server is needed to setup the peer-connection because of NAT (if you want to know more about why we need STUN-server [read this article](http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/?redirect_from_locale=de)). In this case we use one of Google's STUN-servers.
Now we add our media-stream to the connection (it is important to do that at this point and not after the connection was established):

	// add media-stream to peerconnection
	peerConnection.addStream(myStream);

Then we declare some basic functions which handle different kind of events. Lets start with `onaddstream()` which will be fired when we receive the videostream of the other guy. In this example we create a new custom event and dispatch it. We use this to communicate with the view, because we have to set the stream we just received to the `otherVideo`-element:

	// other side added stream to peerconnection
	peerConnection.onaddstream = function(e) {
		console.log('stream added');
		otherStream = e.stream;
		// fire event
		socketEvent.eventType = 'streamAdded';
		document.dispatchEvent(socketEvent);
	};

You can see what happens next when you take a look at the switch-case-statement inside the 'socketEvent'-listener in the `index.html`.
Note: This procedure is the same for `createAnser()` and `createOffer()`. You can put it in an extra function to reduce code, but I wrote it each time for better understanding.

Now we will handle ICE-candidates. ICE-candidates are used to exchange network information like adresses and ports. The function 'onicecandidate()' is called asynchronous when there are own candidates available. So when we set up the offer, there will be some candidates created immediately. What we have to do is to send each of those candidates to the creator of the room where they are stored until we need them:

	// we receive our icecandidates and send them to the other guy
	peerConnection.onicecandidate = function(icecandidate) {
		console.log('icecandidate send to room '+roomId);
		// send candidates to other guy
		var data = {
			type: 'iceCandidate',
			roomId: roomId,
			payload: icecandidate
		};
		sendToServer(data);
	};

The server passes the message to the creator of the room, who then saves it by executing `setIceCandidate()` inside the switch-case-statement of the websocket's `.onmessage()`-function. It is important that we do not add the candidates to the connection until we received the session-descrition (more to that later) of the other guy and added it to the RTCPeerConnection-object! So if the variable `otherSDP` is false, we store the candidates in an array. Otherwise we directly add it to the connection:

	// set or save the icecandidates
    var setIceCandidates = function(iceCandidate) {
    	// push icecandidate to array if no SDP of other guys is available
        if(!otherSDP) {
            othersCandidates.push(iceCandidate);
        }
        // add icecandidates immediately if remoteDescription is set
        if(otherSDP &&
                iceCandidate.candidate &&
                iceCandidate.candidate !== null ) {
            peerConnection.addIceCandidate(createRTCIceCandidate(iceCandidate.candidate));
        }
    };

Now we have set all eventlisteners on the offerer's side and can create the actual offer. When we call `.createOffer()` on the peer-connection we receive a session-description-object which we set as the local description on the peer-connection. After that we send a message to the room-creator telling him that we want to establish a connection with him. The payload of the message is our SDP, which he needs to accept the offer.

	// we actually create the offer
	peerConnection.createOffer(function(SDP){
		// set our SDP as local description
		peerConnection.setLocalDescription(mySDP);
		console.log('sending offer to: '+roomId);
		// send SDP to other guy
		var data = {
			type: 'offer',
			roomId: roomId,
			payload: SDP
		};
		sendToServer(data);
	});

Then we are finished on the offerer's side for now.

### Answer

On the answerer side (who is the creator of the room in this case) we receive the message containing the SDP. We save the SDP and exectue `createAnswer()`, which looks a lot like the `createOffer()`-function before:

	// other guy wants to join our room
	case 'offer':
		console.log('offer received, answer will be created');
		otherSDP = data.payload;
		createAnswer();
	break;

The next steps are nearly the same like before (the `onaddstream()`- and `onicecandidate()`-functions are exactly the same like those before), except that we have to set the other guy's SDP as remote-description of the peer-connection right after we added our stream:

   // create an answer for an received offer
    var createAnswer = function() {
    	// create new peer-object
        if( typeof(RTCPeerConnection) === 'function') {
            peerConnection = new RTCPeerConnection(peerConfig);
        }
        else if( typeof(webkitRTCPeerConnection) === 'function') {
            peerConnection = new webkitRTCPeerConnection(peerConfig);
        }

    	// add media-stream to peerconnection
    	peerConnection.addStream(myStream);

    	// set remote-description
    	peerConnection.setRemoteDescription(createRTCSessionDescription(otherSDP));
    	...

The function `createRTCSessionDescription()` is used to handle prefixes.
Now we have an endpoint for our peer-connection we can connect to and we can create the actual answer. First we have to set our SDP as local description:

	// we create the answer
	peerConnection.createAnswer(function(SDP){
		// set our SDP as local description
		peerConnection.setLocalDescription(SDP);

And now comes the point where we add the ICE-candidates (which we have received and stored asynchronous before) to the connection:

	// add other guy's ice-candidates to connection
    for (var i = 0; i < othersCandidates.length; i++) {
        if (othersCandidates[i].candidate) {
            peerConnection.addIceCandidate(ceateRTCIceCandidate(othersCandidates[i].candidate));
        }
    }

The function `ceateRTCIceCandidate()` handles prefixes and creates a new RTCIceCandidate-Object and returns it. Then we can send a message to offerer containing our SDP:

	// send SDP to other guy
	var data = {
		type: 'answer',
		roomId: roomId,
		payload: SDP
	};
	sendToServer(data);

### Finish the handshake

And now we are back on the offerer's side. Here we store the SDP and call the function `handshakeDone()`:

	// we receive the answer
	case 'answer':
		console.log('answer received, connection will be established');
		otherSDP = data.payload;
		handshakeDone();
	break;

Inside the 'handshakeDone()'-function we set the SDP of the answerer as remote description and add his ICE-candidates to the peer-connection:

    peerConnection.setRemoteDescription(createRTCSessionDescription(otherSDP));
	// add other guy's ice-candidates to connection
    for (var i = 0; i < othersCandidates.length; i++) {
        if (othersCandidates[i].candidate) {
            peerConnection.addIceCandidate(ceateRTCIceCandidate(othersCandidates[i].candidate));
        }
    }

Now the peer-connection should be up and running and the `.onaddstream()`-eventhandlers should also have been called. But we cannot see anything yet on the offerer's side because the room-section is hidden. That's why need to fire an event which tells the view that the connection is ready:

	// fire event
	socketEvent.eventType = 'p2pConnectionReady';
	document.dispatchEvent(socketEvent);

Tadaaaaaa! Now you should see and hear your partner.

Of course there are a ton of things left to be improved (first of all cross-browser-support), but I hope I could give you a first look inside WebRTC. Now go and build some awesome applications! :)

If you find something not understandable or if you have some ideas on how to improve this tutorial, please write me an email to info@felixhagspiel.de or leave a comment. Thank you!

