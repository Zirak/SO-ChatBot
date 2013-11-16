(function () {
	var cmd = {
		description : 'Lists commands. `/listcommands [page=0]`',
		fun : listcommands,
		name : 'listcommands',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	function listcommands ( args ) {
		var commands = Object.keys( bot.commands ),
			//TODO: only call this when commands were learned/forgotten since last
			partitioned = partition( commands ),

			valid = /^(\d+|$)/.test( args.content ),
			page = Number( args.content ) || 0;

		if ( page >= partitioned.length || !valid ) {
			return args.codify( [
				'StackOverflow: Could not access page.',
				'IndexError: index out of range',
				'java.lang.IndexOutOfBoundsException',
				'IndexOutOfRangeException'
			].random() );
		}

		var ret = partitioned[ page ].join( ', ' );

		return ret + ' (page {0}/{1})'.supplant( page, partitioned.length-1 );
	};

	function partition ( list, maxSize ) {
		var size = 0, last = [];
		maxSize = maxSize || 480; //buffer zone, actual max is 500

		var ret = list.reduce(function partition ( ret, item ) {
			var len = item.length + 2; //+1 for comma, +1 for space

			if ( size + len > maxSize ) {
				ret.push( last );
				last = [];
				size = 0;
			}
			last.push( item );
			size += len;

			return ret;
		}, []);

		if ( last.length ) {
			ret.push( last );
		}

		return ret;
	};
}());
