First, the most important thing:

## Favour design over speed ##

The bottleneck will always be the network operations. Unless you're doing something insanely stupid, you will not be able to create performence issues. As such, feel free to go wild on memory and CPU. Use closures all you want, write costly event handlers, don't optimise, but whatever you do - *clarity is God*.

As an extension of that, if code A is longer than code B but A is cleaner and more easily understood, prefer A. It doesn't matter if the difference is 1 line or 10 lines (see [Syntactical Anomalies](#syntactical-anomalies) below).

For those who want a definition of how fast the bot should be: if it handles 1 command per second, sans network operations, I'm happy. This'll be a difficult limit to reach.

Now to the lesser stuff:

## Whitespace ##

Use 4 spaces for indentation. Tabs are better, but our editing tools are not meant to be good.

Object literals' keys should not be wrapped in quotes unless you have to (why would you?), and the colon be padded on both sites:

    var obj = {
        foo : 4,
        bar : 5
    };

The whitespace rules are a bit weird, so I apologise in advance. I wrote the bot in a simpler time, I repent now. The basic rule is that you pad any kind of brace and bracket, if it's the outermost one. Nested ones are not padded, and so are empties:

    var empty = [];
    foo();

    [ 0, 1, 2 ]
    if ( foo.bar() ) { ... }

    [ 0, [1], [2] ]
    if ( foo.bar(4) ) { ... }

If you begin a new line, you can consider it as "erasing" that memory:

    [
        0,
        [ 1 ],
        2
    ]

But the original outermost one should still be padded:

    cuz(
        foo.bar( 4 ) )

This is a bit of a mess, and if anyone wants to reformat to a saner style, feel free.

If you introduce trailing whitespace, I will put you on a stick and slowly roast you. Also, ensure a newline at EOF you piece of scum.

## Primitives ##

Don't use object wrappers (`new Boolean` etc), write the real values. Strings should also be surrounded with single quotes. If you can and it makes sense in the context, use scientific notation for numbers.

## Syntactical Anomalies ##

Semicolons are not dropped. Use them as if js did not have ASI. Comma-first is also discouraged. Trailing commas are fine.

    var a = 4,
        b = 5;
    var arr = [
        0,
        1,
        2,
    ];

In addition, disfavour operator tricks. This includes, but is not limited, to:

    //bad
    +function () {}()
    //good
    (function () {})()

    //bad
    x|0
    //good
    Math.floor(x)

    //bad
    if ( ~~arr.indexOf(i) ) { ... }
    //good
    if ( arr.indexOf(i) < 0 ) { ... }

As an addendum to the last example, it might be better to define a method to do it for you on `Array.prototype`. See [Extending Natives](#extending_natives).

## Variables ##

Use `camelCase` for variable names, `PascalCase` for constructors (this means any object-generating object, not necessarily a `new PascalCase` constructor), `SHOUT_CASE` for constants (why would you have constants?).

It goes without saying that you name variables well (unlike the examples in this section).

Variable declarations should be grouped logically, and placed close to usage. This goes contrary to Crockford's advice to place them at the top of the function, and the rationale is that if you're trying to use a variable before you declared it, you're a bad person already.

    //perfectly fine
    var a = 4,
        b = 5;
    //stuff with a and b
    var c = 6;
    //more stuff

    //a sign that you're doing something wrong
    var a = 4,
        b = 5;
    //stuff with a, b and c
    var c = 6;
    //more stuff

Besides, if you can't see all variable declarations in the function at a glance, the function may be too big. See [Writing Functions](#writing-functions).

Objects and arrays should have their own variable declaration if they're not empty or trivial:

    //ok
    var a = 4,
        b = {};
    var c = {
        foo : 'bar'
    };

## The Pillows ##

A good band, you should give them a listen.

## Writing Functions ##

Try and break the code to as many functions as you can. They should not be long, they should not be complex. I don't want to give a definition for "long" because I hope you're not an idiot. Feel free to nest functions, but do so with caution - instead, you may want to write an object containing these functions.

Also try avoiding inline, anonymous functions:

    //ok, but think it over
    return arr.every(function (item) { ... })

    //a bit better
    return arr.every(function checkSomething (item) { ... });

    //but what about...
    return arr.every(checkSomething)
    function checkSomething (item) { ... }

Sometimes you might not want to use a function declaration where one can be used. That's your choice: you're the programmer, I'm just a style guide. Just remember to think.

Prefer good design over length and execution speed. See the first point.

## Extending Natives ##

It's okay to put stuff on natives (`Date`, `Array.prototype`, etc). Think twice before you do it, and shove it into `source/util.js` (maybe that file should be split up...)

## Loops ##

Try not to use them. ES5 array methods cover most of the cases. If one isn't covered, per [the Extending Natives section](#extending-natives), you might want to add it. If it's not an array thing, try and make it one, and if it doesn't fit,well, use a loop to your heart's content.

### Why? ###

Loops are ambiguous. Array methods, like all functions, have a name.
