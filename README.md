You run commands by sending

    !!/commandName [commandArg0, [commandArg1, [...]]]
In a chatroom where the bot is present (cross-room support is planned.)

For example:

	!!/listcommands
Will print something like this:

	 @yourUsername Available commands:alive, die, forget, define, mdn, jquery, online, user, listcommands, get, learn

## The `learn` command

	!!/learn commandName outputPattern [inputRegex, [inputRegexFlags]]

### `commandName`
An alphanumeric string

### `outputPattern`
A string, which can contain some special variables:

`$0, $1, ..., $n` for the capture-groups you specified in `inputRegex`

Filler variables

* `$who` The name of the user who sent the message
* `$someone` The name of a random, recently active user

Message object variables, used by SO when passing messages around

* `content` Message content
* `event_type` Speaks for itself - will always be 1 (new message)
* `id` ?
* `message_id` Message ID
* `room_id` Room id
* `room_name` Room name
* `time_stamp` Do I have to explain these?
* `user_id` I mean, they're so obvious,
* `user_name` aren't they?

### `inputRegex`
Like any regular regex, except that instead of where you'd use `\`, you use `~`.
For example: `\w => ~w`, `\\d => ~~d`.

### `inputRegexFlags`
Any flags you'd give a js regex.

I'm not very good in writing README files.
