var ACS = require('acs').ACS;

var lilacs_acs=function(args){
	//this.datasource=datasource;    
}

lilacs_acs.prototype.GET=function(dataset,args,callback){
	var that=this;

	// create acs payload object
	var acsPayload={};
	acsPayload.classname=dataset;

	// assemble ACS Payload Object
	if (args.order !== null){
		acsPayload.order=args.order;
	}
	if (args.page !== null){
		acsPayload.page=args.page;
	}
	if (args.perpage !== null){
		acsPayload.per_page=args.perpage;
	}
	if (args.limit !== null){
		acsPayload.limit=args.limit;
	}
	if (args.skip !== null){
		acsPayload.skip=args.skip;
	}
	if (args.columns !== null){
		acsPayload.sel=JSON.stringify({"all":args.columns.split(',')});	
	}

	// if there are get parameters, then add them as a where clause
	if (args.get.toLowerCase() !== 'all'){
		
		// Now the hacky part:
		// I replace all commas within quotes for their HTML value and then split by commas
		whereArray=unescape(getValue).replace(/"[^"]*"/g, function(g0){return g0.replace(/,/g,'&#44');}).split(',');
		// this helped: http://stackoverflow.com/questions/6335264/find-comma-in-quotes-with-regex-and-replace-with-html-equiv

		getValues={};
		
		// loop through every option
		whereArray.forEach(function(item){			
			//console.log(item);
			var cond={};
			var logicalOperators=['=','!=','>','>=','<','<='];

			// Disclaimer: 
			// this is problably not the best way of finding the 
			// conditional operator...maybe matching with regex is a best approach
			// let's just look at it as a proof of concept
			logicalOperators.forEach(function(operator){
				if (item.indexOf(operator) !== -1){
					switch(operator){
						case "=":
							if (item.indexOf('!=') !== -1){
								// if that equal sign is actually a not-equal
								cond.$ne=item.split('!=')[1].replace('&#44',',').replace(/\"/g,'').trim()
								getValues[item.split('!=')[0].trim()]=cond;
							}else{
								getValues[item.split(operator)[0].trim()]=item.split(operator)[1].replace('&#44',',').replace(/\"/g,'').trim();
							}
							break;
						case ">":
							cond.$gt=item.split(operator)[1].replace('&#44',',').replace(/\"/g,'').trim()
							getValues[item.split(operator)[0].trim()]=cond;
							break;
						case ">=":
							cond.$gte=item.split(operator)[1].replace('&#44',',').replace(/\"/g,'').trim()
							getValues[item.split(operator)[0].trim()]=cond;
							break;
						case "<":
							cond.$lt=item.split(operator)[1].replace('&#44',',').replace(/\"/g,'').trim()
							getValues[item.split(operator)[0].trim()]=cond;
							break;
						case "<=":
							cond.$lte=item.split(operator)[1].replace('&#44',',').replace(/\"/g,'').trim()
							getValues[item.split(operator)[0].trim()]=cond;
							break;
						default:
							if (operator !== '!='){
								console.log('Invalid operator: ' + operator);
							}
					}
				}
			})
		})
		acsPayload.where=getValues;
	}
	//
	
	//console.log('ACS Payload: ' + JSON.stringify(acsPayload));

	// let's do this!
	ACS.Objects.query(acsPayload,
		function(e){
			var outData=e[dataset];
			callback(JSON.stringify(outData));
		}
	)
}

lilacs_acs.prototype.POST=function(dataset,args,callback){
	// execute user-defined event
	// careful: if this is a new object, then we need to set default events
	//var isValid=_events.call('onset',collectionName,req.body.data);
	var isValid=true;
	//
	
	if (isValid === true){
		ACS.Users.login(args.adminUser,function(e){
			var session_id=e.meta.session_id;
			if (e.success){
				ACS.Objects.create({
				    classname: dataset,
				    fields: args.objectToAdd,
				    session_id:session_id // pass the freaking sessionId god dammit
				}, function (e) {
				    if (e.success) {
				    	// if it is new, add it to datasets on lilacs_config
				        //res.send({message:'Success'});
				        callback({message:'Success'})
				    } else {
				        //res.send({message:((e.error && e.message) || JSON.stringify(e))});
				        var response={message:((e.error && e.message) || JSON.stringify(e))};
				        callback(response);
				    }
				});
			}
		})
	}else{
		res.send({message:isValid})
	}
}

lilacs_acs.prototype.PUT=function(dataset,args,callback){
	ACS.Users.login(args.adminUser,function(e){
		var session_id=e.meta.session_id;
		if (e.success){
			ACS.Objects.update({
			    classname: dataset,
			    id:args.recToUpdate,
			    fields: args.objectToUpdate,
			    session_id:session_id // pass the freaking sessionId god dammit
			}, function (e) {
			    if (e.success) {
			        //res.send({message:'Success'});
			        callback({message:'Success'})
			    } else {
			    	var response={message:((e.error && e.message) || JSON.stringify(e))}
			        callback(response);
			    }
			});
		}
	})
}

lilacs_acs.prototype.DELETE=function(dataset,args,callback){
	var objDelete={};

	if (args.id) {objDelete.id=args.id} else {objDelete.ids=args.ids};	
		ACS.Users.login(args.adminUser,function(e){
			var session_id=e.meta.session_id;
			if (e.success){
				objDelete.session_id=session_id; // pass the freaking sessionId god dammit
				objDelete.classname=dataset;
				ACS.Objects.remove(objDelete, function (e) {
				    if (e.success) {
				        //res.send({message:'Success'});
				        callback({message:'Success'});
				    } else {
				    	var response={message:((e.error && e.message) || JSON.stringify(e))};
				    	callback(response);
				        //res.send({message:((e.error && e.message) || JSON.stringify(e))});
				    }
				});
			}
		})
}

exports.lilacs_acs=lilacs_acs;