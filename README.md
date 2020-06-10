# Youtube Bkp

Backup youtube playlists to markdown

## Usage

```bash
./youtubebkp --apikey API_KEY --channel CHANNEL_ID
```

**API_KEY** can be created in the [Google API console](https://console.developers.google.com/apis/credentials)

**CHANNEL_ID** can be obtained from the URL in Youtube `Profile Menu`->`Your Channel`


Output will be to `STDOUT` and will be like the following:

```markdown
## Playlist Title

- [Video title](https://www.youtube.com/watch?v=VIDEO_ID)
- ...
```

## Development

### Get started

```bash
yarn
```

### Build

```bash
yarn build
```
