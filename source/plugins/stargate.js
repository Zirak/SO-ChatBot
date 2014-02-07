bot.listen( /(which |what |give me a )?stargate|sg1( episode)?/i, function ( msg ) {
	//I have seperated it out so I can add Atlantis in later.
	var episodes={"SG1":{"Season 1":["Children of the Gods","The Enemy Within","Emancipation","The Broca Divide","The First Commandment","Brief Candle","Cold Lazarus","Thor's Hammer","The Torment of Tantalus","Bloodlines","Fire and Water","The Nox","Hathor","Singularity","Cor-ai","Enigma","Tin Man","Solitudes","There But for the Grace of God ","Politics ","Within the Serpent's Grasp "],"Season 2":["The Serpent's Lair ","In the Line of Duty","Prisoners","The Gamekeeper","Need","Thor's Chariot","Message in a Bottle",
"Family","Secrets","Bane","The Tok'ra","The Tok'ra (Part 2)","Spirits","Touchstone","A Matter of Time","The Fifth Race","Serpent's Song","Holiday","One False Step","Show and Tell","1969","Out of Mind "],"Season 3":["Into the Fire ","Seth","Fair Game","Legacy","Learning Curve","Point of View","Deadman Switch","Demons","Rules of Engagement","Forever in a Day","Past and Present","Jolinar's Memories ","The Devil You Know ","Foothold","Pretense","Urgo","A Hundred Days","Shades of Grey","New Ground","Maternal Instinct",
"Crystal Skull","Nemesis "],"Season 4":["Small Victories ","The Other Side","Upgrades","Crossroads","Divide and Conquer","Window of Opportunity","Watergate","The First Ones","Scorched Earth","Beneath the Surface","Point of No Return","Tangent","The Curse","The Serpent's Venom","Chain Reaction","2010","Absolute Power","The Light","Prodigy","Entity","Double Jeopardy ","Exodus "],"Season 5":["Enemies ","Threshold ","Ascension","The Fifth Man","Red Sky","Rite of Passage","Beast of Burden","The Tomb",
"Between Two Fires","2001","Desperate Measures","Wormhole X-Treme!","Proving Ground","48 Hours","Summit ","Last Stand ","Fail Safe","The Warrior","Menace","The Sentinel","Meridian","Revelations"],"Season 6":["Redemption","Redemption (Part 2)","Descent","Frozen","Nightwalkers","Abyss","Shadow Play","The Other Guys","Allegiance","Cure","Prometheus ","Unnatural Selection ","Sight Unseen","Smoke & Mirrors","Paradise Lost","Metamorphosis","Disclosure","Forsaken","The Changeling","Memento","Prophecy","Full Circle"],
"Season 7":["Fallen ","Homecoming ","Fragile Balance","Orpheus","Revisions","Lifeboat","Enemy Mine","Space Race","Avenger 2.0","Birthright","Evolution","Evolution (Part 2)","Grace","Fallout","Chimera","Death Knell","Heroes","Heroes (Part 2)","Resurrection","Inauguration","Lost City","Lost City (Part 2)"],"Season 8":["New Order","New Order (Part 2)","Lockdown","Zero Hour","Icon","Avatar","Affinity","Covenant","Sacrifices","Endgame","Gemini","Prometheus Unbound","It's Good to Be King","Full Alert",
"Citizen Joe","Reckoning","Reckoning (Part 2)","Threads","Moebius","Moebius (Part 2)"],"Season 9":["Avalon","Avalon (Part 2)","Origin ","The Ties That Bind","The Powers That Be","Beachhead","Ex Deus Machina","Babylon","Prototype","The Fourth Horseman","The Fourth Horseman (Part 2)","Collateral Damage","Ripple Effect","Stronghold","Ethon","Off the Grid","The Scourge","Arthur's Mantle","Crusade","Camelot "],"Season 10":["Flesh and Blood ","Morpheus","The Pegasus Project","Insiders","Uninvited","200",
"Counterstrike","Memento Mori","Company of Thieves","The Quest","The Quest (Part 2)","Line in the Sand","The Road Not Taken","The Shroud","Bounty","Bad Guys","Talion","Family Ties","Dominion","Unending"]}};

	//no mention of episode, 5% chance of getting the movie
	if ( msg.indexOf('episode') === -1 && Math.random() < 0.05 ) {
		return 'Stargate The Movie';
	}
	
	var r = function( arr ) {
		var i = Math.floor(Math.random() * arr.length);
		return {
			text: arr[i],
			index: i
		};
	}
	
	var season = r(Object.keys(episodes["SG1"]));
	var episode = r(episodes["SG1"][season.text]);
	
	return '{0} Episode #{1} - {2}'.supplant(season.text, episode.index+1, episode.text);
});