var ACS=require('acs').ACS;
var settings=require('../lib/lilacs.js').getSettings();

// these are the Query String parameters we'll look for
var QSActions=['get','order','page','per_page','limit','skip','columns'];

exports.parseActions=function(qs){
	/*
	actual QS Scenario: /api/people/get/city="Sunnyvale",name="alco"/order/email,-name/per_page/10/page/1
	first action must always be get
	returns a neatly formated object with values-pairs entered in the URL.  Example:
	 
	[ 
  		{ action: 'get', 		value: 'all' },
  		{ action: 'order', 		value: '-created_at' },
  		{ action: 'page', 		value: null },
  		{ action: 'per_page', 	value: null },
  		{ action: 'limit', 		value: null },
  		{ action: 'skip', 		value: null } 
    ]

  	*/ 
	var parsedActions=[];

	// remove api and className from querystring
	qs=qs.slice(2);

	// if num of arguments is even
	if (qs.length % 2 === 0){ 
		// loop through all possible actions
		QSActions.forEach(function(item){ 
			// find position of action
			//var tmpPos=_.indexOf(qs,item);	
			var tmpPos=qs.indexOf(item);	

			// add it to object
			var qsObject={'action':item};	
			
			// if this item exists
			if (tmpPos !== -1){
				// add its value, which is the next position
				qsObject.value=qs[tmpPos + 1];
			}else{
				// else add as null
				qsObject.value=null;
			}
			// save this action
			parsedActions.push(qsObject)
		})
	}else{
		// if length is an odd number, then the URL is malformed
		parsedActions=null;
	}
	return (parsedActions);	
}

exports.getDataSets=function(callback,req){
	// callback is whatever is going to happen after I get the data
	var payload={
		classname:'lilacs_config'
	};
	
	// this bit should be more intelligent
	// since I don't know if there are orphan datasets, I need to clean up the
	// array by querying each one and make sure it exists
	ACS.Objects.query(payload,
		function(e){
			var outData=e.lilacs_config[0].datasets;
			req.session.datasets=outData;
			callback(outData);	
		}
	)
}

exports.addDataSets=function(dataset,callback){
	var adminUser={
		login:settings.ADMIN_UID,
		password:settings.ADMIN_PWD
	}

	var recToUpdate=req.body.id;
	var objectToUpdate=req.body.data;
	var objectToUpdate=JSON.parse(objectToUpdate);

	ACS.Users.login(adminUser,function(e){
		var session_id=e.meta.session_id;
		if (e.success){
			ACS.Objects.update({
			    classname: collectionName,
			    id:recToUpdate,
			    fields: objectToUpdate,
			    session_id:session_id // pass the freaking sessionId god dammit
			}, function (e) {
			    if (e.success) {
			        res.send({message:'Success'});
			    } else {
			        res.send({message:((e.error && e.message) || JSON.stringify(e))});
			    }
			});
		}
	})

}