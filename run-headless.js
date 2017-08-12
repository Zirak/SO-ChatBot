var cri = require('chrome-remote-interface');
var fs = require('fs');
var repl = require('readline');
var util = require('util');

var config = require('./run-headless.config.json');

cri(async (client) => {
    try {
        await demLogics(client);
    }
    catch (e) {
        console.error(e);
    }
    finally {
        client.close();
        console.log('Have a nice day!');
    }
}).on('error', console.error);

async function demLogics(client) {
    var { DOM, Page, Runtime } = client;

    await Promise.all([
        DOM.enable(),
        Page.enable(),
        Runtime.enable()
    ]);

    await Page.navigate({ url: config.siteUrl + '/users/login/' });
    await Page.loadEventFired();
    await screenshot('pics/login-pre.png', client);

    var url = await getUrl(client);
    if (!/login-add($|\?)/.test(url)) {
        console.log('Need to authenticate');
        await loginToSE(client);
    }
    else {
        console.log('Cool, already logged in');
    }

    await injectBot(client);
    console.log('Injected bot');
}

async function loginToSE(client) {
    var { DOM, Page } = client;

    var { root: { nodeId: documentId } } = await DOM.getDocument({ depth: 0 });

    await Promise.all([
        type('#login-form #email', config.email, client, documentId),
        type('#login-form #password', config.password, client, documentId)
    ]);
    await screenshot('pics/login-filled.png', client);

    await click('#login-form #submit-button', client);
    await Page.loadEventFired();
    await screenshot('pics/login-post.png', client);
}

async function injectBot(client) {
    var { Page, Runtime } = client;

    await Page.navigate({ url: config.roomUrl });
    await Page.loadEventFired();
    await screenshot('pics/chat.png', client);

    await Runtime.evaluate({
        expression: `
var script = document.createElement('script');
script.src = 'https://rawgit.com/Zirak/SO-ChatBot/master/master.js';
script.onload = function() {
    bot.activateDevMode();
    console.log('Loaded bot');
    bot.adapter.out.add('I will derive!');
};
document.head.appendChild(script);`
    });
}

// rando utils because fml

async function type(selector, value, { DOM }, documentId) {
    var { nodeId } = await DOM.querySelector({
        selector,
        nodeId: documentId
    });

    await DOM.setAttributeValue({
        nodeId,
        name: 'value',
        value
    });
}

async function click(selector, { Runtime }) {
    // as of yet, the only way to dispatch mouse events is via coordinates
    // that's rather lame so we do something lamer
    await Runtime.evaluate({
        expression: `document.querySelector('${selector}').click()`
    });
    // plz no kill me i have family, kidnap me and depand ransom
    // or just kill them
}

async function getUrl({ Runtime }) {
    var { result: { value } } = await Runtime.evaluate({
        expression: 'location.href'
    });
    return value;
}

async function screenshot(ssName, { Page }) {
    var ss = new Buffer((await Page.captureScreenshot()).data, 'base64');

    return await util.promisify(fs.writeFile)(ssName, ss, 'base64');
}
