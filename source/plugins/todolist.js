(function () {
var list = bot.memory.get( 'todo' );

var userlist = function ( usrid ) {
	var usr = list[ usrid ],
		toRemove = [];
	if ( !usr ) {
		usr = list[ usrid ] = [];
	}

	return {
		get : function ( count ) {
			return usr.slice( count ).map(function ( item, idx ) {
				return '(' + idx + ')' + item;
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
			return this.removeByIndex( idx );
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
		},

		exists : function ( suspect ) {
			suspect = suspect.toLowerCase();
			return usr.some(function ( item ) {
				return suspect === item.toLowerCase();
			});
		}
	};
}.memoize();

var actions = {
	get : function ( usr, items ) {
		//if the user didn't provide an argument, the entire thing is returned
		var ret = usr.get( items[0] );
		return ret || 'No items on your todo';
	},

	add : function ( usr, items ) {
		var ret = '';
		items.every( add );
		return ret || 'Item(s) added.';

		function add ( item ) {
			if ( usr.exists(item) ) {
				ret = item + ' already exists.';
				return false;
			}
			usr.add( item );
			return true;
		}
	},

	rm : function ( usr, items ) {
		var ret = '';
		items.every( remove );

		return ret || 'Item(s) removed.';

		function remove ( item ) {
			if ( /^\d+$/.test(item) ) {
				usr.removeByIndex( Number(item) );
			}
			else if ( !usr.exists(item) ) {
				ret = item + ' does not exist.';
				return false;
			}
			else {
				usr.remove( item );
			}

			return true;
		}
	}
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
		ret;

	if ( actions[action] ) {
		ret = actions[ action ]( usr, items );
		bot.log( ret, '/todo ' + action );
	}
	else {
		ret = 'Unidentified /todo action ' + action;
		bot.log( ret, '/todo unknown' );
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
		'`rm items|indices` removes items specified by indice or content'
});

}());
