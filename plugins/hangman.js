var randomWord = (function () {
	var words = ['abbreviation','abbreviations','abettor','abettors','abilities','ability','abrasion','abrasions','abrasive','abrasives','absence','absences','abuse','abuser','abusers','abuses','acceleration','accelerations','acceptance','acceptances','acceptor','acceptors','access','accesses','accessories','accessory','accident','accidents','accommodation','accomplishment','accomplishments','accord','accordance','account','accountabilities','accountability','accounts','accrual','accruals','accruement','accumulation','accumulations','accuracy','accusation','accusations','acid','acids','acquisition','acquisitions','acquittal','acquittals','acre','acres','acronym','acronyms','act','action','actions','activities','activity','acts','adaption','adaptions','addition','additions','additive','additives','address','addressee','addressees','addresses','adherence','adherences','adhesive','adhesives','adjective','adjectives','adjustment','adjustments','administration','administrations','administrator','administrators','admiral','admirals','admiralties','admiralty','admission','admissions','advance','advancement','advancements','advances','advantage','advantages','adverb','adverbs','advertisement','advertisements','adviser','advisers','affair','affairs','affiant','affiants','afternoon','afternoons','age','agent','agents','ages','aggravation','aggravations','agreement','agreements','aid','aids','aim','aims','air','aircraft','airfield','airfields','airplane','airplanes','airport','airports','airs','airship','airships','airspeed','airspeeds','alarm','alarms','alcohol','alcoholic','alcoholics','alcoholism','alcohols','alert','alerts','algebra','algorithm','algorithms','alias','aliases','alibi','alibis','alignment','alignments','alkalinity','allegation','allegations','alley','alleys','allies','allocation','allocations','allotment','allotments','allowance','allowances','alloy','alloys','ally','alphabet','alphabets','alternate','alternates','alternation','alternations','alternative','alternatives','altimeter','altimeters','altitude','altitudes','aluminum','aluminums','ambiguity','americans','ammonia','ammunition','amount','amounts','amperage','amperages','ampere','amperes','amplifier','amplifiers','amplitude','amplitudes','amusement','amusements','analog','analogs','analyses','analysis','analyst','analysts','analyzer','analyzers','anchor','anchors','angle','angles','animal','animals','annex','annexs','answer','answers','antenna','antennas','anthem','anthems','anticipation','apostrophe','apostrophes','apparatus','apparatuses','appeal','appeals','appearance','appearances','appellate','apple','apples','applicant','applicants','application','applications','apportionment','apportionments','appraisal','appraisals','apprehension','apprehensions','apprenticeship','apprenticeships','approach','approaches','appropriation','appropriations','approval','approvals','april','apron','aprons','aptitude','aptitudes','arc','arch','arches','architecture','arcs','area','areas','argument','arguments','arithmetic','arm','armament','armaments','armful','armfuls','armies','armor','armories','armors','armory','arms','army','arraignment','arraignments','arrangement','arrangements','array','arrays','arrest','arrests','arrival','arrivals','arrow','arrows','art','article','articles','artilleries','artillery','arts','assault','assaults','assemblies','assembly','assignment','assignments','assistance','assistant','assistants','associate','associates','asterisk','asterisks','athwartship','atmosphere','atmospheres','atom','atoms','attachment','attachments','attack','attacker','attackers','attempt','attempts','attention','attesting','attitude','attitudes','attorney','attorneys','attraction','attractions','attribute','attributes','audit','auditor','auditors','audits','augmentation','augmentations','august','authorities','authority','authorization','authorizations','auto','automation','automobile','automobiles','autos','auxiliaries','average','averages','aviation','award','awards','ax','axes','axis','azimuth','azimuths','babies','baby','back','background','backgrounds','backs','backup','backups','badge','badges','bag','bags','bail','bailing','bails','balance','balances','ball','ballast','balloon','balloons','balls','band','bandage','bandages','bands','bang','bangs','bank','banks','bar','barge','barges','barometer','barometers','barrel','barrels','barrier','barriers','bars','base','baseline','basement','basements','bases','basics','basin','basins','basis','basket','baskets','bat','batch','batches','bath','bather','baths','bats','batteries','battery','battle','battles','battleship','battleships','baud','bauds','bay','bays','beach','beaches','beacon','beacons','bead','beads','beam','beams','bean','beans','bear','bearings','bears','beat','beats','bed','beds','beginner','beginners','behavior','behaviors','being','beings','belief','beliefs','bell','bells','belt','belts','bench','benches','bend','bends','benefit','benefits','berries','berry','berth','berthings','berths','bet','bets','bias','biases','bigamies','bigamy','bilge','bill','billet','billets','bills','bin','binder','binders','binoculars','bins','birth','births','bit','bite','bites','bits','blackboard','blackboards','blade','blades','blank','blanket','blankets','blanks','blast','blasts','blaze','blazes','blindfold','blindfolds','blink','blinks','block','blocks','blood','blot','blots','blow','blower','blowers','blows','blueprint','blueprints','blur','blurs','board','boards','boat','boats','boatswain','boatswains','bodies','body','boil','boiler','boilers','boils','bolt','bolts','bomb','bombs','bond','bonds','bone','bones','book','books','boom','booms','boost','boosts','boot','boots','bore','boresight','boresights','bottle','bottles','bottom','bottoms','bow','bowl','bowls','bows','box','boxcar','boxcars','boxes','boy','boys','brace','braces','bracket','brackets','braid','braids','brain','brains','brake','brakes','branch','branches','brass','breach','breaches','bread','breads','break','breakdown','breakdowns','breaks','breast','breasts','breath','breaths','breeze','breezes','brick','bricks','bridge','bridges','briefings','brightness','bristle','bristles','broadcasts','bronze','brook','brooks','broom','brooms','brother','brothers','brush','brushes','bubble','bubbles','bucket','buckets','buckle','buckles','bud','budget','budgets','buds','buffer','buffers','builder','builders','building','buildings','bulb','bulbs','bulk','bulkhead','bulkheads','bullet','bullets','bump','bumps','bunch','bunches','bundle','bundles','bunk','bunks','buoy','buoys','bureau','bureaus','burglaries','burglary','burn','burns','bus','buses','bush','bushel','bushels','bushes','bushing','bushings','business','businesses','butt','butter','butters','button','buttons','butts','buy','buys','buzz','buzzer','buzzers','buzzes','bypass','bypasses','byte','bytes','cab','cabinet','cabinets','cable','cables','cabs','cage','cages','cake','cakes','calculation','calculations','calculator','calculators','calendar','calendars','caliber','calibers','calibration','calibrations','call','calls','calorie','calories','cam','camera','cameras','camp','camps','cams','canal','canals','candidate','candidates','candle','candles','cane','canister','canisters','cannon','cannons','cans','canvas','canvases','canyon','canyons','cap','capabilities','capability','capacitance','capacitances','capacities','capacitor','capacitors','capacity','cape','capes','capital','capitals','caps','capstan','capstans','captain','captains','capture','captures','car','carbon','carbons','carburetor','carburetors','card','cardboard','cards','care','career','careers','carelessness','cares','cargo','cargoes','carload','carloads','carpet','carpets','carriage','carriages','carrier','carriers','cars','cart','cartridge','cartridges','carts','case','cases','cash','cashier','cashiers','casts','casualties','casualty','catalog','catalogs','catch','catcher','catchers','catches','categories','category','cathode','cathodes','cause','causes','caution','cautions','cave','caves','cavities','cavity','ceiling','ceilings','cell','cellar','cellars','cells','cement','cements','cent','center','centerline','centerlines','centers','centimeter','centimeters','cents','ceramics','ceremonies','ceremony','certificate','certificates','certification','certifications','chain','chains','chair','chairman','chairmen','chairperson','chairpersons','chairs','chairwoman','chairwomen','chalk','chalks','challenge','challenges','chamber','chambers','chance','chances','change','changes','channel','channels','chaplain','chaplains','chapter','chapters','character','characteristic','characteristics','characters','charge','charges','chart','charts','chase','chases','chattel','chattels','chatter','cheat','cheater','cheaters','cheats','check','checker','checkers','checkout','checkouts','checkpoint','checkpoints','checks','cheek','cheeks','cheese','cheeses','chemical','chemicals','chemistry','chest','chests','chief','chiefs','child','children','chill','chills','chimney','chimneys','chin','chins','chip','chips','chit','chits','chock','chocks','choice','choices','choke','chokes','church','churches','churn','churns','circle','circles','circuit','circuitries','circuitry','circuits','circulation','circulations','circumference','circumferences','circumstance','circumstances','cities','citizen','citizens','city','civilian','civilians','claim','claims','clamp','clamps','clang','clangs','clap','claps','class','classes','classification','classifications','classroom','classrooms','claw','claws','clay','cleanliness','cleanser','cleansers','clearance','clearances','cleat','cleats','clericals','clerk','clerks','click','clicks','cliff','cliffs','clip','clips','clock','clocks','closure','closures','cloth','clothes','clothing','cloths','cloud','cloudiness','clouds','club','clubs','clump','clumps','coal','coals','coast','coasts','coat','coating','coats','cockpit','cockpits','code','coder','coders','codes','coil','coils','coin','coins','colds','collar','collars','collection','collections','collector','collectors','college','colleges','collision','collisions','colon','colons','color','colors','column','columns','comb','combat','combatant','combatants','combination','combinations','combs','combustion','comfort','comforts','comma','command','commander','commanders','commands','commas','commendation','commendations','comment','comments','commission','commissions','commitment','commitments','committee','committees','communication','communications','communities','community','companies','company','comparison','comparisons','compartment','compartments','compass','compasses','compensation','compensations','competition','competitions','compiler','compilers','complaint','complaints','complement','complements','completion','completions','complexes','compliance','compliances','component','components','composites','composition','compositions','compounds','compress','compresses','compression','compressions','compressor','compressors','compromise','compromises','computation','computations','computer','computers','concentration','concentrations','concept','concepts','concern','concerns','concurrence','condensation','condensations','condenser','condensers','condition','conditions','conduct','conductor','conductors','conducts','cone','cones','conference','conferences','confession','confessions','confidence','confidences','configuration','configurations','confinement','confinements','conflict','conflicts','confusion','confusions','congress','conjecture','conjectures','conjunction','conjunctions','conn','connection','connections','consequence','consequences','consideration','console','consoles','consolidation','conspiracies','conspiracy','constitution','construction','contact','contacts','container','containers','contamination','contempt','content','contention','contents','continuity','contraband','contract','contracts','contrast','contrasts','contribution','contributions','control','controls','convenience','conveniences','convention','conventions','conversion','conversions','convulsion','convulsions','coordinate','coordinates','coordination','coordinations','coordinator','coordinators','copies','copper','copy','cord','cords','core','cores','cork','corks','corner','corners','corps','correction','corrections','correlation','correlations','correspondence','corrosion','cosal','cosals','costs','cot','cots','cotton','cottons','cough','coughs','counsel','counselor','counselors','counsels','count','counter','countermeasure','countermeasures','counters','countries','country','counts','couple','couples','couplings','course','courses','court','courtesies','courtesy','courts','cover','coxswain','coxswains','crack','cracks','cradle','cradles','craft','crafts','cramp','cramps','crank','cranks','crash','crashes','crawl','credibility','credit','credits','creek','creeks','crew','crewmember','crewmembers','crews','cries','crime','crimes','crop','crops','cross','crosses','crowd','crowds','crown','crowns','cruise','cruiser','cruisers','cruises','crust','crusts','cry','crystal','crystals','cube','cubes','cuff','cuffs','cup','cupful','cupfuls','cups','cure','cures','curl','curls','currencies','currency','currents','curtain','curtains','curvature','curvatures','curve','curves','cushion','cushions','custodian','custodians','custody','custom','customer','customers','customs','cuts','cycle','cycles','cylinder','cylinders','dab','dabs','dam','damage','damages','dams','danger','dangers','dare','dares','dart','darts','dash','data','date','dates','daughter','daughters','davit','davits','dawn','dawns','day','daybreak','days','daytime','deal','dealer','dealers','deals','dears','death','deaths','debit','debits','debris','debt','debts','decay','december','decibel','decibels','decimals','decision','decisions','deck','decks','decoder','decoders','decontamination','decoration','decorations','decrease','decreases','decrement','decrements','dedication','dedications','deduction','deductions','deed','deeds','default','defaults','defeat','defeats','defect','defection','defections','defects','defense','defenses','deficiencies','definition','definitions','deflector','deflectors','degree','degrees','delay','delays','delegate','delegates','deletion','deletions','delight','delights','delimiter','delimiters','deliveries','delivery','democracies','democracy','demonstration','demonstrations','densities','density','dent','dents','department','departments','departure','departures','dependence','dependencies','dependents','depletion','depletions','deployment','deployments','deposit','deposition','depositions','deposits','depot','depots','depth','depths','deputies','deputy','dereliction','description','descriptions','desert','deserter','deserters','desertion','desertions','deserts','designation','designations','designator','designators','desire','desires','desk','desks','destination','destinations','destroyer','destroyers','destruction','detachment','detachments','detail','details','detection','detent','detention','detentions','detents','detonation','detonations','development','developments','deviation','deviations','device','devices','dew','diagnoses','diagnosis','diagnostics','diagonals','diagram','diagrams','dial','dials','diameter','diameters','diamond','diamonds','diaphragm','diaphragms','diaries','diary','dictionaries','dictionary','diesel','diesels','difference','differences','difficulties','difficulty','digestion','digit','digits','dimension','dimensions','diode','diodes','dioxide','dioxides','dip','dips','direction','directions','directive','directives','directories','directory','dirt','disabilities','disability','disadvantage','disadvantages','disassemblies','disassembly','disaster','disasters','discard','discards','discharge','discharges','discipline','disciplines','discontinuance','discontinuances','discontinuation','discontinuations','discount','discounts','discoveries','discovery','discrepancies','discrepancy','discretion','discrimination','discriminations','discussion','discussions','disease','diseases','disgust','dish','dishes','disk','disks','dispatch','dispatcher','dispatchers','dispatches','displacement','displacements','display','displays','disposal','dissemination','dissipation','distance','distances','distortion','distortions','distress','distresses','distribution','distributions','distributor','distributors','district','districts','ditch','ditches','ditto','dittos','dive','diver','divers','dives','divider','dividers','division','divisions','dock','dockings','docks','document','documentation','documentations','documents','dollar','dollars','dollies','dolly','dominion','dominions','donor','donors','door','doorknob','doorknobs','doors','doorstep','doorsteps','dope','dopes','dose','doses','dot','dots','doubt','downgrade','downgrades','dozen','dozens','draft','drafts','drag','drags','drain','drainage','drainer','drainers','drains','drawer','drawers','drawings','dress','dresses','drift','drifts','drill','driller','drillers','drills','drink','drinks','drip','drips','drive','driver','drivers','drives','drop','drops','drug','drugs','drum','drums','drunkeness','drunks','drydock','drydocks','dump','duplicate','duplicates','durability','duration','duress','dust','dusts','duties','duty','dwell','dye','dyes','dynamics','dynamometer','dynamometers','ear','ears','earth','ease','eases','east','echelon','echelons','echo','echoes','economies','economy','eddies','eddy','edge','edges','editor','editors','education','educator','educators','effect','effectiveness','effects','efficiencies','efficiency','effort','efforts','egg','eggs','eighths','eighties','eights','ejection','elapse','elapses','elbow','elbows','election','elections','electrician','electricians','electricity','electrode','electrodes','electrolyte','electrolytes','electron','electronics','electrons','element','elements','elevation','eleven','eligibility','elimination','eliminator','eliminators','embosses','emergencies','emergency','emitter','emitters','employee','employees','enclosure','enclosures','encounter','encounters','end','endeavor','endeavors','endings','ends','enemies','enemy','energies','energizer','energizers','energy','engine','engineer','engineers','engines','enlistment','enlistments','ensign','ensigns','entrance','entrances','entrapment','entrapments','entries','entry','envelope','envelopes','environment','environments','equation','equations','equator','equipment','equivalent','equivalents','eraser','erasers','error','errors','escape','escapes','escort','escorts','establishment','establishments','evacuation','evacuations','evaluation','evaluations','evaporation','eve','evening','evenings','event','events','eves','evidence','examination','examinations','example','examples','exception','exceptions','excess','excesses','exchange','exchanger','exchangers','exchanges','excuse','excuses','execution','executions','executive','executives','exercise','exercises','exhaust','exhausts','exhibit','exhibits','existence','exit','exits','expansion','expansions','expenditure','expenditures','expense','expenses','experience','experiences','expert','experts','expiration','explanation','explanations','explosion','explosions','explosives','exposure','exposures','extension','extensions','extent','extenuation','extenuations','exterior','exteriors','extras','eye','eyes','fabrication','fabrications','face','facepiece','facepieces','faces','facilitation','facilities','facility','fact','factor','factories','factors','factory','facts','failure','failures','fake','fakes','fall','fallout','falls','families','family','fan','fans','fantail','fantails','farad','farads','fare','fares','farm','farms','fashion','fashions','fastener','fasteners','father','fathers','fathom','fathoms','fatigue','fatigues','fats','fault','faults','fear','fears','feather','feathers','feature','features','february','fee','feed','feedback','feeder','feeders','feeds','feelings','fees','feet','fellow','fellows','fence','fences','fetch','fetches','fiber','fibers','fiction','field','fields','fifteen','fifths','fifties','fifty','fight','fighter','fighters','fighting','fights','figure','figures','file','files','filler','fillers','film','films','filter','filters','fines','finger','fingers','finish','finishes','fire','firearm','firearms','fireball','fireballs','firefighting','fireplug','fireplugs','firer','firers','fires','firings','firmware','fish','fishes','fist','fists','fits','fittings','fives','fixture','flag','flags','flake','flakes','flame','flames','flange','flanges','flap','flaps','flare','flares','flash','flashes','flashlight','flashlights','fleet','fleets','flesh','flicker','flickers','flight','flights','float','floats','flood','floods','floor','floors','flow','flowchart','flower','flowers','fluid','fluids','flush','foam','focus','focuses','fog','fogs','fold','folder','folders','folds','food','foods','foot','footing','footings','force','forces','forearm','forearms','forecastle','forecastles','forecasts','foreground','forehead','foreheads','forest','forests','fork','forks','form','format','formation','formations','formats','forms','formula','formulas','fort','forties','forts','forty','fountain','fountains','fours','fourths','fraction','fractions','fracture','fractures','frame','frames','freedom','freeze','freezes','freight','freights','frequencies','frequency','freshwater','friction','friday','fridays','friend','friends','frigate','frigates','front','fronts','frost','frosts','fruit','fruits','fuel','fuels','fumes','function','functions','fund','funding','funds','fur','furnace','furnaces','furs','fuse','fuses','future','futures','gage','gages','galley','galleys','gallon','gallons','gallows','game','games','gang','gangs','gangway','gangways','gap','gaps','garage','garages','garden','gardens','gas','gases','gasket','gaskets','gasoline','gasolines','gate','gates','gear','gears','generals','generation','generations','generator','generators','geography','giant','giants','girl','girls','glance','glances','gland','glands','glass','glasses','glaze','glazes','gleam','gleams','glide','glides','glossaries','glossary','glove','gloves','glow','glows','glue','glues','goal','goals','goggles','gold','goods','government','governments','governor','governors','grade','grades','grain','grains','gram','grams','grant','grants','graph','graphs','grasp','grasps','grass','grasses','gravel','gravity','grease','greases','greenwich','grid','grids','grinder','grinders','grip','grips','groan','groans','groceries','groom','grooms','groove','grooves','gross','grounds','group','groups','grove','groves','growth','growths','guard','guards','guess','guesses','guest','guests','guidance','guide','guideline','guidelines','guides','guilt','gulf','gulfs','gum','gums','gun','gunfire','gunnery','gunpowder','guns','guy','guys','gyro','gyros','gyroscope','gyroscopes','habit','habits','hail','hair','hairpin','hairpins','hairs','half','hall','halls','halt','halts','halves','halyard','halyards','hammer','hammers','hand','handful','handfuls','handle','handler','handlers','handles','hands','handwriting','hangar','hangars','harbor','harbors','hardcopies','hardcopy','hardness','hardship','hardships','hardware','harm','harmonies','harmony','harness','harnesses','harpoon','harpoons','hashmark','hashmarks','haste','hat','hatch','hatches','hatchet','hatchets','hate','hats','haul','hauls','hazard','hazards','head','header','headers','headings','headquarters','heads','headset','headsets','health','heap','heaps','heart','hearts','heat','heater','heaters','heats','heel','heels','height','heights','helicopter','helicopters','hello','helm','helmet','helmets','helms','helmsman','helmsmen','help','hem','hems','henry','henrys','here','hertz','hickories','hickory','hierarchies','hierarchy','highline','highlines','highway','highways','hill','hills','hillside','hillsides','hilltop','hilltops','hinge','hinges','hint','hints','hip','hips','hiss','hisses','histories','history','hitch','hitches','hits','hoist','hoists','hold','holddown','holddowns','holder','holders','holds','hole','holes','home','homes','honk','honks','honor','honors','hood','hoods','hoof','hoofs','hook','hooks','hoop','hoops','hope','hopes','horizon','horizons','horn','horns','horsepower','hose','hoses','hospital','hospitals','hotel','hotels','hour','hours','house','housefall','housefalls','houses','housing','housings','howl','howls','hub','hubs','hug','hugs','hull','hulls','hum','human','humans','humidity','humor','hump','humps','hums','hundred','hundreds','hunk','hunks','hunt','hunts','hush','hushes','hut','huts','hydraulics','hydrometer','hydrometers','hygiene','hyphen','hyphens','ice','ices','icing','idea'];
	var n = words.length;
	return function () {
		return words[ Math.floor(Math.random() * n) ];
	};
}());

var game = {

	//the dude is just a template to be filled with parts
	dude :
		"  +---+\n" +
		"  |   |\n" +
		"  |  413\n" +
		"  |   2\n" +
		"  |  5 6\n" +
		"__+__\n",

	parts : [ '', 'O', '|', '/', '\\', '/', '\\' ],

	word : '',
	revealed : '',

	guesses : [],
	guessNum : 0,
	maxGuess : 6,
	guessMade : false,

	end : true,

	validGuessRegex : /^[\w\s]+$/,
	
	receiveMessage : function ( msg, msgObj ) {
		if ( this.end ) {
			this.new();
		}
		else {
			return this.handleGuess( msg, msgObj.user_name );
		}
	},
	
	new : function () {
		this.word = randomWord();
		this.revealed = new Array( this.word.length + 1 ).join( '-' );
		this.guesses = [];
		this.guessNum = 0;

		//oh look, another dirty hack...this one is to make sure the hangman
		// is codified
		this.guessMade = true;

		this.register();
		return '';
	},

	register : function () {
		this.unregister(); //to make sure it's not added multiple times
		IO.register( 'beforeoutput', this.buildOutput, this );

		this.end = false;
	},
	unregister : function () {
		IO.unregister( 'beforeoutput', this.buildOutput );

		this.end = true;
	},

	handleGuess : function ( guess, usr ) {
		console.log( guess, 'handleGuess' );
		guess = guess.toLowerCase();

		if ( !this.validGuessRegex.test(guess) ) {
			return 'Only alphanumeric and whitespace characters allowed',
		}

		//check if it was already submitted
		if ( this.guesses.indexOf(guess) > -1 ) {
			return guess + ' was already submitted';
		}

		//replace all occurences of guest within the hidden word with their
		// actual characters
		var indexes = this.word.indexesOf( guess );
		if ( indexes.length ) {

			indexes.forEach(function ( index ) {
				this.uncoverPart( guess, index );
			}, this);
		}

		//not found in secret word, penalize the evil doers!
		else {
			this.guessNum++;
		}

		this.guesses.push( guess );
		this.guessMade = true;

		//plain vanilla lose-win checks
		if ( this.loseCheck() ) {
			return this.lose();
		}
		if ( this.winCheck() ) {
			return this.win( usr );
		}
	},

	//unearth a portion of the secret word
	uncoverPart : function ( guess, startIndex ) {
		var revealed = '';

		revealed += this.revealed.slice( 0, startIndex );
		revealed += guess;
		revealed += this.revealed.slice( startIndex + guess.length );

		this.revealed = revealed;
	},

	//attach the hangman drawing to the already guessed list and to the revealed
	// portion of the secret word
	preparePrint : function () {
		var msg = '', that = this;

		//replace the placeholders in the dude with body parts
		msg += this.dude.replace( /\d/g, function ( part ) {
			return part > that.guessNum ? ' ' : that.parts[ part ];
		});

		msg += this.guesses.sort().join( ', ' ) + '\n';
		msg += this.revealed;

		bot.output.add( msg );
	},

	//win the game
	win : function () {
		this.unregister();
		return 'Correct! The phrase is ' + this.word + '.'
	},

	winCheck : function () {
		return this.word === this.revealed;
	},

	//lose the game. less bitter messages? maybe.
	lose : function () {
		this.unregister();
		return 'You people suck. The phrase was ' + this.word;
	},

	loseCheck : function () {
		return this.guessNum >= this.maxGuess;
	},

	buildOutput : function () {
		if ( this.guessMade ) {
			this.preparePrint();

			bot.codifyOutput = true;
			this.guessMade = false;
		}
	}
};
bot.addCommand({
	name : 'hang',
	fun : game.receiveMessage,
	thisArg : game
});
