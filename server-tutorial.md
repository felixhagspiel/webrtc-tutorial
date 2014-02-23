### Setting up a WebSocket Server for Signaling using uberspace.de

If you want to use uberspace you will have to ask them to open up a port for you so you can use websockets. Usually they respond in 1-2 days max., for this example it took them half an hour to reply (a Monday at 4pm). If you do not want to wait you have to use another nodehosting service, a list can be found [here](https://github.com/joyent/node/wiki/Node-Hosting).

If you still want to use uberspace, go to [uberspace.de/register](https://uberspace.de/register) and enter a name below 'DEIN UBERSPACE'. On the next page select a password right below where it says 'ICH WÄHLE LIEBER EIN PASSWORT' (you will need a strong password, just keep typing until the text gets green). After that your account is created. Hurray! On the following page you will find your account-related email address, in my case it is webrtcer@vulpecula.uberspace.de. `vulpecula` is the name of the server where your VM is hosted, you will need that a lot so better write it down (your password also, of course).
Then login to webmail via via `http://webmail.yourvmservername.uberspace.de`, send an email to `hallo@uberspace.de` and kindly ask them to open up a port between 61000 and 65535 so you can use websockets (you can write in English).

Next you will have to set your SSH-password (or SSH-key, if you prefer). Click on 'ZUGÄNGE' and enter a password where it says '… via Passwort' or add an SSH-Key where it says '… via SSH-Schlüssel'.

Once you have done that open up your terminal and SSH into your VM:

	ssh yourusername@sourvmservername.uberspace.de

Then check if node and npm is installed by typing these commands (if they are you should see the versions number):

`node -v`

`npm -v`

Then create a few new folders where you store your project files:

`mkdir /var/www/virtual/yourusername/webrtc`

`cd /var/www/virtual/yourusername/webrtc`

`mkdir public`

`mkdir private`

`/public` is the folder where we store all the HTML, JS and CSS. In `/private` we will store the nodeserver file. It is important that the folder ist outside your /html-folder! Now go into the `/private`-folder, create a file called `server.js` and open it inside the nano-editor in the terminal:

`cd private`

`touch server.js`

`nano server.js`

Then copy the following code, rightclick inside the terminal and paste:

	// you have to replace this portnumber with the requested
	// port as described before
	var webSocketsServerPort = 63949,
	// this tells node what we need for this application
	webSocketServer = require('websocket').server,
	http = require('http'),
	// here we will save all clients who
	// are currently connected to the websocket server
	connections= [],
	// here we save the connection of our partner
	otherPerson = false;

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
			if(data !== undefined) {
				send(token, data, type )
			}
			// if JSON is invalid send error
			else {
				send(connections[userId],
				{
					type: 'error',
					cbId: false,
					action: false,
					data:'ERROR FROM SERVER: Incorrect data or no data received'
				});
			}
		});

		// this function sends data to the other user
		var send = function(token, data, type){
			try {
				// iterate through all connections and find
				// the user with token, then send him data
				connections.forEach(function(entry){
					if(entry.token === token) {
						user.con.sendUTF(JSON.stringify( data ));
					}
				});
			}
			catch(e) {
				console.log('\n\n!!!### ERROR while sending message ###!!!\n');
				console.log(e+'\n');
				console.log('\n\n!!!### Message: ###!!!\n');
				console.log(users);
				console.log(data);
				return;
			}
		};
	});

Now exit the editor by pressing `CTRL+X` on Windows (it should show you the shortcut to exit at the bottom of your terminal), it will ask you then to save the file, press `y` and then `enter`.

Now lets install the websocket-dependencies:

`npm install websocket`

Now let's try to start the server:

`node server.js`

If you see something like:

`Mon Feb 17 2014 16:47:39 GMT+0100 (CET) Server is listening on port 61234`

the server is up and running. For now we will run it manually, which means that you have to restart it everytime it crashes or you logout, but for debugging purposes it is better. Later you can read [here](https://uberspace.de/dokuwiki/development:nodejs) on how to start a daemon.

### Creating the Client

First, we will create a basic index.html which represents the login and which should look like this: