/*!
* Lilacs - Li'l ACS by Ricardo Alcocer
* @ricardoalcocer | http://ricardoalcocer.com/
*
* NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

/**
* REST wrapper around Appcelerator Cloud Services.  Provides an instant API on 
* top of the CustomObjects data store
*/

var _ = require('lodash');
var settings=require('./lib/lilacs.js').getSettings();
var parseActions=require('./lib/lilacsmod.js').parseActions;
var _events=require('./lib/lilacsevents.js');
var dataSetPrefix='lilacsds_';

// initialize app
function start(app, express) {
	var ACS = require('acs').ACS;
	var ACS_KEY=settings.ACS_KEY;
	var ACS_SECRET=settings.ACS_SECRET;

	app.use(express.favicon(__dirname + '/public/images/favicon.ico'));		//set favicon
	app.use(express.session({ key: 'node.acs', secret: ACS_SECRET }));
	ACS.init(ACS_KEY,ACS_SECRET);

	// use ACS Admin user as user for Basic Auth
	var auth = express.basicAuth(encodeURIComponent(settings.ADMIN_UID), encodeURIComponent(settings.ADMIN_PWD));

	app.get('/api/*',auth,function(req, res, next){
		res.setHeader('Content-Type', 'application/json');
		var fullPath=req.path.replace(/^\/|\/$/g,'').split('/');
		if (fullPath.length >=3){
			var parsedActions=parseActions(fullPath);
			
			if (parsedActions !== null){
				// get collection name from query string
				collectionName=dataSetPrefix + fullPath[1].toLowerCase();

				var args={
					get: 		_.find(parsedActions,{'action': 'get'}).value,
					order: 		_.find(parsedActions,{'action': 'order'}).value,
					page: 		_.find(parsedActions,{'action': 'page'}).value,
					perpage: 	_.find(parsedActions,{'action': 'per_page'}).value,
					limit: 		_.find(parsedActions,{'action': 'limit'}).value,
					skip: 		_.find(parsedActions,{'action': 'skip'}).value,
					columns: 	_.find(parsedActions,{'action': 'columns'}).value,
					datasource: _.find(parsedActions,{'action': 'datasource'}).value
				};

				var dsName='lilacs_' + (args.datasource !== null ? args.datasource :'acs');
				var DS=require('./lib/datasources/' + dsName + '.js')[dsName];
				var dataSource=new DS();

				dataSource.GET(collectionName,args,function(data){
					res.send(data);
				});
							
			}else{
				res.send({message:'Malformed URL.  Remember, value pairs'});	
			}
		}else{
			res.send({message:'Need to provide Data-Store name and Action'});
		}
	});

	// ##

	app.post('/api/*',auth,function(req, res, next){
		res.setHeader('Content-Type', 'application/json');
		var fullPath=req.path.replace(/^\/|\/$/g,'').split('/');

		if (fullPath.length >=3){
			// Note: need to validate that collectionName follows naming conventions
			collectionName=dataSetPrefix + fullPath[1].toLowerCase();
			action=fullPath[2];

			var adminUser={
				login:settings.ADMIN_UID,
				password:settings.ADMIN_PWD
			}

			// react accordingly
			switch(action.toUpperCase()){
				case "SET": // should be the POST verb
					var args={
						objectToAdd : JSON.parse(req.body.data),
						adminUser: adminUser
					}

					dataSource.POST(collectionName,args,function(data){
						res.send(data);
					});
					
					break;
				case "EDIT": // should be PUT verb
					var args={
						adminUser: adminUser,
						recToUpdate: req.body.id,
						objectToUpdate: JSON.parse(req.body.data)
					}

					dataSource.PUT(collectionName,args,function(data){
						res.send(data);
					});

					break;
				case "DELETE": // should be DELETE verb
					if (req.body.ids || req.body.id){
						var args={
							id: req.body.id,
							ids: req.body.ids,
							adminUser:adminUser
						}

						dataSource.DELETE(collectionName,args,function(data){
							res.send(data);
						});		
										
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
}

// release resources
function stop() {
	
}