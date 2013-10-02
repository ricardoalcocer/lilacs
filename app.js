var settings=require('/lib/lilacs.js').getSettings();

var ACS = require('acs').ACS;
var ACS_KEY=settings.ACS_KEY;
var ACS_SECRET=settings.ACS_SECRET;

// initialize app
function start(app, express) {
	app.use(express.favicon(__dirname + '/public/images/favicon.ico'));		//set favicon
	app.use(express.session({ key: 'node.acs', secret: ACS_SECRET }));
	ACS.init(ACS_KEY,ACS_SECRET);

	// catch all route for HTTP GET 
	app.get('/api/*', function(req, res, next){
		res.setHeader('Content-Type', 'application/json');
		var fullPath=req.path.replace(/\/$/,'').split('/');

		if (fullPath.length >=4){
			// get arguments from query string
			collectionName=fullPath[2].toLowerCase();
			action=fullPath[3];

			switch(action.toUpperCase()){
				case 'GET':
					// could receive extra URL parameters for sorting, paging, etc.
					// need to define this
					ACS.Objects.query({
						classname:collectionName,
						order: 'name'
					},function(e){
						var outData=e[collectionName];
						res.send(JSON.stringify(outData));
					})
					break;
				default:
					res.send({message:'Wrong action'});
			}
		}else{
			res.send({message:'Need to provide Class Name and Action'});
		}
	});

	// catch all route for HTTP POST
	app.post('/api/*', function(req, res, next){
		res.setHeader('Content-Type', 'application/json');
		var fullPath=req.path.replace(/\/$/,'').split('/');

		if (fullPath.length >=4){
			// get arguments from query string
			collectionName=fullPath[2].toLowerCase();
			action=fullPath[3];

			// react accordingly
			switch(action.toUpperCase()){
				case "SET":
					// set the ACS admin user, the one who can add records
					// this could also come from the query, allowing for 
					// more granular ownership of records
					var adminUser={
						login:settings.ADMIN_UID,
						password:settings.ADMIN_PWD
					}

					// try to grab collection name and data object
					// I'm using try catch just to make sure I can parse the object
					try{
						// should get data via POST
						var collectionName=req.body.collectionName;
						var objectToAdd=req.body.objectToAdd;
						var objectToAdd=JSON.parse(objectToAdd);
						//	
					}catch(e){
						res.send({message: 'Some error'});
					}
					
					//
					// login to ACS and add the new object to the as an ACS Custom Object
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
					//
					break;

				case "UPDATE":
					// should get data via POST
					break;

				case "DELETE":
					// should get data via POST
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