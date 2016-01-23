"use strict";
/*global module, CHAT*/
module.exports = function (bot) {
    var users = {};
    var joined = [];

    var join = function ( msgObj, cb ) {
        joined.push( msgObj.user_id );
        addInfos( cb );
    };

    bot.IO.register( 'userjoin', function userjoin ( msgObj ) {
        bot.log( msgObj, 'userjoin' );

        var user = users[ msgObj.user_id ];
        if ( !user ) {
            join( msgObj, finish );
        }
        else {
            finish( user );
        }

        function finish ( user ) {
            bot.IO.fire( 'userregister', user, msgObj.room_id );
        }
    });

    //this function throttles to give the chat a chance to fetch the user info
    // itself, and to queue up several joins in a row
    var addInfos = (function ( cb ) {
        bot.log( joined, 'user addInfos' );
        requestInfo( null, joined, cb );

        joined = [];
    }).throttle( 1000 );

    function requestInfo ( room, ids, cb ) {
        if ( !Array.isArray(ids) ) {
            ids = [ ids ];
        }

        if ( !ids.length ) {
            return;
        }

        bot.IO.xhr({
            method : 'POST',
            url : '/user/info',

            data : {
                ids : ids.join(),
                roomId : room || bot.adapter.roomid
            },
            complete : finish
        });

        function finish ( resp ) {
            resp = JSON.parse( resp );
            resp.users.forEach( addUser );
        }

        function addUser ( user ) {
            users[ user.id ] = user;
            cb( user );
        }
    }

    users.request = requestInfo;

    users.findUserId = function ( username ) {
        var ids = Object.keys( users );
        username = normaliseName( username );

        return ids.first( nameMatches ) || -1;

        function nameMatches ( id ) {
            return normaliseName( users[id].name ) === username;
        }

        function normaliseName ( name ) {
            return name.toLowerCase().replace( /\s/g, '' );
        }
    }.memoize();

    users.findUsername = (function () {
        var cache = {};

        return function ( id, cb ) {
            if ( cache[id] ) {
                finish( cache[id] );
            }
            else if ( users[id] ) {
                finish( users[id].name );
            }
            else {
                users.request( bot.adapter.roomid, id, reqFinish );
            }

            function reqFinish ( user ) {
                finish( user.name );
            }
            function finish ( name ) {
                cb( cache[id] = name );
            }
        };
    })();

    users.loadUsers = function () {
        CHAT.RoomUsers.all().forEach(function (user) {
            users[user.id] = user;
        });
    };

    return users;
};
