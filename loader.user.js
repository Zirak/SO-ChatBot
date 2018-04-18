// ==UserScript==
// @name ChatBot auto-loader
// @author Zirak
// @namespace ZirakInSpace
// @version 0.2
// @description Loads the bot when you visit a room
// @include /http://chat\.stack(overflow|exchange)\.com/rooms/\d+/
// ==/UserScript==

var s = document.createElement( 'script' );
s.onload = runConfigs;
s.src = 'https://rawgit.com/Zirak/SO-ChatBot/master/master.js';
document.head.appendChild( s );

function runConfigs() {
	var config = bot.config;
	config.weatherKey = '';
	config.githubToken = '';
	bot.memory.set('config', config);
	bot.memory.save();
}