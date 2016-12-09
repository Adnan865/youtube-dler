var id3 = require('id3-writer');
var iconv = require('iconv-lite');
var fs = require("fs");
var path = require('path');

module.exports = function(dir, artist, album, cover) {
    var i = 0;
    fs.readdir(dir, function(err, files) {
        files.forEach(function(fileName) {
            if (err) console.log('ERROR: ' + err);
            var writer = new id3.Writer();
            var file = new id3.File(dir + "/" + fileName);
            var meta = new id3.Meta({
                artist: artist,
                title: iconv.decode(new Buffer(fileName.split(".")[0], 'utf8'), 'ISO-8859-1'),
                album: album
            });
            writer.setFile(file).write(meta, function(err) {
                if (err) console.log('ERROR: ' + err);
                console.log("[", ++i, "] done with file:", fileName);
            });
        });
    });
}
