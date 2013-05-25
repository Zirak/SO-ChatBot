(function () {
"use strict";

bot.users = {};

var joined = {};

var join = function ( msgObj ) {
	var room = msgObj.room_id;

	if ( !joined[room] ) {
		joined[ room ] = [];
	}

	joined[ room ].push( msgObj.user_id );

	addInfos();
};

IO.register( 'userjoin', function ( msgObj ) {
	bot.log( msgObj, bot.users[msgObj.user_id], 'userjoin' );

	var user = bot.users[ msgObj.user_id ];
	if ( !user ) {
		join( msgObj );
	}
	else {
		IO.fire( 'userregister', user, msgObj.room_id );
	}
});

// 1839506

//this function throttles to give the chat a chance to fetch the user info
// itself, and to queue up several joins in a row
var addInfos = (function () {
	bot.log( joined, 'user addInfos' );

	Object.iterate( joined, sendRequest );

	function sendRequest ( room, ids ) {
		//TODO: filter ids to remove already listed users
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

			joined = {};
		}

		function addUser ( user ) {
			bot.users[ user.id ] = user;
			//temporary. TODO: add higher-level event handling to bot obj
			IO.fire( 'userregister', user, room );
		}
	}
}).throttle( 5000 );

function loadUsers () {
	if ( window.users ) {
		bot.users = Object.merge( bot.users, window.users );
	}
}

loadUsers();
}());
