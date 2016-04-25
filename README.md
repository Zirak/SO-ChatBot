For usage info, on how to use the bot, see [here](https://github.com/Zirak/SO-ChatBot/wiki/Interacting-with-the-bot).

###Running the bot###

The bot is currently a big dangle-on script running in your browser. **Run `bookmarklet.js`** in your browser to get it up an' running. For some tips on handling the bot, see [Bot Handling](https://github.com/Zirak/SO-ChatBot/wiki/Bot-Handling).

If you wish, you can also run it headlessly on top of phantomjs and node:

* Install [phantomjs 2](http://phantomjs.org/) (yes, it has to be 2 and above). Differs from platform to platform.
* Install nightmare: `npm install nightmare`
* Edit your credentials into `run-headless.js`
* Hit the road: `env DEBUG=nightmare node run-headless.js`

###Building###

```sh
# one must first get the repo
$ git clone https://github.com/Zirak/SO-ChatBot.git
$ cd SO-ChatBot

# linting
npm run lint

# building
$ node build.js
# or
$ npm run build
```

The result will be in `master.js` and `master.min.js`

The provided `publi.sh` automagically does building, adds all changed items to commit and publishes for you:

```sh
$ ./publi.sh commit-message
```

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
