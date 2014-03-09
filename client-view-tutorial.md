## The View

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