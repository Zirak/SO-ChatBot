(function () {
"use strict";

bot.users = {};

var joined = {};

var join = function ( msgObj, cb ) {
	var room = msgObj.room_id;

	if ( !joined[room] ) {
		joined[ room ] = [];
	}

	joined[ room ].push( msgObj.user_id );

	addInfos( cb );
};

IO.register( 'userjoin', function userjoin ( msgObj ) {
	bot.log( msgObj, bot.users[msgObj.user_id], 'userjoin' );

	var user = bot.users[ msgObj.user_id ];
	if ( !user ) {
		join( msgObj, finish );
	}
	else {
		finish( user );
	}

	function finish ( user ) {
		IO.fire( 'userregister', user, msgObj.room_id );
	}
});

// 1839506

//this function throttles to give the chat a chance to fetch the user info
// itself, and to queue up several joins in a row
var addInfos = (function ( cb ) {
	bot.log( joined, 'user addInfos' );

	Object.iterate( joined, function ( room, ids ) {
		requestInfo( room, ids, cb );
	});

	joined = {};
}).throttle( 5000 );

function requestInfo ( room, ids, cb ) {
	if ( !Array.isArray(ids) ) {
		ids = [ ids ];
	}

	if ( !ids.length ) {
		return;
	}

	IO.xhr({
		method : 'POST',
		url : '/user/info',

		data : {
			ids : ids.join(),
			roomId : room
		},
		complete : finish
	});

	function finish ( resp ) {
		resp = JSON.parse( resp );
		resp.users.forEach( addUser );
	}

	function addUser ( user ) {
		bot.users[ user.id ] = user;
		cb( user );
	}
}
bot.users.request = requestInfo;

function loadUsers () {
	if ( window.users ) {
		bot.users = Object.merge( bot.users, window.users );
	}
}

loadUsers();
}());
