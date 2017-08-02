var fs = require("fs");
var TASWriter = require("./TASWriter.js");
var Build = require("./lineConstruct.js");
var inquirer = require("inquirer");
var colors = require('colors');

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
		//console.log info
		output(0,tas.length);
		console.log("\n" + file + " has loaded!\n");
		//run action to start actually Tas'ing
		action();		
	})
}

//---------------------------- backup ------------------------------------
// Makes a backup copy of the tas array incase you want to undo somthing

function backup(){
	//make a copy of the tas array
	var tasCopy = tas.slice();
	var backupCopy = new Build.NewUndo(tasCopy);
	//push copy to undo array
	undo.push(backupCopy);
}

//---------------------------- action ------------------------------------
//       Inquirer function for selecting what action to take

function action(){
	inquirer.prompt([
	    {
	      	type: "list",
	      	message: "What would you like to do?",

	      	choices: ["Edit a Line", 
	      			  "Add a Line", 
	      			  "Delete a Line", 
	      			  "Add Text", 
	      			  "Display All Lines", 
	      			  "Undo", 
	      			  "Quit"],

	      	name: "choice"
	    },
	])
	.then(function(response) {
	switch (response.choice) {
	    case "Edit a Line": change(); break;
	    case "Add a Line": change("add"); break;
	    case "Delete a Line": remove(); break;
	    case "Add Text": addText(); break;
	    case "Display All Lines": output(0,tas.length), action(); break;
	    case "Quit": quit(); break;
	    case "Undo":
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
		  	break;
  		}
	});
}

//--------------------------- frameSum ----------------------------------
//     Runs through tas array and gets the frame count total

function frameSum(){
	//set frameCount to 0
	frameCount = 0;
	for(var i = 0; i < tas.length; i++){
		//if it has frames on the line add it to frameCount
		if(tas[i].frames !== undefined) frameCount += tas[i].frames;
	}
}

//--------------------------- saveData -----------------------------------
//         Saves data to the .json file and the .tas file

function saveData(){
	//make the json readable
	var info = JSON.stringify(tas, null, 1);
	//update json file
	TASWriter.TASChange(info, file);
	//update tas file
	TASWriter.TASOutput(tas);
}

//---------------------------- output ------------------------------------
//              console.logs current tas information

function output(lineStart, lineEnd){

	console.log("");
	//loop throught the tas array
	for(i = lineStart; i < lineEnd && i < tas.length; i++){
		var info;
		//Sometimes i could start out less than 0... so check
		if(i >= 0){
			//if frames is undifined it means its a text line
			if (tas[i].frames === undefined) info = tas[i].text;
			//other wise set up the full string to output
			else{
				info = "Line " + (i + 1) + ": " + tas[i].frames;
				//if there is no direction specified skip it
				if(tas[i].direction !== undefined) info += "," + tas[i].direction;
				//if there is no action specified skip it
				if(tas[i].action !== undefined) info += "," + tas[i].action;
			}
			//if it is the line that was changed mark it
			if( i == lineStart + 4 && lineStart !== 0){
				console.log(info + "   <-----" .green );
			}
			else console.log(info);
		}
	}
	console.log("\nTotal Lines: " + tas.length);
	//add up frames
	frameSum();
	console.log("Total Frames: " + frameCount + "\n");		
}

//---------------------------- Change ------------------------------------
//          Inquirer function for editing/adding lines

function change(type){
	inquirer.prompt([
		{ type: "input", message: "Line: ",      name: "line" },
		{ type: "input", message: "Frames: ",    name: "frames" },
		{ type: "list",  message: "Direction: ", name: "direction", choices: ["None", "R", "L", "U", "D"] },
		{ type: "list",	 message: "Action: ",	 name: "action",	choices: ["None", "J", "S", "X", "B"] }
		
	 	
	]).then(function(response) {
		//if there is no action mark it as undifined
		if(response.action === "None") response.action = undefined;
		//if there is no direction mark it as undifined
		if(response.direction === "None") response.direction = undefined;
		//if its adding a line in instead of just changing it
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
		backup(); saveData(); 
		output(parseInt(response.line)-5, parseInt(response.line)+5);	
		action();
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
		//if yes
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
	backup(); saveData(); 
	output(lineNumber-5, lineNumber+5); 
	action();
}

//---------------------------- addText -----------------------------------
//                        Adds Text to a line

function addText(){
	//tell it what line and add text
	inquirer.prompt([
	    { type: "input", message: "Line: ", name: "line" },
	    { type: "input", message: "Text: ", name: "text" },
	])
	.then(function(response) {
		// creats a new line in the tas
		newLine = new Build.Line(response.frames, response.direction, response.action, response.text);
		//places it in the spot desired
		tas.splice((response.line - 1), 0, newLine);
		//backup - save - show results - restart
		backup(); saveData(); 
		output(parseInt(response.line)-5, parseInt(response.line)+5); 
		action();
	});	
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
		//if yes... Find your Porpoise
	    if (response.confirm) Build.findPorpoise();
	    else action();
  	});
}

//------------------------------------------------------------------------
fileChoice(); //starts the app