var list = JSON.parse( localStorage.getItem('todo') || '{}' );

var userlist = function ( usrid ) {

	var usr = list[ usrid ], toRemove = [];
	if ( !usr ) {
		usr = list[ usrid ] = [];
	}

	return {
		get : function ( count ) {
			return usr.map(function ( item, index ) {
				return '(' + (index+1) + ')' + item;
			}).join( ', ' );
		},

		add : function ( item ) {
			usr.push( item );

			return true;
		},

		remove : function ( item ) {
			toRemove.push( usr.indexOf(item) );

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
			console.log( toRemove.slice(), usr.slice() );
			usr = usr.filter(function ( item, idx ) {
				return toRemove.indexOf( idx ) === -1;
			});

			toRemove.length = 0;

			list[ usrid ] = usr;
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

var todo = function ( args, msgObj ) {
	args = parseCommandArgs( args );
	console.log( args, 'todo input' );

	if ( !args[0] ) {
		args = [ 'get' ];
	}
	var action = args[ 0 ],
		usr = userlist( msgObj.user_id ),
		items = args.slice( 1 ),
		res, ret;

	//user wants to get n items, we just want the count
	if ( action === 'get' ) {
		ret = usr.get( items[0] );

		if ( !ret ) {
			ret = 'No items on your todo.';
		}
		console.log( ret, 'todo get' );
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
			ret = 'Items added.';
		}

		console.log( ret, 'todo add' );
	}

	else if ( action === 'remove' ) {
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
			ret = 'Items removed.';
		}

		console.log( ret, 'todo remove' );
	}
	//not a valid action
	else {
		ret = 'Unidentified /todo action ' + action;
		console.log( ret, 'todo undefined' );
	}

	//save the updated list
	usr.save();
	localStorage.setItem( 'todo', JSON.stringify(list) );
	return ret;
};

bot.addCommand({
	name : 'todo',
	fun  : todo,
	permissions : {
		del : 'NONE'
	}
});
