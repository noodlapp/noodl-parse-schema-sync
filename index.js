// Command line args
var argv = (process.argv || []);

var args = {};
for (var i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--') && argv.length > i + 1) {
        if (!argv[i + 1].startsWith('--'))
            args[argv[i].substring(2)] = argv[i + 1];
        else
            args[argv[i].substring(2)] = true;
    }
}

sync(args)