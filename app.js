#!/usr/bin/env node

/*  @TODO change metadata of playlists (ffmetadata) */
/*  @TODO download all videos from a channel */
/*  @TODO download last videos from x mins ago (after login) */
/*  @TODO Add more comments to the code */
var config = require('./config');
var chalk = require('chalk');
var figlet = require('figlet');
var helpers = require('./app/helpers');

figlet.text('Youtube-Dler', {
    font: 'Doom',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}, function(err, data) {
    if (err) {
        console.log(chalk.bold.red('Something went wrong...'));
        console.dir(err);
        return;
    }
    console.log(chalk.bold.blue(data));
    var yargonaut = require('yargonaut');
    yargonaut.style('blue');
    var yargs = require('yargs')
        .usage(chalk.bold('Usage: ./$0 <command> <ID> [options]'))
        .command(chalk.bold.green('video'), 'Download a video')
        .command(chalk.bold.yellow('playlist'), 'Download a playlist')
        .command(chalk.bold.magenta('tracks'), 'Add track info to a downloaded playlist')
        .demand(1, chalk.red.bold('Please provide a valid command')),
        argv = yargs.argv,
        command = argv._[0];

    if (command === 'video') {
        yargonaut.style('green');
        argv = yargs.reset()
            .wrap(Math.min(100, yargs.terminalWidth()))
            .usage(chalk.bold('Usage: ./$0 video <ID> [options]'))
            .demand(2, chalk.red.bold('Please provide a video ID'))
            .boolean('a')
            .alias('a', 'audio-only')
            .describe('a', 'Only download the audio as an mp3')
            .alias('q', 'quality')
            .nargs('q', 1)
            .describe('q', 'The video quality to download (only used if -a isn\'t used)')
            .default('q', config.q)
            .alias('o', 'out')
            .nargs('o', 1)
            .describe('o', 'The file name to use when saving the video')
            .default('o', config.f)
            .alias('k', 'key')
            .nargs('k', 1)
            .describe('k', 'API key')
            .default('k', config.k)
            .help('h')
            .alias('h', 'help')
            .example('./$0 video wZZ7oFKsKzY', 'Downloads the video located at https://youtu.be/wZZ7oFKsKzY')
            .argv
        helpers.ensureExists(__dirname + '/downloads/', function(err) {
            if (err) {
                return helpers.uglify("Error: Can't create the downloads folder", err);
            } else {
                require('./app/video').dlVideo(argv.k, argv.o, argv._[1], argv.a, argv.q, __dirname + '/downloads/');
            }
        });

    } else if (command === 'playlist') {
        yargonaut.style('yellow');
        argv = yargs.reset()
            .wrap(Math.min(100, yargs.terminalWidth()))
            .usage(chalk.bold('Usage: ./$0 playlist <ID> [options]'))
            .demand(2, chalk.red.bold('Please provide a playlist ID'))
            .boolean('a')
            .alias('a', 'audio-only')
            .describe('a', 'Only download the audio as an mp3')
            .alias('q', 'quality')
            .nargs('q', 1)
            .describe('q', 'The video quality to download (only used if -a isn\'t used)')
            .default('q', config.q)
            .alias('o', 'out')
            .nargs('o', 1)
            .describe('o', 'The folder\'s name to use when saving the playlist')
            .default('o', config.f)
            .boolean('r')
            .alias('r', 'do not resume')
            .describe('r', 'Redownload the entire playlist from the beginning')
            .alias('k', 'key')
            .nargs('k', 1)
            .describe('k', 'API key')
            .default('k', config.k)
            .help('h')
            .example('./$0 playlist RDwZZ7oFKsKzY', 'Downloads the playlist with list id of RDwZZ7oFKsKzY')
            .argv
        helpers.ensureExists(__dirname + '/downloads/', function(err) {
            if (err) {
                return helpers.uglify("Error: Can't create the downloads folder", err);
            } else {
                require('./app/playlist').dlPlaylist(argv.k, argv._[1], argv.a, argv.q, !argv.r, __dirname + '/downloads/' + argv.o);
            }
        });
    } else if (command === 'tracks') {
        yargonaut.style('magenta');
        argv = yargs.reset()
            .wrap(Math.min(100, yargs.terminalWidth()))
            .usage(chalk.bold('Usage: ./$0 tracks <folder> [options]'))
            .demand(2, chalk.red.bold('Please enter a valid folder name'))
            .alias('ar', 'artist')
            .nargs('ar', 1)
            .describe('ar', 'Artist name')
            .demand('ar', 'Missing artist\'s name')
            .alias('al', 'album')
            .nargs('al', 1)
            .describe('al', 'Album name')
            .demand('ar', 'Missing album\'s name')
            .alias('c', 'cover')
            .nargs('c', 1)
            .describe('c', 'Path to cover')
            .help('h')
            .example('./$0 tracks sia --artist sia --album "1000 Forms Of Fear"')
            .argv;
        require('./app/tracks')(__dirname + '/downloads/' + argv._[1], argv.ar, argv.al, argv.c);
    } else {
        yargs.showHelp();
    }
});
