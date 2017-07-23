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
	var output="";		
	for(var i = 0; i < data.length; i++){
		var info =data[i].frames + "|" + data[i].action + "|" + data[i].direction + "\r";	
		output = output + info;
	}
	TASChange(output, "kalimba.tas");
}

//---------------------------- prepare -----------------------------------
//          creats a .json file based on the .tas file

function prepare(tasFile, newFile){
	var tas = [];
	fs.readFile( tasFile, "utf8", function(error, data) {
		if (error) return console.log(error)
		else { 	 	
		 	var dataArr = data.split("\r");
		 	for(var i = 0; i < dataArr.length; i++){
				var newArr = dataArr[i].split("|"); 
		 		tas[i] = new Line.Line(parseInt(newArr[0]),  newArr[2], newArr[1]);
		 	}
		}
		var output = JSON.stringify(tas, null, 1);
		TASChange(output, newFile);	
	})
}

