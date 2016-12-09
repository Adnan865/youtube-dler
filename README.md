# Youtube Downloader
A CLI Youtube downloader I worked on for fun last year.
It can download videos, extract audio from a video and download playlists.

## Installation
```
[sudo] npm install -g youtube-dler
```

## Usage
```
youtube-dler <command> <ID> [options]

Commands:
  video     Download a video
  playlist  Download a playlist
  tracks    Add track info to a downloaded playlist
```
```
./app.js video <ID> [options]

Options:
  -a, --audio-only  Only download the audio as an mp3
  -q, --quality     The video quality to download (only used if -a isn't used)
  -o, --out         The file name to use when saving the video
  -k, --key         API key
  -h, --help        Show help
```
```
./app.js playlist <ID> [options]

Options:
  -a, --audio-only  Only download the audio as an mp3
  -q, --quality     The video quality to download (only used if -a isn't used)
  -o, --out         The folder's name to use when saving the playlist
  -r, --resume      Resume a previously stopped download
  -k, --key         API key
  -h                Show help
```
```
./app.js tracks <folder> [options]

Options:
  --ar, --artist  Artist name
  --al, --album   Album name
  -c, --cover     Path to cover
  -h              Show help
```

## What next?
These are some of the things I intend to do with this project:
- Clean the code up and use ES6.
- Resume a previously interrupted download.
- Rewrite parts that are using ytdl-core.
- Support additional platforms (deezer? soundcloud?).
- Get the lyrics too.
- GUI tool ([electron](http://electron.atom.io/)?).
