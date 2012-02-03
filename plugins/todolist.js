var list = JSON.parse( localStorage.getItem('todo') || '{}' );

var userlist = function ( usrid ) {

	var usr = list[ usrid ];
	if ( !usr ) {
		usr = list[ usrid ] = [];
	}

	return {
		get : function ( count ) {
			return usr.map(function ( item, index ) {
				return '(' + index + ')' + item;
			});
		},
		
		add : function ( item ) {
			usr.push( item );

			return true;
		},
		
		remove : function ( item ) {
			usr.splice( usr.indexOf(item), 1 );

			return true;
		},

		exists : function ( suspect ) {
			suspect = suspect.toLowerCase();
			return usr.some(function (item) {
				return suspect === item.toLowerCase();
			});
		}
	};
};

var todo = function ( args, msgObj ) {
	args = parseCommandArgs( args );
	console.log( args, 'todo input' );

	if ( !args.length ) {
		args = [ 'get' ];
	}
	var action = args[ 0 ],
		usr = userlist( msgObj.user_id ),
		items = args.slice( 1 ),
		res, ret;

	//user wants to get n items, we just want the count
	if ( action === 'get' ) {
		ret = usr.get( items[0] ).join( ', ' );

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
			
			if ( !usr.exists(item) ) {
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