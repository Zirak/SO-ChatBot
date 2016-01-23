module.exports = function (bot) {
"use strict";

var defaults = {
    message: 'fail,user,pro',
    spaces: [25,14,1],
    jitter: 4,
    words: ['so','very','such','much','many']
};

function padd(str, n) {
    n += Math.random() * (defaults.jitter * 2 ) - defaults.jitter;

    for( var i = 0; i < n; i++ ) {
        str = ' ' + str;
    }
    return str;
}

function out(line) {
    return '    ' + line + '\r';
}

function shuffle(arr) {
    return arr.sort(function() {
        return Math.random() - 0.5;
    });
}

function doge(msg) {

    var input = (msg.length > 0 ? msg.toString() : defaults.message).split(',');

    var pre = shuffle(defaults.words.slice(0)),
    output = out(padd('wow', 4 + Math.random() * 4 | 0));

    while( input.length > pre.length ) {
        pre = pre.concat(shuffle(defaults.words.slice(0))); // Don't hurt me Zirak... I'm sorry.
    }

    while(input.length) {
        var line = '';
        if( pre.length ) {
            line += pre.shift() + ' ';
        }
        line += input.shift();
        output += out(padd(line, defaults.spaces[(input.length%3) - 1]));
    }

    msg.send(output + '\r    ');
}

bot.addCommand({
    fun : doge,
    name : 'doge',
    permissions : {
        del : 'NONE'
    },

    description : 'so shibe, much doge, wow' +
        ' `/doge one,two,three[,nth]',
    unTellable : true
});

};
