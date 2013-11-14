var ACS = require('acs').ACS;
var settings=require('../../lib/lilacs.js').getSettings();

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
		whereArray=unescape(args.get).replace(/"[^"]*"/g, function(g0){return g0.replace(/,/g,'&#44');}).split(',');
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
			console.log(outData);
			callback(JSON.stringify(outData));
		}
	)
}

lilacs_acs.prototype.POST=function(dataset,args,callback){
	//var that=this;

	isNewDataSet(dataset,function(isnew){
		if (isnew){
			addDataSet(dataset);
		}
	})

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
				        callback({message:'Success'})
				    } else {
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
				    	// now check if there are still records for this dataset
				    	ACS.Objects.query({
				    		classname:dataset
				    	},function(e){
				    		if(e[dataset].length === 0){
				    			// remove this dataset from lilacs_config
				    			// i'm removing the 'lilacsds_' prefix so the deleteDataSet 
				    			// function is exactly the same as the one used in admin.js
				    			deleteDataSet(dataset.replace('lilacsds_',''));
				    		}
				    	});

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

lilacs_acs.prototype.getDataSets=function(callback,req){
	// callback is whatever is going to happen after I get the data
	var payload={
		classname:'lilacs_config'
	};
	
	// this bit should be more intelligent
	// since I don't know if there are orphan datasets, I need to clean up the
	// array by querying each one and make sure it exists.  For now it'll return all datasets
	ACS.Objects.query(payload,
		function(e){
			if (e.meta.total_results > 0){
				var outData=e.lilacs_config[0].datasets;
				req.session.datasets=outData;
				callback(outData);				
			}else{
				req.session.datasets=null;
				callback(outData);
			}
	
		}
	)
}

function addDataSet(dataset){
	// no callback.  running blindly
	var classname='lilacs_config'

	var adminUser={
		login:settings.ADMIN_UID,
		password:settings.ADMIN_PWD
	}

	isNewDataSet(dataset,function(isnew,datasets,recid){
		if (isnew){
			// add this dataset to the array
			datasets.push(dataset.replace('lilacsds_',''));
			
			var payload={
				datasets:datasets
			}

			// now update the array on the server
			ACS.Users.login(adminUser,function(e){
				var session_id=e.meta.session_id;
				if (e.success){
					ACS.Objects.update({
					    classname: classname,
					    id: recid,
					    fields: payload,
					    session_id:session_id // pass the freaking sessionId god dammit
					}, function (e) {
					    if (e.success) {
					        //console.log('success');
					    } else {
					    	//var response={message:((e.error && e.message) || JSON.stringify(e))}
					        //console.log(response);
					    }
					});
				}
			})
		}
	})
}

function deleteDataSet(dataset){
	var classname='lilacs_config'

	var adminUser={
		login:settings.ADMIN_UID,
		password:settings.ADMIN_PWD
	}

	ACS.Objects.query({
		classname:classname
	},function(e){
		var datasets=e[classname][0].datasets;
		var recid=e[classname][0].id;
		var position=datasets.indexOf(dataset);
		if (position > -1) {
		    datasets.splice(position, 1);
		}
		
		var payload={
			datasets:datasets
		}

		// now update the array on the server
		ACS.Users.login(adminUser,function(e){
			var session_id=e.meta.session_id;
			if (e.success){
				ACS.Objects.update({
				    classname: classname,
				    id: recid,
				    fields: payload,
				    session_id:session_id // pass the freaking sessionId god dammit
				}, function (e) {
				    if (e.success) {
				    	//req.session.datasets=datasets;  //make sure it is saved as a session
				        //console.log('success');
				    } else {
				    	//var response={message:((e.error && e.message) || JSON.stringify(e))}
				        //console.log(response);
				    }
				});
			}
		})
	})
}


function isNewDataSet(dataset,callback){
	var classname='lilacs_config';

	var payload={
		classname:classname
	};

	// if lilacs_config doesn't exist, then create it with a column named datasets
	createLilacsConfig(function(){
		dataset=dataset.replace('lilacsds_','');
	
		ACS.Objects.query(payload,
			function(e){
				if (e.success){
					var datasets=e.lilacs_config[0].datasets;
					var recid=e.lilacs_config[0].id;
					
					if (datasets.indexOf(dataset) == -1){
						// is new
						callback(true,datasets,recid);
					}else{
						// not new
						callback(false,datasets,recid);
					}
				}
			}
		)
	})
}

function createLilacsConfig(callback){
	var classname='lilacs_config';
	var payload={
		classname:classname
	};

	var adminUser={
		login:settings.ADMIN_UID,
		password:settings.ADMIN_PWD
	}

	ACS.Users.login(adminUser,function(e){
		var session_id=e.meta.session_id;
		if (e.success){
			ACS.Objects.query(payload,
				function(e){
					if (e.meta.total_results>0){
						// it exits, so don't create it
						//console.log('it exists');
						callback();
					}else{
						// create it
						//console.log('it doesn\'t exists');
						ACS.Objects.create({
						    classname: classname,
						    fields: {datasets:[]},
						    session_id:session_id // pass the freaking sessionId god dammit
						}, function (e) {
							callback();
						    /*if (e.success) {
						        callback({message:'Success'})
						    } else {
						        var response={message:((e.error && e.message) || JSON.stringify(e))};
						        callback(response);
						    }*/
						});
					}
				}
			)
		}
	})
}

exports.lilacs_acs=lilacs_acs;