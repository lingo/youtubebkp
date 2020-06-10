const { google } = require('googleapis');

function debug(...args) {
	// console.info(...args);
}

// function createAuthURL(keys) {
// 	const oauth2Client = new google.auth.OAuth2(
// 	  keys.clientID,
// 	  keys.clientSecret,
// 	  keys.redirectURL
// 	);

// 	// generate a url that asks permissions for Blogger and Google Calendar scopes
// 	const scopes = [
// 	  'https://www.googleapis.com/auth/blogger',
// 	  'https://www.googleapis.com/auth/calendar'
// 	];

// 	const url = oauth2Client.generateAuthUrl({
// 	  // 'online' (default) or 'offline' (gets refresh_token)
// 	  access_type: 'offline',

// 	  // If you only need one scope you can pass it as a string
// 	  scope: scopes
// 	});

// 	return url;
// }

// function getToken(code) {
// 	// This will provide an object with the access_token and refresh_token.
// 	// Save these somewhere safe so they can be used at a later time.
// 	const { tokens } = await oauth2Client.getToken(code)
// 	oauth2Client.setCredentials(tokens);
// }

async function ytSlurp(request) {
	const items = [];
	let pageToken;

	while (true) {
		debug('Request page ', pageToken);
		const response = await request(pageToken);

		if (response && response.data) {
			debug(' -> []', response.data.items.length);
			items.push(...response.data.items);
		} else {
			break;
		}

		if (!response.data.nextPageToken) {
			break;
		}

		pageToken = response.data.nextPageToken;
	}

	return items;
}

function getPlaylistVideos(youtube, playlistId) {
	return ytSlurp(pageToken => youtube.playlistItems.list({
		part: [ 'snippet' ],
		playlistId,
		pageToken,
		maxResults: 50,
	}));
}

function usage() {
	console.error(`Usage: ${process.argv[1]} --apikey API_KEY --channel CHANNEL_ID`);
	process.exit(2);
}

// Make sure the client is loaded and sign-in is complete before calling this method.
async function main(args) {
	if (!args.apikey || !args.channel) {
		usage();
	}

	const youtube =  google.youtube({
		version: 'v3',
		auth: args.apikey
	});

	let pageToken;

	const playlists = await ytSlurp(pageToken => youtube.playlists.list({
    part: [
      'contentDetails',
      'snippet',
      'status',
    ],
    channelId: args.channel,
    pageToken,
    maxResults: 50,
    // "mine": true,
  }));

	debug(playlists.map(item => `${item.status.privacyStatus !== 'public' ? '-' : ''}${item.snippet.title} (${item.contentDetails.itemCount} videos) : ${item.id}`));

	const byName = {};

	for (const pl of playlists) {
		if (byName[pl.snippet.title]) {
			throw new Error(`${pl.snippet.title} already exists`);
		}

		try {
			byName[pl.snippet.title] = await getPlaylistVideos(youtube, pl.id);
			console.log(`\n## ${pl.snippet.title}\n`);
			console.log(
				byName[pl.snippet.title]
					.map(v => `- [${v.snippet.title}](https://www.youtube.com/watch?v=${v.snippet.resourceId.videoId})`)
					.join('\n')
			);
		} catch (err) {
			console.error(err);
			break;
		}
	}
}

const argv = require('minimist')(process.argv.slice(2));

main(argv)
	.catch (error => {
		console.error(error);
	});