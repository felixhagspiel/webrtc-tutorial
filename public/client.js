function WebRTC() {

	/*
	* 	Private Attributes
	*/
	var that = this;
	var connection = false;
	var roomId = false; // here is the room-ID stored
	var myStream= false; // my media-stream
	var otherStream= false; // other guy`s media-stream
	var peerConnection = false; // RTCPeerconnection
    var peerConfig =   {iceServers: [{url: !navigator.mozGetUserMedia ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'}] };  // set Google Stunserver
    var peerConstraints = {"optional": [{"DtlsSrtpKeyAgreement": true}]}; // set DTLS encrpytion
    var mySDP = false; // my sessiondescription protocol
    var otherSDP = false;
    var othersCandidates = []; // other guy's icecandidates

	// via this element we will send events to the view
	var socketEvent = document.createEvent('Event');
    	socketEvent.initEvent('socketEvent',true,true);

	/*
	* 	Private Methods
	*/

	// encode to JSON and send data to server
	var sendToServer = function(data) {
		try {
			connection.send(JSON.stringify(data));
			return true;
		} catch(e) {
			console.log('There is no connection to the websocket server');
			return false;
		}
	};

	// create a peerconnection
    var createRTCPeerConnection = function(config){
        var peerConn;
        if( typeof(RTCPeerConnection) === 'function') {
            peerConn = new RTCPeerConnection(config);
        }
        else if( typeof(webkitRTCPeerConnection) === 'function') {
            peerConn = new webkitRTCPeerConnection(config);
        }
        else if(typeof(mozRTCPeerConnection) === 'function' ) {
            peerConn = new mozRTCPeerConnection(config);
        }
        return peerConn;
    };

    // create ice-candidate
    var createRTCIceCandidate = function(candidate){
            var ice;
            if( typeof(webkitRTCIceCandidate) === 'function') {
                ice = new webkitRTCIceCandidate(candidate);
            }
            else if(typeof(mozRTCIceCandidate) === 'function' ) {
                ice = new mozRTCIceCandidate(candidate);
            }
            else if( typeof(RTCIceCandidate) === 'function') {
                ice = new RTCIceCandidate(candidate);
            }
            return ice;
    };

    // create an session description object
	var createRTCSessionDescription = function(sdp){
	    var newSdp;
	    if( typeof(RTCSessionDescription) === 'function') {
	        newSdp = new RTCSessionDescription(sdp);
	    }
	    else if( typeof(webkitRTCSessionDescription) === 'function') {
	        newSdp = new webkitRTCSessionDescription(sdp);
	    }
	    else if(typeof(mozRTCSessionDescription) === 'function' ) {
	        newSdp = new mozRTCSessionDescription(sdp);
	    }
	    return newSdp;
	};

	// generate URL-blob
    var createObjectURL = function(stream){
            var createURL = URL.createObjectURL || webkitURL.createObjectURL || mozURL.createObjectURL;
            return createURL(stream);
    };

    // set or save the icecandidates
    var setIceCandidates = function(iceCandidate) {
    	console.log(iceCandidate);
    	// push icecandidate to array if no SDP of other guys is available
        if(!otherSDP) {
            othersCandidates.push(iceCandidate);
        }
        // add icecandidates immediately if not Firefox & if remoteDescription is set
        if(!navigator.mozGetUserMedia && otherSDP &&
                iceCandidate.candidate &&
                iceCandidate.candidate !== null ) {
            peerConnection.addIceCandidate(createRTCIceCandidate(iceCandidate.candidate));
        }
    };

    // exchange of connection info is done, set SDP and ice-candidates
    var handshakeDone = function(){
        peerConnection.setRemoteDescription(createRTCSessionDescription(otherSDP));
		// add other guy's ice-candidates to connection
        for (var i = 0; i < othersCandidates.length; i++) {
            if (othersCandidates[i].candidate) {
                peerConnection.addIceCandidate(ceateRTCIceCandidate(othersCandidates[i].candidate));
            }
        }
		// fire event
		socketEvent.eventType = 'p2pConnectionReady';
		document.dispatchEvent(socketEvent);
    };

    // create an offer for an peerconnection
    var createOffer = function() {
    	// create new peer-object
    	peerConnection = createRTCPeerConnection(peerConfig);

    	// add media-stream to peerconnection
    	peerConnection.addStream(myStream);

    	// other side added stream to peerconnection
    	peerConnection.onaddstream = function(e) {
    		console.log('stream added');
    		otherStream = e.stream;
			// fire event
			socketEvent.eventType = 'streamAdded';
			document.dispatchEvent(socketEvent);
    	};

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

    	// we actually create the offer
    	peerConnection.createOffer(function(SDP){
    		// save the SDP we receive from STUN-servers
    		mySDP = SDP;

    		// set our SDP as local description
    		peerConnection.setLocalDescription(mySDP);
    		console.log('sending offer to: '+roomId);
    		// send SDP to other guy
			var data = {
				type: 'offer',
				roomId: roomId,
				payload: SDP
			};
			console.log(data);
			sendToServer(data);
    	});
    };

    // create an answer for an received offer
    var createAnswer = function() {
    	// create new peer-object
    	peerConnection = createRTCPeerConnection(peerConfig);

    	// add media-stream to peerconnection
    	peerConnection.addStream(myStream);

    	// set remote-description
    	peerConnection.setRemoteDescription(createRTCSessionDescription(otherSDP));

    	// other side added stream to peerconnection
    	peerConnection.onaddstream = function(e) {
    		console.log('stream added');
    		otherStream = e.stream;
			// fire event
			socketEvent.eventType = 'streamAdded';
			document.dispatchEvent(socketEvent);
    	};

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

    	// we create the answer
    	peerConnection.createAnswer(function(SDP){
    		// save the SDP we receive from STUN-servers
    		mySDP = SDP;

    		// set our SDP as local description
    		peerConnection.setLocalDescription(mySDP);

    		// add other guy's ice-candidates to connection
            for (var i = 0; i < othersCandidates.length; i++) {
                if (othersCandidates[i].candidate) {
                    peerConnection.addIceCandidate(ceateRTCIceCandidate(othersCandidates[i].candidate));
                }
            }

    		// send SDP to other guy
			var data = {
				type: 'answer',
				roomId: roomId,
				payload: SDP
			};
			sendToServer(data);
    	});
    };

	/*
	* 	Public Methods
	*/

	// this function handles all the websocket-stuff
	this.connectToSocket = function(wsUrl){
		// open the websocket
		connection = new WebSocket(wsUrl);

		// connection was successful
		connection.onopen = function(event){
			console.log((new Date())+' Connection successfully established');
		};

		// connection couldn't be established
		connection.onerror = function(error){
			console.log((new Date())+' WebSocket connection error: ');
			console.log(error);
		};

		// connection was closed
		connection.onclose = function(event){
			console.log((new Date())+' Connection was closed');
		};

		// this function is called whenever the server sends some data
		connection.onmessage = function(message){
            try {
                var data = JSON.parse(message.data);
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON or something else went wrong.');
                console.log(message);
                return;
            }
            console.log(data);
            switch( data.type ) {
            	// the server has created a room and returns the room-ID
            	case 'roomCreated':
            		// set room
            		roomId = data.payload;

            		// fire event
            		socketEvent.eventType = 'roomCreated';
            		document.dispatchEvent(socketEvent);
            	break;
            	// other guy wants to join room
            	case 'offer':
            		console.log('offer received, answer will be created');
            		otherSDP = data.payload;
            		createAnswer();
            	break;
            	//
            	case 'answer':
            		console.log('answer received, connection will be established');
            		otherSDP = data.payload;
            		handshakeDone();
            	break;
            	// we receive icecandidates from the other guy
            	case 'iceCandidate':
            		setIceCandidates(data.payload);
            	break;
            	default:
            		console.log('def');
            	break;
            }
		};
	};

	this.getRoomId = function(){
		return roomId;
	};

	// this function tells the server to create a new room
	this.createRoom = function() {
		// create data-object
		var data = {
			type: 'createRoom',
			payload: false
		};
		// send data-object to server
		return sendToServer(data);
	};
	// connect to a room
	this.joinRoom = function(id){
		roomId = id;
		createOffer();
	};
	// get the video & audio-stream
	this.getMedia = function(constraints,success,fail) {
		// set default constraints
		if(!constraints) {
			constraints = {audio: true, video: true};
		}

		// check browsersupport
        if(navigator.getUserMedia) {
        	console.log('prefix-less');
            getUserMedia = navigator.getUserMedia.bind(navigator);
        }
        else if(navigator.webkitGetUserMedia) {
        	console.log('webkit');
            getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
        }
        else if(navigator.mozGetUserMedia) {
        	console.log('mozilla');
            getUserMedia = navigator.mozGetUserMedia.bind(navigator);
        }
            // call getUserMedia for other Browsers
            getUserMedia(
                {"audio":constraints.audio,"video":constraints.video},
                function (stream) {

                	// set stream
                    myStream = stream;
                    if(constraints.audio) {
                        try {
                            myAudioTrack = stream.getAudioTracks()[0];
                        } catch(e) {
                            console.log('ERROR accessing Audio' +e);
                            myAudioTrack = false;
                        }
                    }
                    if(constraints.video) {
                        try {
                            myVideoTrack = stream.getVideoTracks()[0];
                        } catch(e) {
                            console.log('ERROR accessing Video' +e);
                            myVideoTrack = false;
                        }
                    }
                    // close mediastream & return if wanted media is not available
                    if( constraints.audio && !myAudioTrack ||
                        constraints.video && !myVideoTrack ) {
                        that.stopStream();
	                    if(fail) {
	                        fail();
	                    }
	                    return false;
                    }
                    if(success) {
                    	success(myStream);
                    }
                }, function(e){
                    console.log("GetUserMediaFailed: "+e);
                    if(fail) {
                        fail();
                    }
                }
            );
	};

	// get the other guys media stream
	this.getOtherStream = function(){
		return otherStream;
	};
}