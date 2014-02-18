### Creating the Client-View

First, we will create a basic index.html which represents the login and the room view. It should look like this:

	<html>
	<head>
		<title>WebRTC</title>
		<!-- load some nice font -->
		<link href='http://fonts.googleapis.com/css?family=Open+Sans:300' rel='stylesheet' type='text/css'>
		<!-- apply some basic styles -->
		<style>
			* {
				padding: 0;
				margin: 0;
				-webkit-box-sizing: border-box;
				-moz-box-sizing: border-box;
				-ms-box-sizing: border-box;
				box-sizing: border-box;
			}
			body {
				padding-top: 5%;
				font-family: 'Open Sans', sans-serif;
			}
			.section {
				width: 100%;
				margin: auto;
				padding: 2em 1em;
				color: #525252;
			}
			.section.login {
				display: none;
				text-align: center;
				background-color: #9CA8B8;
			}
			.section.login.active {
				display: block;
			}
			.input-wrapper {
				width: 100%;
				max-width: 20em;
				margin: auto;
			}
			.title {
				font-size: 4em;
			}
			.input,
			.btn {
				margin: .5em 0;
				padding: .4em .2em;
				color: inherit;
				border: 1px solid #2C5651;
				border-radius: 4px;
				font-size: 1.6em;
				font-weight: inherit;
				display: inline-block;
			}
			.btn {
				cursor: pointer;
				text-decoration: none;
			}
			.btn:hover {
				background: #2C5651;
				color: #fff;
			}
			.u-margin-top--medium {
				margin-top: 1em;
			}
			.u-margin-bottom--medium {
				margin-top: 1em;
			}
			.u-width--100 {
				width: 100%;
			}

			/* Video-Stuff */
			.video-wrapper {
				width: 100%;
				max-width: 50em;
				margin: auto;
				position: relative;
			}
			.own-video,
			.other-video {
				background-color: #F5F5F5;
				border: 4px solid #2C5651;
				border-radius: 6px;
			}
			.own-video {
				width: 100%;
				max-width: 6em;
				max-height: 5em;
				position: absolute;
				right: 1em;
				bottom: 1em;
			}
			.other-video {
				height: 100%;
				max-height: 30em;
			}
		</style>
	</head>
	<body>
		<section class="section login">
			<div class="input-wrapper">
				<input id="username" type="text" class="u-width--100 input u-margin-top--medium" placeholder="choose your username">
				<h2>then</h2>
				<a id="create" href="" type="text" class="u-width--100 btn u-margin-bottomapitnoa-medium">create room</a>
				<h2>or</h2>
				<input id="roomid" type="text" class="u-width--100 input u-margin-top--medium" placeholder="enter room-id...">
				<a id="join" href="" type="text" class="u-width--100 btn">join room</a>
			</div>
		</section>
		<section class="section">
			<a id="closeroom" href="" class="btn">close room</a>
			<div class="video-wrapper">
				<div class="other-video">
					<video src=""></video>
				</div>
				<div class="own-video">
					<video src=""></video>
				</div>
			</div>
		</section>
		<script src="js/client.js" type="text/javascript"></script>
		<script>
			var WebRTC = new WebRTC('ws://capitano.musca.uberspace.de:61010');
		</script>
	</body>
	</html>

I just added some basic styling, of course you can style it as you wish. Just be aware that this is going to be a single-page application, so we have to hide/show some parts of it via JavaScript (I accomplish this by adding and removing the `active`-class).

Also don't worry about all the ID's and the different parts, I will explain later what they do.




