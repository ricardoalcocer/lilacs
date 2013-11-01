var ACS=require('acs').ACS;
var settings=require('../lib/lilacs.js').getSettings();

// these are the Query String parameters we'll look for
var QSActions=['get','order','page','per_page','limit','skip','columns','near'];

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