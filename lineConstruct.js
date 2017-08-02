module.exports = {Line, NewUndo, findPorpoise};

//----------------------------- Line -------------------------------------
//               Constructor for creating tas lines

function Line(frames, direction, action, text)  {
	this.frames = frames;
	this.direction = direction;
	this.action = action;
	this.text = text;
};

//---------------------------- newUndo -----------------------------------
//            Constructor for createing the backup copy

function NewUndo(info)  {
	this.newArray = info;
};

//-------------------------- findPorpoise --------------------------------
// You already know what this does

function findPorpoise(){
	console.log("\n    Thanks for TAS'ing Kalimba.")
	console.log("        Find Your Porpiose!")
	console.log("                           __");
	console.log("                       _.-~  )");
	console.log("            _..--~~~~,'   ,-/     _");
	console.log("         .-'. . . .'   ,-','    ,' )");
	console.log("       ,'. . . _   ,--~,-'__..-'  ,'");
	console.log("     ,'. . .  (@)' ---~~~~      ,'");
	console.log("    /. . . . '~~             ,-'");
	console.log("   /. . . . .             ,-'");
	console.log("  ; . . . .  - .        ,'");
	console.log(" : . . . .       _     /");
	console.log(". . . . .          `-.:");
	console.log(" . . ./  - .          )");
	console.log(" . . |  _____..---.._/");
	console.log("----~~~~             ~~\n");
};