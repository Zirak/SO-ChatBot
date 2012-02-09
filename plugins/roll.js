//infix operator-precedence parser, supporting d, + and -, where d is a dice
// roll
var parse = (function () {

//the operators we deal with and their precedence
var operators = {
	'+' : 1,
	'-' : 1,
	'd' : 2
};

//we don't care about whitespace. well, most whitespace
var whitespace = {
	' ' : true,
	'\t' : true
};

var callbacks = {
	'+' : function ( a, b ) {
		return a + b;
	},
	'-' : function ( a, b ) {
		return a - b;
	},
	'd' : function ( rolls, sides, rollsSoFar ) {
		if ( rolls > 100 || sides > 100 ) {
			throw new Error( 'Maximum roll and side count is 100' );
		}

		var ret = 0, roll;
		while ( rolls-- ) {
			roll = Math.floor( Math.random() * sides ) + 1;

			ret += roll;
			rollsSoFar.push( roll );
		}

		return ret;
	}
};

//returns an object:
// total => result of all dice rolls and arithmetic operations
// rolls => array of results of each individual dice roll
return function ( source ) {
	var numberStack = [],
		operatorStack = [],
		rolls = [];

	var token, last;
	for ( var pos = 0, len = source.length; pos < len; ++pos ) {
		//skip teh noobz whitespace
		if ( whitespace.hasOwnProperty(source[pos]) ) {
			continue;
		}

		token = nextToken();

		if ( token.type === 'number' ) {
			if ( token.value)
			numberStack.push( token.value );
		}

		else if ( token.type === 'operator' ) {
			last = operatorStack[ operatorStack.length - 1 ];

			//check for things like 1d2d3, which aren't valid
			if ( last && token.value === 'd' && last.value === 'd' ) {
				throw new Error( 'Unexpected unchainable operator d' );
			}

			if (
				//previous operator is more important than us
				(last && token.precedence < last.precedence) ||
				//or, we're about to finish
				pos + 1 === len
			) {
				operate();
			}

			operatorStack.push( token );
		}
	}

	//by now, operatorStack will only have operators of equal, lowest
	// precedence, so we just need to go over the operator stack and execute
	while ( operatorStack.length ) {
		operate();
	}

	//the last number in the stack is the result
	return {
		total : numberStack[ 0 ],
		rolls : rolls
	};

	//get the next token
	function nextToken () {
		var ch = source[ pos ];
		var ret = {
			type : null,
			value : ch
		},
			res;

		//have we overflowed, while looking for something else?
		if ( pos >= len ) {
			throw new Error( 'Unexpected end of input' );
		}

		//is it a digit?
		else if ( ch >= 0 && ch < 10 ) {
			ret.type = 'number';
			res = getNumber();

			pos += res.length - 1;
			ret.value = res.value;
		}

		//is it an operator?
		else if ( operators.hasOwnProperty(ch) ) {
			ret.type = 'operator';
			ret.precedence = operators[ ch ];
		}


		return ret;
	}

	function getNumber () {
		var offset = 0, num = '', ch;

		//keep eating digits until we find a non-digit
		while ( (ch = source[pos+offset]) >= 0 && ch < 10 ) {
			num += ch;
			offset++;
		}

		return {
			value : Number( num ),
			length : offset
		};
	}

	function operate () {
		var couplet = popTwo();
		couplet.push( rolls );

		if ( couplet.indexOf(undefined) > -1 ) {
			throw new Error( 'Incomplete expression; expected number' );
		}

		numberStack.push(
			callbacks[ operatorStack.pop().value ].apply( null, couplet )
		);
	}

	function popTwo () {
		//because we're going left->right, something like:
		// 4 + 1
		//will be displayed in the stack like:
		// [1, 4]
		//so after grabbing the topmost numbers, we need to flip them
		return [ numberStack.pop(), numberStack.pop() ].reverse();
	}
};
}());

//now, to the command itself...
var roll = function ( args ) {
	if ( !/^[\d\s\+\-d]+$/.test(args) ) {
		return 'Invalid /roll argument; use `/help roll` for help';
	}

	var res = parse( args );

	return res.rolls.join() + ' => ' + res.total;
};

bot.addCommand({
	name : 'roll',
	fun : roll,
	permissions : {
		del : 'NONE'
	},
	description : 'Roll dice in DnD notation. `MdN` rolls M N-sided dice. ' +
		'`MdN+X` rolls as said above, and adds X to the result. ' +
		'`MdN-X` does the same, but subtracts x. ' +
		'X can also be a die roll: `MdN+XdY`, or `MdN-XdY`, and so forth.'
});
