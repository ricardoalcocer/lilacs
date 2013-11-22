var lilacs_sampleds=function(args){}

lilacs_sampleds.prototype.GET=function(dataset,args,callback){
	var that=this;
	var outData={"message":"I\'m the output from the sampleds module"};
	
	callback(JSON.stringify(outData));
}

lilacs_sampleds.prototype.POST=function(dataset,args,callback){
	
}

lilacs_sampleds.prototype.PUT=function(dataset,args,callback){
	
}

lilacs_sampleds.prototype.DELETE=function(dataset,args,callback){
	
}

exports.lilacs_sampleds=lilacs_sampleds;