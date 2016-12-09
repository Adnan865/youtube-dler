/*  @TODO resume downloading a video + CLEAN THIS UP
 *	downloaded = fs.statSync(output).size;
 *	send a range header
 *	fs.createWriteStream('vid.mp4', { flags: 'a' })
 */
var youtube = require("youtube-api");
var helpers = require("./helpers");

exports.dlVideo = function(apiKey, title, videoId, audio, quality, path) {
    youtube.authenticate({
        type: "key",
        key: apiKey
    });
    helpers.beautify("Downloading https://www.youtube.com/watch?v=" + videoId + "\n");
    helpers.downloadVideo(videoId, title, audio, quality, path, function() {
        helpers.beautify("finished downloading");
    });
}
