var fs = require("fs");
var TASWriter = require("./TASWriter.js");
var Build = require("./lineConstruct.js");
var inquirer = require("inquirer");

var tas = [];
var undo = [];
var file;
var frameCount = 0;

//-------------------------- fileChoice ----------------------------------
//   inquirer function to decide on opening a file or creating file. 

function fileChoice(){
	inquirer.prompt([
	    { type: "list",  message: " ", choices: ["Open File", "Create New File"], name: "choice" },
	    { type: "input", message: "Name: ", name: "name" }
	])
	.then(function(response) {
		//take file name and add .json extension
	  	file = response.name.trim() + ".json";
	  	//start the tas 
	  	if(response.choice === "Open File") tasStart();
	  	//create the .json file from the Kalimba.tas file
	  	else if(response.choice === "Create New File") TASWriter.prepare("kalimba.tas", file);
	});
}

//--------------------------- tasStart -----------------------------------
//                 Sets up the app to start tasing

function tasStart(){
	//grab .json file using argument	
	fs.readFile(file, "utf8", function(error, data) {
		//if it doesn't work throw error. 
		if (error) return console.log(error)
		//else parse the json data and save it in tas[]
		else tas = JSON.parse(data);
		//update the kalimba.tas file the current file
		TASWriter.TASOutput(tas);
		//create a backup array to undo mistakes
		backup();
		console.log("\n" + file + " has loaded!\n");
		//run action to start actually Tas'ing
		action();		
	})
}

//---------------------------- backup ------------------------------------
// Makes a backup copy of the tas array incase you want to undo somthing

function backup(){
	var tasCopy = tas.slice();
	var backupCopy = new Build.NewUndo(tasCopy);
	undo.push(backupCopy);
}

//---------------------------- action ------------------------------------
//       Inquirer function for selecting what action to take

function action(){
	inquirer.prompt([
	    {
	      	type: "list",
	      	message: "What would you like to do?",
	      	choices: ["Edit a Line", "Add a Line", "Delete a Line", "Display All Lines", "Undo", "Quit"],
	      	name: "choice"
	    },
	])
	.then(function(response) {
	  	if(response.choice === "Edit a Line") change();
  		else if(response.choice === "Add a Line") change("add");
	  	else if(response.choice === "Delete a Line") remove();
	  	else if(response.choice === "Quit") quit();
	  	else if(response.choice === "Display All Lines") output(), action();
	  	else if(response.choice === "Undo") { 	
	  		//get the length of undo array
	  		var undoLocation = undo.length - 2;
	  		//check to see if there is anything to undo
	  		if(undoLocation >= 0){
	  			//set tas to its backup state
		  		tas = undo[undoLocation].newArray;
		  		//remove last element of the array
				undo.pop();
				//save  
				saveData();
		  	}
	  	//show results - restart
	  	output(); action();
	  	} 
	});
}

//--------------------------- frameProc ----------------------------------
//     Runs through tas array and gets the frame count total

function frameProc(){
	frameCount = 0;
	for(var i = 0; i < tas.length; i++) frameCount += tas[i].frames;
}

//--------------------------- saveData -----------------------------------
//         Saves data to the .json file and the .tas file

function saveData(){
	var info = JSON.stringify(tas);
	TASWriter.TASChange(info, file);
	TASWriter.TASOutput(tas);
}

//---------------------------- output ------------------------------------
//              console.logs current tas information

function output(){
	console.log("");
	for(i = 0; i < tas.length; i++){
		console.log("Line " + (i + 1) 
		+ ": " + tas[i].frames 
		+ "|" + tas[i].action 
		+ "|" + tas[i].direction);
	}
	console.log("\nTotal Lines: " + tas.length);
	frameProc();
	console.log("Total Frames: " + frameCount + "\n");		
}

//---------------------------- Change ------------------------------------
//          Inquirer function for editing/adding lines

function change(type){
	inquirer.prompt([
		{ type: "input", message: "Line: ",      name: "line" },
	    { type: "input", message: "Frames: ",    name: "frames" },
	   	{ type: "list",  message: "Direction: ", choices: [".", "R", "L"],      name: "direction" },
	    { type: "list",	 message: "Action: ", 	 choices: [".", "J", "S", "X"], name: "action" }
	]).then(function(response) {
		if(type === "add"){
			// creats a new line in the tas
			newLine = new Build.Line(parseInt(response.frames), response.direction, response.action);
			//places it in the spot desired
			tas.splice((response.line - 1), 0, newLine);
		} else {
			//edits the line desired
			tas[response.line - 1] = new Build.Line(parseInt(response.frames), response.direction, response.action);	
		}
		//backup - save - show results - restart
		backup(); saveData(); output();	action();
  	});
}

//---------------------------- remove ------------------------------------
//               Inquirer function to remove a line

function remove(){
	inquirer.prompt([
	    { type: "input", message: "Line: ", name: "lineNumber" }
	])
	.then(function(response) {
			//confirm you want to actually delete
	  		confirmDelete(response.lineNumber -1);
	});
}

//------------------------- confirmDelete --------------------------------
//        Inquirer function to confirm you want to delete a line

function confirmDelete(lineNumber){
	inquirer.prompt([
	    {
		    type: "confirm",
		    message: "Are you sure you want to delete that?",
		    name: "confirm",
		    default: true
	    }
	])
	.then(function(response) {
	    if (response.confirm) {
	    	lineDelete(lineNumber);
	    }
	    else action();
  	});
}

//-------------------------- lineDelete ----------------------------------
//                        Deletes the line

function lineDelete(lineNumber){
	//finds line number and removes it
	tas.splice(lineNumber, 1)
	//backup - save - show results - restart
	backup(); saveData(); output(); action();
}

//----------------------------- quit -------------------------------------
//          Inquirer function to confirm you want to quit

function quit(){
	inquirer.prompt([
	    {
		    type: "confirm",
		    message: "Are you sure you would like to quit?",
		    name: "confirm",
		    default: true
	    }
	])
	.then(function(response) {
	    if (response.confirm) Build.findPorpoise();
	    else action();
  	});
}

//------------------------------------------------------------------------
fileChoice(); //starts the app