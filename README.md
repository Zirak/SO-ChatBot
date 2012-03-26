For usage info, on how to use the bot, see [here](https://github.com/Titani/SO-ChatBot/wiki/Interacting-with-the-bot).

The bot is currently a big dangle-on script running in your browser. Run `bookmarklet.js` in your browser to get it up an' running.

To play with it yourself, there are several rules:

1. If you're fed up with the console messages, `bot.stoplog = true`
2. ***ALWAYS*** run through `build.js` (requires nodejs) after modifying things
  1. You can `node build.js no-min` to skip minification
3. In the source, `//#build fileName` is a "preprocessor" command, which is handled in `build.js`
4. You do not speak of fight-club

The main two methods of the bot API:

```javascript
//add a bot command
bot.addCommand({
    name : 'command_name',
    fun : commandFunction,

    //permissions object (can be ommitted for all-can-use, all-can-del)
    permissions : {
        use : 'NONE' /*or*/ 'ALL' /*or*/ [array of usrids],
        del : 'NONE' /*or*/ 'ALL' /*or*/ [array of usrids]
    },

    //whether the command is asynchronous or not (default false)
    async : true /*or*/ false
});

//add a listening regex and a corresponding callback
bot.listen(
    //regular expression or array of regular expressions
    pattern,

    callbackFun
);
```

Callbacks receive a single paramete, the arguments, unless they're asynchronous, in which case they receive 2 (the second being a callback to optionally use.)
