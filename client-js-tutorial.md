### Creating the Client Application

Now we come to the WebRTC part. As we have to communicate with the view via eventlisteners we have to take short looks at the `index.html`-file. Note also that I am talking about two different kind of connections in the following text - the websocket-connection to the server and the peer-to-peer-connection to your partner. I will not explain too much about the websocket-connection as it is self-explaining and similar to the things I explained when creating the server. What I will explain later on is the stuff that happens inside `.onmessage()`.
In this part the offerer is the one who wants to join a room and the answerer is the creator of the room.
Do as we did before and create a file `client.js` inside your `/public`-folder. At this point, the application should already work.

So now I will explain what happens when someone clicks on the `join room`-button (we assume that someone already created a room as described in the server-part of this tutorial).

First, we try to get the audio- and videostream of the person and add it to our `ownVideo`-element. This happens in the `index.html`:

	// get media-stream
	var success = function(myStream){
		if(ownVideo.mozSrcObject !== undefined) {
			ownVideo.mozSrcObject = myStream;
		}
		else {
			ownVideo.src = URL.createObjectURL(myStream);
		}
		ownVideo.play();
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
Now we add our medai-stream to the connection (it is important to that at this point and not after the connection was established):

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
        // add icecandidates immediately if not Firefox & if remoteDescription is set
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

Then we are finished on the offerer's side for now. On the answerer side (who is the creator of the room in this case) we receive the message containing the SDP. We save the SDP and exectue `createAnswer()`, which looks a lot like the `createOffer()`-function before:

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

And now we are back on the offerer`s side. Here we store the SDP and call the function `handshakeDone()`:

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

