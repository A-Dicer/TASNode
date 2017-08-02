var fs = require("fs");
var Line = require("./lineConstruct.js");
var inquirer = require("inquirer");

var file;
var tas;

function fileChoice(){
	inquirer.prompt([
	    { type: "input", message: "Name: ", name: "name" }
	])
	.then(function(response) {
		//take file name and add .json extension
	  	file = response.name.trim() + ".json";
	  	fix();
	});
}


function fix(){
	//grab .json file using argument	
	fs.readFile(file, "utf8", function(error, data) {
		//if it doesn't work throw error. 
		if (error) return console.log(error)
		//else parse the json data and save it in tas[]
		else tas = JSON.parse(data);
		//update the kalimba.tas file the current file
		console.log("\n" + file + " has loaded!\n");

		for(i = 0; i < tas.length; i++){
			if(tas[i].direction === ".") tas[i].direction = undefined;
			if(tas[i].action === ".") tas[i].action = undefined;
		}
		console.log(tas);
		var info = JSON.stringify(tas, null, 1);
		TASChange(info, file);
	})
}

function TASChange(output, file){
	fs.writeFile( file, output, function(err) {
	    if (err) {
	    	return console.log(err);
	    }
	 });
}

fileChoice();