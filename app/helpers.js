var chalk = require('chalk');
var ytdl = require("ytdl-core");
var fs = require("fs");
var path = require('path');
var http = require('http');
var url = require('url');
var youtube = require("youtube-api");

module.exports = {
    re: new RegExp("[|\\?*<\":>+\[/']", "g"),
    authenticate: function(key) {
        youtube.authenticate({
            type: "key",
            key: key
        });
    },
    getStats: function(file, cb) {
        fs.stat(file, cb);
    },
    ensureExists: function(path, mask, cb) {
        if (typeof mask == 'function') {
            cb = mask;
            mask = 0777;
        }
        fs.mkdir(path, mask, function(err) {
            if (err) {
                if (err.code == 'EEXIST') cb(null);
                else cb(err);
            } else cb(null);
        });
    },
    getNewestFile: function(dir, ext, cb) {
        if (!cb) return;
        self = this;
        fs.readdir(dir, function(err, files) {
            if (err) {
                self.uglify(err);
                return cb(null);
            }
            var newest = {
                file: files[0]
            };
            fs.stat(dir + newest.file, function(err, stats) {
                if (err) {
                    self.uglify(err);
                    return cb(null);
                }
                var checked = 1;
                newest.mtime = stats.mtime;
                files.forEach(function(file) {
                    fs.stat(dir + file, function(err, stats) {
                        checked++;
                        if (path.extname(file) === ext) {
                            if (stats.mtime.getTime() > newest.mtime.getTime()) {
                                newest = {
                                    file: file,
                                    mtime: stats.mtime
                                };
                            }
                            if (checked === files.length) {
                                cb(newest.file);
                            }
                        }
                    });
                });
            });
        });
    },
    parsePlaylistInfo: function(playlistId, pageToken, cb) {
        youtube.playlistItems.list({
            part: "snippet",
            pageToken: pageToken,
            maxResults: 50,
            playlistId: playlistId
        }, cb);
    },
    printVideoInfo: function(info) {
        console.log(chalk.bold('title:'), info.title);
        console.log(chalk.bold('author:'), info.channelTitle);
        console.log(chalk.bold('description:'), info.description.substring(0, 100) + (info.description.length > 100 ? "..." : ""));
    },
    printVideoMeta: function(meta) {
        console.log(chalk.bold('container:'), meta.container);
        console.log(chalk.bold('resolution:'), meta.resolution);
        console.log(chalk.bold('encoding:'), meta.encoding);
        console.log(chalk.bold('size:'), this.toHumanSize(meta.size) + ' (' + meta.size + ' bytes)');
    },
    resolvePath: function(destPath) {
        return path.resolve(path.relative(process.cwd(), destPath));
    },
    downloadVideo: function(id, title, audio, quality, path, next, check) {
        var self = this;
        var uri = "https://www.youtube.com/watch?v=" + id;
        var options = {
            quality: quality,
            filter: function(format) {
                if (audio)
                    return format.container === 'mp4' && format.resolution == null && format.audioBitrate == 128;
                else
                    return format.container === 'mp4';
            }
        };
        if (check) {
            ytdl.getInfo(uri, options, next);
            return;
        }
        var readStream = ytdl(uri, options);
        var output = path + '/' + title.replace(this.re, '-') + (audio ? '.mp3' : '.mp4');
        var meta;
        readStream.on('response', function(res) {
            var size = res.headers['content-length'];
            res.pipe(fs.createWriteStream(output));
            meta.size = size;
            self.printVideoMeta(meta);
            var bar = require('progress-bar').create(process.stdout, 50);
            bar.format = '$bar; $percentage;%';
            var dataRead = 0;
            readStream.on('data', function(data) {
                dataRead += data.length;
                var percent = dataRead / size;
                bar.update(percent);
            });
        });

        readStream.on('error', function(err) {
            self.uglify(err.message);
            next();
        });

        readStream.on('info', function(info, format) {
            meta = format;
        });

        readStream.on('end', function onend() {
            console.log("\n\n=====================================================");
            next();
        });
    },
    beautify: function(what, i) {
        i = i ? i : "+";
        console.log(chalk.bold.blue("\n[" + i + "] " + what));
    },
    uglify: function(what) {
        console.log(chalk.bold.red("\n[-] " + what));
    },
    toHumanTime: function(seconds) {
        var h = Math.floor(seconds / 3600);
        var m = Math.floor(seconds / 60) % 60;

        var time;
        if (h > 0) {
            time = h + ':';
            if (m < 10) {
                m = '0' + m;
            }
        } else {
            time = '';
        }

        var s = seconds % 60;
        if (s < 10) {
            s = '0' + s;
        }

        return time + m + ':' + s;
    },
    toHumanSize: function(bytes) {
        var units = ' KMGTPEZYXWVU';
        if (bytes <= 0) {
            return 0;
        }
        var t2 = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 12);
        return (Math.round(bytes * 100 / Math.pow(1024, t2)) / 100) +
            units.charAt(t2).replace(' ', '') + 'B';
    },

}
