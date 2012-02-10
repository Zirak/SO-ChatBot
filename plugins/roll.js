//infix operator-precedence parser
//also supports a d operator - a dice roll
var parse = (function () {

//we don't care about whitespace. well, most whitespace
var whitespace = {
	' ' : true,
	'\t' : true
};

//the operators we deal with and their precedence
var operators = {
	'+' : 1,
	'-' : 1,
	'*' : 2,
	'/' : 2,
	'd' : 3
};

var callbacks = {
	'+' : function ( a, b ) {
		return a + b;
	},
	'-' : function ( a, b ) {
		return a - b;
	},
	'*' : function ( a, b ) {
		return a * b;
	},
	'/' : function ( a, b ) {
		if ( b === 0 ) {
			throw new Error( 'Division by 0' );
		}
		return a / b;
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

	//the tokenizer
	var token, last;
	for ( var pos = 0, len = source.length; pos < len; ++pos ) {
		//skip teh noobz whitespace
		if ( whitespace.hasOwnProperty(source[pos]) ) {
			continue;
		}

		token = nextToken();

		if ( token.type === 'number' ) {
			numberStack.push( token.value );
		}

		else if ( token.type === 'operator' ) {
			last = operatorStack[ operatorStack.length - 1 ];

			//check for things like 1d2d3, which aren't valid
			if ( last && token.value === 'd' && last.value === 'd' ) {
				throw new Error(
					'Unexpected unchainable operator d at ' + pos
				);
			}

			operatorStack.push( token );
		}
	}

	//the "executer"
	while ( operatorStack.length ) {
		operatorStack.forEach(function ( token, index ) {
			last = operatorStack[ index - 1 ];

			//last one is more important than we are
			if ( last && last.precedence > token.precedence ) {
				//execute it
				operate( index - 1 );
			}
			//we're about to finish and the last one isn't as all-mighty as we
			// thought
			else if ( index + 1 === operatorStack.length ) {
				//execute za operator!
				operate( index );
			}
		});
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

		//Y U TROLLZ!?!?
		else {
			throw new Error( 'Invalid character ' + ch + ' at ' + pos );
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

		if ( num.length === 0 ) {
			throw new Error(
				'Incomplete operation: Expected number at ' + pos
			);
		}

		return {
			value : Number( num ),
			length : offset
		};
	}

	function operate ( index ) {
		if ( typeof index === 'undefined' ) {
			index = operatorStack.length - 1;
		}

		var couplet = numberStack.slice( index, index + 2 );
		couplet.push( rolls );

		var method = callbacks[ operatorStack.splice(index, 1)[0].value ];
		numberStack.splice( index, 2, method.apply(null, couplet) );
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
	description : [
		'Roll dice in DnD notation. `MdN` rolls `M` `N`-sided dice',
		'`MdN+X` rolls as said above, and adds `X` to the result'  ,
		'You can use any of the four arithmetic operators +-*/,'   ,
		'`X` can also be a die roll: `MdN*XdY` for example'
	].join( '. ' )
});
