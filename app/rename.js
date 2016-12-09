var fs = require("fs");
var dir = "./downloads/"+process.argv[2]+"/";
fs.readdir(dir, function(err, files) {
    if (err) {
        console.log(err);
    }
    files.forEach(function(file) {
        fs.rename(dir + file, dir + file.replace(/[|\\?*<\":>+\[/']/g, '-'), function(err) {
            if (err) console.log('ERROR: ' + err);
        });
    });
});
