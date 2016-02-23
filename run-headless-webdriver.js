var cleanupAndExit = function(exitCode) {
    var exit = function() {
        console.log('Exiting.');
        process.exit(exitCode);
    };
    
    console.log('Cleaning up...');
    setTimeout(function() {
        console.warn('Failed to clean up in 5000ms. Some browser instances may remain.');
        exit();
    }, 5000);
    if (client) {
        if (dumpBrowserConsoleLoop) {
            clearInterval(dumpBrowserConsoleLoop);
        }
        client.end().then(function() {
            console.log('Cleaned up.');
            exit();
        }).catch(function(err) {
            console.error(err.name, err.message);
            console.warn('Cleanup failed. Some browser instances may remain.');
            exit();
        });
    } else {
        exit();
    }
};

var signals = {
    'SIGHUP': 1,
    'SIGINT': 2,
    'SIGTERM': 15,
    'SIGBREAK': 21
};
for (var signal in signals) {
    process.on(signal, function() {
        console.log(signal + ' caught');
        cleanupAndExit(128 + signals[signal]); // posix signal 128 + signal number
    });
}
process.on('uncaughtException', function(err) {
    console.error(err);
    cleanupAndExit(1);
});

var config = require('./run-headless.config.json');

var webdriverio = require('webdriverio');

var client = webdriverio.remote(config.driverOptions);

var logLevels = {
    'SEVERE': console.error,
    'WARNING': console.warn,
    'INFO': console.info,
    'DEBUG': console.debug
};
var dumpBrowserConsole = function(limit) {
    client.log('browser').then(function(logs) {
        (limit ? logs.value.slice(-limit) : logs.value).forEach(function(log) {
            (logLevels[log.value] || console.log).call(console, log.message);
        });
    });
};
var dumpBrowserConsoleLoop = null;
// phantomjs does not clear browser logs correctly
// dumping in a loop floods console cause they repeat
//var dumpBrowserConsoleLoop = setInterval(dumpBrowserConsole, 5000);
    
client
    .init()
    .url(config.loginUrl)
    .getUrl()
    .then(function(url) {
        console.log('Loaded ' + url);
    })
    .getText('=log in')
    .then(function() {
        console.log('Logging in...');
        return client
            .execute(function() {
                openid.signin('stack_exchange');
            })
            .waitForExist('#affiliate-signin-iframe', 10000)
            .frame('affiliate-signin-iframe')
            .waitForExist('#email', 10000)
            .setValue('#email', config.email)
            .setValue('#password', config.password)
            .submitForm('.login-form form')
            .frame()
            .getUrl()
            .then(function(url) {
                console.log('Login submitted; loaded ' + url);
            });
    }, function(err) {
        console.log('Already logged in; skipping login');
    })
    .url(config.roomUrl)
    .getUrl()
    .then(function(url) {
        console.log('Loaded chatroom ' + url);
    })
    .execute(function() {
        var script = document.createElement('script');
        //script.src = 'http://localhost/master.js';
        script.src = 'http://localhost:8080/TestMimeMap/master.js';
        script.onload = function() {
            //bot.activateDevMode();
            console.log('Loaded bot');
            bot.adapter.out.add('I have just been restarted! This happens daily automatically, or when my owner restarts me. Ready for commands.');
        };
        document.head.appendChild(script);
    })
    .then(function() {
        console.log('Chatbot injected');
    })
    .then(function() {
        var readline = require('readline');
        var repl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        repl.on('SIGINT', function() {
            process.emit('SIGINT');
        });
        repl.setPrompt('> ');

        console.log('You are now in a REPL with the remote page. Have fun!');
        
        var ready = true;
        repl.on('line', function(data) {
            console.log('Attempting to run "' + data + '"');
            ready = false;
            client.executeAsync(function(code) {
                return eval(code);
            }, data).then(function(ret) {
                console.log('$', ret.value);
            }).catch(function(err) {
                console.log('!', err.name, err.message);
            }).finally(function() {
                // because phantomjs does not clear browser logs correctly
                // we only display the last 5 to avoid flooding
                dumpBrowserConsole(5);
                repl.prompt();
            });
        });
        
        repl.prompt();
    });