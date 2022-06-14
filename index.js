const sync = require('./sync');

// Command line args
var argv = (process.argv || []);

var args = {};
for (var i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
        if (argv.length > i + 1 && !argv[i + 1].startsWith('--'))
            args[argv[i].substring(2)] = argv[i + 1];
        else
            args[argv[i].substring(2)] = true;
    }
}

sync(args)