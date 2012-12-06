For usage info, on how to use the bot, see [here](https://github.com/Zirak/SO-ChatBot/wiki/Interacting-with-the-bot).

###Running the bot###
The bot is currently a big dangle-on script running in your browser. **Run `bookmarklet.js`** in your browser to get it up an' running.

###Building###
(For build minification, install [uglify-js2](https://github.com/mishoo/UglifyJS2))

```sh
#one must first get the repo
$ git clone git://github.com/Zirak/SO-ChatBot.git
$ cd SO-ChatBot

#to build something
$ node build.js
#or, to skip minification
$ node build.js no-min
#or, to not add the adapter
$ node build.js no-adapter
#you can combine the two options above in whichever order
```
The result will be in `master.js` and `master.min.js`

###The Bot API###
(, a very short explanation of a limited subset of)

For a real cover, check the source code or [this wiki page](https://github.com/Zirak/SO-ChatBot/wiki/Plugin-writing) or `console.log(bot)`. Should be straightforward.

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
