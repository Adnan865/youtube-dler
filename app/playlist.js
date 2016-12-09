/* @TODO CLEAN THIS SHIT UP :33 esp. the resume part.. */

var helpers = require("./helpers");

function dlPlayListRecursive(playlistId, pageToken, audio, quality, resume, path, check) {
    helpers.ensureExists(path, function(err) {
        if (err) {
            return helpers.uglify("Error: Can't create the downloads folder", err);
        } else {
            helpers.beautify("Parsing playlist info");
            helpers.parsePlaylistInfo(playlistId, pageToken, function(err, data) {
                if (err) return helpers.uglify("Error:", err);
                var ext = audio ? ".mp3" : ".mp4";
                var i = -1;
                var num = data.items.length;
                helpers.beautify("Got " + num + " videos");
                var next = function() {
                    i++;
                    if (i === num) {
                        if (data.nextPageToken) {
                            return dlPlayListRecursive(playlistId, data.nextPageToken, audio, quality, 0, path, check);
                        } else if (!check) {
                            helpers.beautify("Finished Downloading");
                            i = -1;
                            helpers.beautify("Performing a check");
                            return dlPlayListRecursive(playlistId, null, audio, quality, 0, path, 1);
                        } else {
                            return;
                        }
                    }
                    if (!check) {
                        var vid = data.items[i].snippet;
                        helpers.beautify("Downloading https://www.youtube.com/watch?v=" + vid.resourceId.videoId + "\n", i);
                        helpers.printVideoInfo(vid);
                        helpers.downloadVideo(vid.resourceId.videoId, vid.title, audio, quality, path, next);
                    } else {
                        var vid = data.items[i].snippet;
                        helpers.getStats(path + '/' + vid.title.replace(helpers.re, '-') + ext, function(err, stats) {
                            if (err) {
                                helpers.downloadVideo(vid.resourceId.videoId, vid.title, audio, quality, path, function(res, info) {
                                    console.log(JSON.stringify(res), info);
                                }, 1);
                                //helpers.beautify("RE-downloading https://www.youtube.com/watch?v=" + vid.resourceId.videoId + "\n");
                                //helpers.downloadVideo(vid.resourceId.videoId, vid.title, audio, quality, path, next);
                            }
                            return next();
                        });
                    }
                };
                if (resume) {
                    helpers.getNewestFile(path + "/", ext, function(file) {
                        if (!file) {
                            helpers.uglify("Re-downloading the playlist");
                            return next();
                        }
                        var findInPlaylist = function(err, d) {
                            if (err) return helpers.uglify("Error:", err);
                            var found = 0;
                            var number = d.items.length;
                            for (var j = 0; j < num; j++) {
                                if (d.items[j].snippet.title.replace(helpers.re, '-') + ext === file) {
                                    found = 1;
                                    data = d;
                                    num = number;
                                    i = j;
                                    break;
                                }
                            }
                            if (!found && d.nextPageToken) {
                                helpers.parsePlaylistInfo(playlistId, d.nextPageToken, findInPlaylist);
                            } else {
                                return next();
                            }
                        };
                        findInPlaylist(err, data);
                    });
                } else {
                    next();
                }
            });
        }
    });
}

exports.dlPlaylist = function(apiKey, playlistId, audio, quality, resume, path) {
    helpers.authenticate(apiKey);
    dlPlayListRecursive(playlistId, null, audio, quality, resume, path, 0);
}
