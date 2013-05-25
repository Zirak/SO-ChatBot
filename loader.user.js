// ==UserScript==
// @name ChatBot auto-loader
// @author Zirak
// @namespace ZirakInSpace
// @version 0.1
// @description Loads the bot when you visit a room
// @include /http://chat\.stack(overflow|exchange)\.com/rooms/\d+/
// ==/UserScript==

var s = document.createElement( 'script' );
s.src = 'https://raw.github.com/Zirak/SO-ChatBot/master/master.js';
document.head.appendChild( s );
