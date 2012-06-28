(function () {
var list = JSON.parse( localStorage.getItem('bot_todo') || '{}' ),

	userCache = Object.create( null );

var userlist = function ( usrid ) {
	if ( userCache[usrid] ) {
		return userCache[usrid];
	}

	var usr = list[ usrid ], toRemove = [];
	if ( !usr ) {
		usr = list[ usrid ] = [];
	}

	return userCache[ usrid ] = {
		get : function ( count ) {
			return usr.slice( count ).map(function ( item, idx ) {
				return '(' + (idx+1) + ')' + item;
			}).join( ', ' );
		},

		add : function ( item ) {
			usr.push( item );
			return true;
		},

		remove : function ( item ) {
			var idx = usr.indexOf( item );
			if ( idx === -1 ) {
				return false;
			}
			toRemove.push( idx );

			return true;
		},
		removeByIndex : function ( idx ) {
			if ( idx >= usr.length ) {
				return false;
			}
			toRemove.push( idx );

			return true;
		},

		save : function () {
			bot.log( toRemove.slice(), usr.slice() );

			usr = usr.filter(function ( item, idx ) {
				return toRemove.indexOf( idx ) === -1;
			});

			toRemove.length = 0;

			list[ usrid ] = usr;
			localStorage.bot_todo = JSON.stringify( list );
		},

		exists : function ( suspect ) {
			suspect = suspect.toLowerCase();
			//it could be re-written as:
			//usr.invoke( 'toLowerCase' ).indexOf( suspect ) > -1
			return usr.some(function (item) {
				return suspect === item.toLowerCase();
			});
		}
	};
};

var todo = function ( args ) {
	var props = args.parse();
	bot.log( props, 'todo input' );

	if ( !props[0] ) {
		props = [ 'get' ];
	}
	var action = props[ 0 ],
		usr = userlist( args.get('user_id') ),
		items = props.slice( 1 ),
		res, ret;

	//user wants to get n items, count is the first arg
	if ( action === 'get' ) {
		//if the user didn't provide an argument, the entire thing is returned
		ret = usr.get( items[0] );

		if ( !ret ) {
			ret = 'No items on your todo.';
		}
		bot.log( ret, 'todo get' );
	}

	else if ( action === 'add' ) {
		res = items.every(function ( item ) {

			if ( usr.exists(item) ) {
				ret = item + ' already exists.';
				return false;
			}
			else {
				usr.add( item );
			}

			return true;
		});

		if ( res ) {
			ret = 'Item(s) added.';
		}

		bot.log( ret, 'todo add' );
	}

	else if ( action === 'rem' ) {
		res = items.every(function ( item ) {

			if ( /^\d+$/.test(item) ) {
				usr.removeByIndex( Number(item - 1) );
			}
			else if ( !usr.exists(item) ) {
				ret = item + ' does not exist.';
				return false;
			}
			else {
				usr.remove( item );
			}

			return true;
		});

		if ( res ) {
			ret = 'Item(s) removed.';
		}

		bot.log( ret, 'todo rem' );
	}
	//not a valid action
	else {
		ret = 'Unidentified /todo action ' + action;
		bot.log( ret, 'todo undefined' );
	}

	//save the updated list
	usr.save();

	return ret;
};

bot.addCommand({
	name : 'todo',
	fun  : todo,
	permissions : {
		del : 'NONE'
	},
	description : 'Your personal todo list. ' +
		'`get [count]` retrieves everything or count items. ' +
		'`add items` adds items to your todo list (make sure items ' +
			'with spaces are wrapped in quotes) ' +
		'`rem items|indices` removes items specified by indice or content'
});

}());
