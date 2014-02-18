function WebRTC() {

	/*
	* 	Private Attributes
	*/
	var that = this;
	var connection = false;
	var roomId = false; // here is the room-ID stored
	var username = false; // this is your username

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
	}

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

            switch(data.type) {
            	// the server has created a room and returns the room-ID
            	case 'roomCreated':
            		// set room
            		roomId = data.payload;

            		// fire event
            		socketEvent.eventType = 'roomCreated';
            		document.dispatchEvent(socketEvent);
            	break;
            }
		};
	};

	this.getRoomId = function(){
		return roomId;
	};

	// this function tells the server to create a new room
	this.createRoom = function() {
		// send request when username is set & connection is ready
		if(username) {
			// create data-object
			var data = {
				type: 'createRoom',
				payload: username
			};
			// send data-object to server
			return sendToServer(data);
		}
		console.log('It looks like you have no username.');
	};

	// sets the username
	this.setUsername = function(name) {
		username = name;
	};
}