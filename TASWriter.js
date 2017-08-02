var fs = require("fs");
var Line = require("./lineConstruct.js");

module.exports = {TASChange, prepare, TASOutput};

//--------------------------- TASChange ----------------------------------
//                  updates the current .json file

function TASChange(output, file){
	fs.writeFile( file, output, function(err) {
	    if (err) {
	    	return console.log(err);
	    }
	 });
}

//--------------------------- TASOutput ----------------------------------
//                 updates the current .tas file

function TASOutput(data){
	var output = "";		
	for(var i = 0; i < data.length; i++){
		//if frames is undefined it means it is text
		if(data[i].frames === undefined) output += data[i].text;
		//else create string for output
		else output += data[i].frames;
		//as long as direction is defined
		if(data[i].direction !== undefined) output += "," + data[i].direction;
		//as long as action is defined
		if(data[i].action !== undefined) output += "," + data[i].action;
		//add \r for new line
		output += "\r";	
	}
	//update tas file
	TASChange(output, "kalimba.tas");
}

//---------------------------- prepare -----------------------------------
//          creats a .json file based on the .tas file

function prepare(tasFile, newFile){
	var tas = [];
	fs.readFile( tasFile, "utf8", function(error, data) {
		if (error) return console.log(error)
		else { 
			//split data at the end of each line	 	
		 	var dataArr = data.split("\r");
		 	//go through data array and break down each part of the line
		 	for(var i = 0; i < dataArr.length; i++){
		 		//set variables to undifined each time through
		 		var direction = undefined;
				var action = undefined;
				var text = undefined;
				var frames = undefined;
				//split each line of the data array
				var newArr = dataArr[i].split(",");
				//if position 0 of the new array is not a number it is text
				//also check to see if it is an empty line of text
				if(isNaN(newArr[0]) || newArr[0] === "")text = newArr[0];
				//if it is a number position 0 is frames
				else if(newArr[0] !== null) frames = parseInt(newArr[0]);
				//check if position 1 is an action
				if(newArr[1] === "J" || newArr[1] === "S" || newArr[1] === "X" || newArr[1] === "B"){
					action = newArr[1];
				//if its not an action
				} else {
					direction = newArr[1];
					action = newArr[2];
				}	 
		 		tas[i] = new Line.Line(frames, direction, action, text);
		 		console.log(tas[i])
		 	}
		}
		var output = JSON.stringify(tas, null, 1);
		//update .json file
		TASChange(output, newFile);	
	})
}