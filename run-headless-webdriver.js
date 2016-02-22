var config = require('./run-headless.config.json');

var webdriverio = require('webdriverio');

var client = webdriverio.remote({
        desiredCapabilities: {
            browserName: 'firefox'
        }
    });
    
client
    .init()
    .url(config.loginUrl)
    .getUrl()
    .then(function(url) {
        console.log('Loaded ' + url);
        console.log('Logging in...');
    })
    .execute(function() {
        openid.signin('stack_exchange');
    })
    .waitForExist('#affiliate-signin-iframe', 5000)
    .frame('affiliate-signin-iframe')
    .waitForExist('#email', 5000)
    .setValue('#email', config.email)
    .setValue('#password', config.password)
    .submitForm('.login-form form')
    .frame()
    .getUrl()
    .then(function(url) {
        console.log('Login submitted; loaded ' + url);
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

        console.log('You are now in a REPL with the remote page. Have fun!');
        
        repl.on('line', function(data) {
            client.execute(function(code) {
                try {
                    return eval(code);
                } catch (e) {
                    return e.message;
                }
            }).then(function(ret) {
                console.log('$', ret);
                repl.prompt();
            });
        });
    });