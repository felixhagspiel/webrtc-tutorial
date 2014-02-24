## The Signaling-Server

### Setting up a WebSocket Server for Signaling using uberspace.de

If you want to use uberspace.de you will have to ask them to open up a port for you so you can use websockets. Usually they respond in 1-2 days max., for this example it took them half an hour to reply (a Monday at 4pm). Where you have to write the email too is described below. If you do not want to wait you have to use another nodehosting service, a list can be found [here](https://github.com/joyent/node/wiki/Node-Hosting).

If you still want to use uberspace, go to [uberspace.de/register](https://uberspace.de/register) and enter a name below 'DEIN UBERSPACE'. On the next page select a password right below where it says 'ICH WÄHLE LIEBER EIN PASSWORT' (you will need a strong password, just keep typing until the text gets green). After that your account is created. Hurray! On the following page you will find your account-related email address, in my case it is webrtcer@vulpecula.uberspace.de. `vulpecula` is the name of the server where your VM is hosted, you will need that a lot so better write it down (your password also, of course).
Then login to webmail via via `http://webmail.yourvmservername.uberspace.de`, send an email to `hallo@uberspace.de` and kindly ask them to open up a port between 61000 and 65535 so you can use websockets (you can write in English).

Next you will have to set your SSH-password (or SSH-key, if you prefer). Click on 'ZUGÄNGE' and enter a password where it says '… via Passwort' or add an SSH-Key where it says '… via SSH-Schlüssel'.

Once you have done that open up your terminal and SSH into your VM:

	ssh yourusername@sourvmservername.uberspace.de

Then check if node and npm is installed by typing these commands (if they are installed you should see a version number on the console):

`node -v`

`npm -v`

Then we have to create a few new folders where we can store our project files (of course you can do that also by using an FTP-Client):

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

Now lets install the websocket-dependencies:

`npm install websocket`

Now let's try to start the server:

`node server.js`

If you see something like this:

`Mon Feb 17 2014 16:47:39 GMT+0100 (CET) Server is listening on port 61234`

it means that the server is up and running. For now we will start it manually, which means that you have to restart it everytime it crashes or you logout, which is better for debugging purposes. Later you can read [here](https://uberspace.de/dokuwiki/development:nodejs) on how to start a daemon which automatically starts the server.

#### Note: As node.js is written in JavaScript, the whole server will be down for all users when an error occurs, even if the error happens just on one single connection!

### Now let's look at the code

I will not describe all the things I already mentioned in the comments. I will rather give a look how the message-flow works.

First you have to replace the portnumber with the one assigned by uberspace:

	var webSocketsServerPort = 61234,

The following function is called each time someone connects to the server

	wsServer.on('request', function(request) { ... });

It stays opened until the connection is closed. Inside it you can see

	connection.on('message', function(message) { ... });

which will be executed each time we call the connection.send()-function on the client side. Inside it we try to parse the message to JSON and handle the different kind of message-types. The different kinds relevant for the server are `roomCreated` and `offer`. If the type does not match those types the message will be delivered to the partner who is inside the same room.

### `case 'createRoom'`:

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

And voilà, the room is created. Now we see what happens when someone wants to join our room.

### `case 'offer'`:

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

### `default`:

After that we have both creator- and partner-connection. Now each message will be just transferred to the opposite member of the room without any special action taken:

	default:
		if(this === rooms[data.roomId].partnerConnection) {
			return send(rooms[data.roomId].creatorConnection, data);
		}
		return send(rooms[data.roomId].partnerConnection, data);
	break;

That's basically everything we need. Of course you can do a lot more error-handling and store more userdata, but for this simple example it is enough.