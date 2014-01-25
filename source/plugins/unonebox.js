(function () {
	"use strict";
	var unonebox = {
		enablers: ['yes','on','true','start','1','enable'], // because people are bad at reading instructions
		disablers: ['no','off','false','stop','0','disable'],// accept a wide range of values for the command
		command: function (args) {
			var state = args.toLowerCase();
			if (this.enablers.indexOf(state) !== -1) {
				this.enable();
				args.reply(' un onebox enabled ');
			} else if (this.disablers.indexOf(state) !== -1) {
				this.disable();
				args.reply(' un onebox disabled ');
			} else {
				args.reply(' That didn\'t make much sense. Please use `on` or `off` to toggle the command ');
			}
		},
		enable: function () {
			IO.register('input', this.unbox);
			bot.memory.set('unonebox-state', 'enabled');
		},
		disable: function () {
			IO.unregister('input', this.unbox);
			bot.memory.set('unonebox-state', 'disabled');
		},
		unbox: function (msgObj) {
			if (msgObj.user_id === bot.adapter.user_id) {
				var frag = document.createElement('div');
				frag.innerHTML = msgObj.content;
				var link = frag.querySelector('.onebox a');
				if (link) {
					setTimeout(function () {
						IO.xhr({
							url: '/messages/' + msgObj.message_id,
							data: fkey({
								text: link.href + ' ... '
							}),
							method: 'POST',
							complete: function (resp, xhr) {
								// TODO 
								// error checking
							}
						});
					}, 90 * 1000);
				}
			}
		}
	};
	var state = bot.memory.get('unbox-state');
	if (state && state === 'enabled') {
		unonebox.enable();
	}
	bot.addCommand({
		fun: unonebox.command.bind(unonebox),
		name: 'unonebox',
		permissions: {
			del: 'NONE'
		},
		description: 'Enable or Disable the unonebox listener' +
			' `/unonebox on|off`'
	});
}());