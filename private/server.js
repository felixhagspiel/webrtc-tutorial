// you have to replace this portnumber with the requested
// port as described before
var webSocketsServerPort = 63949,
// this tells node what we need for this application
webSocketServer = require('websocket').server,
http = require('http'),
// get a random number generator
uuid = require('uuid'),
// here we will save all clients who
// are currently connected to the websocket server
rooms= {};

// Because Websockets are using an upgraded
// HTTP header we need to create an HTTP server
var server = http.createServer(function(request, response) {
});

// now we tell the HTTP server to listen on our port
server.listen(webSocketsServerPort, function() {
	console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

// here we create the websocket server
var wsServer = new webSocketServer({
	httpServer: server
});

// this is executed each time the websocket
// server receives an request
wsServer.on('request', function(request) {

	// allow all incoming connections
	var connection = request.accept(null, request.origin);

	// here we read the incoming messages and try to parse them to JSON
	connection.on('message', function(message) {
		console.log('Incoming Message from '+request.origin);
		// try to parse JSON
		try {
			var data = JSON.parse(message.utf8Data);
		}
		catch(e) {
			console.log('This does not look like valid JSON');
		}

		// if JSON is valid process the request
		if(data !== undefined && data.type !== undefined) {
			switch(data.type) {
				case 'createRoom':
					// generate roomId and store current connection
					var roomId = uuid.v1();
					rooms[roomId] = {
						creatorConnection: connection,
						partnerConnection: false,
					}
					// send token to user
					var data = {
						type: 'roomCreated',
						payload: roomId
					};
					return send(rooms[roomId].creatorConnection, data);
				break;
				case 'offer':
					if(rooms[data.roomId].partnerConnection) {
						// send error to user
						var data = {
							type: 'error',
							payload: 'room is already full'
						};
						return send(connection, data);
					}
					console.log('offer sended');
					rooms[data.roomId].partnerConnection = this;

					return send(rooms[data.roomId].creatorConnection, data);
				break;
				// send to other guy
				default:
					if(this === rooms[data.roomId].partnerConnection) {
						console.log('send to creator : '+data.type);
						return send(rooms[data.roomId].creatorConnection, data);
					}
					console.log('send to parther : '+data.type);
					return send(rooms[data.roomId].partnerConnection, data);
				break;
			}
		}
		// if JSON is invalid or type is missing send error
		else {
			var data = {
				type: 'error',
				payload: 'ERROR FROM SERVER: Incorrect data or no data received'
			};
			send(connection,data);
		}
	});

	// this function sends data to the other user
	var send = function(connection, data){
		try {
			connection.sendUTF(JSON.stringify(data));
		}
		catch(e) {
			console.log('\n\n!!!### ERROR while sending message ###!!!\n');
			console.log(e+'\n');
			return;
		}
	};
});