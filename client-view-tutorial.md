## The Client-View

Now you have to create and edit a `index.html`-file inside your `/public`-folder.

`cd /var/www/virtual/yourusername/webrtc/public`

`touch index.html`

`nano index.html`

Now we paste all content from the downloaded index.html-file inside the terminal and save it like we did when creating the server.js-file.
As we have no domain associated with our VM and the public-folder is outside the html-folder we have to create a symlink to point to our index.html:

`ln -s /var/www/virtual/yourusername/webrtc/public /var/www/virtual/yourusername/yourusername.yourservername.uberspace.de`

If you enter then `http://yourusername.yourservername.uberspace.de` inside your Browser, you should see the login-screen. If not there is most likely something wrong with the symlink. If you have a 'www.' infront of the domainname it will not work as you have to create a second symlink for that.

Let's look at the index-file. I just added some basic CSS-styling, of course you can style it as you wish. Just be aware that this is going to be a single-page application, so we have to hide/show some parts of it via JavaScript (I accomplish this by adding and removing the `active`-class).
As before I will not explain the parts of the index-file which I think are self-explaining or which are already commented.

The two `video`-elements will represent the video- and audiostreams once the connection is established. Note that the `ownVideo`-element is muted. This is important because otherwise you will hear your own voice all the time. The autoplay-parameter ensures that the video plays even if we do not call the `.play()`-function ourself (at least in Chrome, in FF you still have to to that).
Now to the JavaScript - here we create a new WebRTC-object which we will define in the client.js-file later. Then we execute the `connectToSocket()`-function which establishes the connection to the websocket-server (needless to say that you have to put in your server-name).

	var WebRTC = new WebRTC();
	WebRTC.connectToSocket('ws://yourservername.uberspace.de:63949');

Then we add a custom eventlisteners which is used to communicate between the view and the WebRTC-object:

	document.addEventListener('socketEvent', function(socketEvent){ ... });

Next we add the clickhandlers for the "create room"- and "join room"-button. When clicked, we get the user's media-stream of microphone and camera and add it as source to the `ownVideo`-element. This is done by the `success`-function which is executed if you click "allow" on the request for permission to access your microphone and camera. After that we call the `createRoom()` or `joinRoom()`-function of the WebRTC-object.