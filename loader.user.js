// ==UserScript==
// @name ChatBot auto-loader
// @author Zirak
// @namespace ZirakInSpace
// @version 0.1
// @description Loads the bot when you visit a room
// @include /http://chat\.stack(overflow|exchange)\.com/rooms/\d+/
// @run-at       document-start
// ==/UserScript==

var s = document.createElement( 'script' );
s.src = 'https://raw.github.com/Zirak/SO-ChatBot/master/master.js';

if (document.body) {
	console.warn('Socket Saver: Not properly running at document-start, setup shit properly FFS!');
    document.head.appendChild( s );
} else {
    // we are running at document-start properly. yipee!!
    Object.defineProperty(WebSocket.prototype, 'onopen', {
        set: function (val) {
            if (this.url.startsWith('wss://chat.sockets.stackexchange.com')) {
                console.info('Socket Saver: socket saved properly, use it with window.__stackexchange_chat_saved_socket');
                window.__stackexchangeChatSavedSocket = this;
    			document.head.appendChild( s );
            }
        }
    });
}
