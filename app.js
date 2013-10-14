/*!
* Lilacs - Li'l ACS by Ricardo Alcocer
* @ricardoalcocer | http://ricardoalcocer.com/
*
* NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

/**
* REST-ish wrapper around Appcelerator Cloud Services.  Provides an instant API on top of the Custom Objects data store
*/

var _ = require('lodash');
var settings=require('/lib/lilacs.js').getSettings();
var parseActions=require('/lib/lilacsmod.js').parseActions;

var ACS = require('acs').ACS;
var ACS_KEY=settings.ACS_KEY;
var ACS_SECRET=settings.ACS_SECRET;

// initialize app
function start(app, express) {
	app.use(express.favicon(__dirname + '/public/images/favicon.ico'));		//set favicon
	app.use(express.session({ key: 'node.acs', secret: ACS_SECRET }));
	ACS.init(ACS_KEY,ACS_SECRET);

	// any request going to /api/* will go through here.  Every other will be handled by express

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// catch all route for HTTP GET 
	app.get('/api/*', function(req, res, next){
		res.setHeader('Content-Type', 'application/json');
		var fullPath=req.path.replace(/^\/|\/$/g,'').split('/');
		
		if (fullPath.length >=3){
			var parsedActions=parseActions(fullPath);
			
			if (parsedActions !== null){
				// get collection name from query string
				collectionName=fullPath[1].toLowerCase();

				// get values from querystring
				var getValue 		=	_.find(parsedActions,{'action': 'get'}).value;
				var orderValue		=	_.find(parsedActions,{'action': 'order'}).value;
				var pageValue 		=	_.find(parsedActions,{'action': 'page'}).value;
				var per_pageValue 	=	_.find(parsedActions,{'action': 'per_page'}).value;
				var limitValue 		=	_.find(parsedActions,{'action': 'limit'}).value;
				var skipValue 		=	_.find(parsedActions,{'action': 'skip'}).value;
				var columnsValue 	=	_.find(parsedActions,{'action': 'columns'}).value;
				
				// create acs payload object
				var acsPayload={};
				acsPayload.classname=collectionName;

				/*				
				'name="foo, inc",crap,bar="baz"'.split(/(\w+\=\"[^"]*\")?\s*,/).filter(function(x){return x;})
				this regex hack was brought to you by @cb1kenobi 
				*/

				// assemble ACS Payload Object
				if (orderValue !== null){
					acsPayload.order=orderValue;
				}
				if (pageValue !== null){
					acsPayload.page=pageValue;
				}
				if (per_pageValue !== null){
					acsPayload.per_page=per_pageValue;
				}
				if (limitValue !== null){
					acsPayload.limit=limitValue;
				}
				if (skipValue !== null){
					acsPayload.skip=skipValue;
				}
				if (columnsValue !== null){
					acsPayload.sel=JSON.stringify({"all":columnsValue.split(',')});	
				}

				// if there are get parameters, then add them as a where clause
				if (getValue.toLowerCase() !== 'all'){
					
					// Now the hacky part:
					// I replace all commas within quotes for their HTML value and then split by commas
					whereArray=unescape(getValue).replace(/"[^"]*"/g, function(g0){return g0.replace(/,/g,'&#44');}).split(',');
					// this helped: http://stackoverflow.com/questions/6335264/find-comma-in-quotes-with-regex-and-replace-with-html-equiv
		
					getValues={};
					
					// loop through every option
					whereArray.forEach(function(item){			
						console.log(item);
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
				
				console.log('ACS Payload: ' + JSON.stringify(acsPayload));

				// let's do this!
				ACS.Objects.query(acsPayload,
					function(e){
						var outData=e[collectionName];
						res.send(JSON.stringify(outData));
					}
				)
				//			
			}else{
				res.send({message:'Malformed URL.  Remember, value pairs'});	
			}
		}else{
			res.send({message:'Need to provide Data-Store name and Action'});
		}
	});
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// catch all route for HTTP POST
	app.post('/api/*', function(req, res, next){
		res.setHeader('Content-Type', 'application/json');
		var fullPath=req.path.replace(/^\/|\/$/g,'').split('/');

		if (fullPath.length >=3){
			// get arguments from query string
			collectionName=fullPath[1].toLowerCase();
			action=fullPath[2];

			// set the ACS admin user, the one who can add records
			// this could also come from the querystring, allowing for 
			// more granular ownership of records...but that's not implemented
			var adminUser={
				login:settings.ADMIN_UID,
				password:settings.ADMIN_PWD
			}

			// react accordingly
			switch(action.toUpperCase()){
				case "SET":
					var objectToAdd=req.body.data;
					var objectToAdd=JSON.parse(objectToAdd);
					
					ACS.Users.login(adminUser,function(e){
						var session_id=e.meta.session_id;
						if (e.success){
							ACS.Objects.create({
							    classname: collectionName,
							    fields: objectToAdd,
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
					break;
				case "EDIT":
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
					break;
				case "DELETE":
					var objDelete={};
					objDelete.classname=collectionName;

					if (req.body.ids || req.body.id){
						if (req.body.id) {objDelete.id=req.body.id} else {objDelete.ids=req.body.ids};
					
						ACS.Users.login(adminUser,function(e){
							var session_id=e.meta.session_id;
							if (e.success){
								objDelete.session_id=session_id // pass the freaking sessionId god dammit
								ACS.Objects.remove(objDelete, function (e) {
								    if (e.success) {
								        res.send({message:'Success'});
								    } else {
								        res.send({message:((e.error && e.message) || JSON.stringify(e))});
								    }
								});
							}
						})
					}else{
						res.send('You want to delete, but you don\'t tell me what?')
					}
					break;
				default:
					res.send({message:'Wrong action'});
			}
		}else{
			res.send({message:'Need to provide Class Name and Action'});
		}
	});
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
}

// release resources
function stop() {
	
}