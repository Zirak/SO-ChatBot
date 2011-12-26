IO.in.receive({
	content : "!Zirak /learn {&quot;name&quot;:&quot;help&quot;, &quot;input&quot;: &quot;.*&quot;, &quot;output&quot;: &quot;www.google.com&quot;}",
	user_name : 'moop'
}).tick();

IO.out.flush();