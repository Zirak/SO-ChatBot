(function () {
"use strict";

bot.users = {};
loadUsers();

var joined = [];
//this function throttles to give the chat a chance to fetch the user info itself, and
// to queue up several joins in a row
var join = (function ( id ) {
	joined.push( id );
	addInfos( joined );
	joined.length = 0;
}).throttle( 5000 );

IO.register( 'userjoin', function ( msgObj ) {
	bot.log( msgObj, 'userjoin' );

	var id = msgObj.user_id;
	if ( !bot.users[id] ) {
		join( id );
	}
});


function addInfos ( ids ) {
	if ( !ids.length ) {
		return;
	}
	bot.log( ids, 'user addInfos' );

	IO.xhr({
		method : 'POST',
		url : '/user/info',

		data : {
			ids : ids.join(),
			roomId : bot.adapter.roomid //this needs to be better
		},
		complete : finish
	});

	function finish ( resp ) {
		resp = JSON.parse( resp );
		resp.users.forEach( addUser );
	}
}

function loadUsers () {
	if ( window.users ) {
		bot.users = Object.merge( bot.users, window.users );
	}
	//chat hiddenUsers contains users whose icons are not displayed
	if ( window.hiddenUsers ) {
		addInfos( Object.keys(window.hiddenUsers) );
	}
}

function addUser ( user ) {
	bot.users[ user.id ] = user;
}
}());
