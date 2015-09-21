// ==UserScript==
// @name         SO-Chat-Socket-Saver
// @namespace    http://awal.js.org/
// @version      0.1
// @description  i dunno what to put this is a template lmao
// @author       awal
// @match        *://chat.stackoverflow.com/rooms/*
// @match        *://meta.chat.stackexchange.com/rooms/*
// @match        *://chat.stackexchange.com/rooms/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

if (document.body) {
	console.warn('Socket Saver: Not properly running at document-start, setup shit properly FFS!');
} else {
    // we are running at document-start properly. yipee!!
    Object.defineProperty(WebSocket.prototype, 'onopen', {
        set: function (val) {
            if (this.url.startsWith('wss://chat.sockets.stackexchange.com')) {
                console.info('Socket Saver: socket saved properly, use it with window.__stackexchange_chat_saved_socket');
                window.__stackexchangeChatSavedSocket = this;
                window.dispatchEvent(new CustomEvent('stackexchange-socket-saved'));
            }
        }
    });
}
