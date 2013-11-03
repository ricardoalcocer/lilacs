var ACS=require('acs').ACS;
//var settings=require('../lib/lilacs.js').getSettings();

//var lilacsmod=require('../lib/datasources/lilacs_acs.js');

var DS=require('../lib/datasources/lilacs_acs.js').lilacs_acs;
var settings=require('../lib/lilacs.js').getSettings();
var dataSource=new DS();   
var crypto=require('crypto');

var dataSetPrefix='lilacsds_';

function home(req, res) {
	dataSource.getDataSets(function(datasets){
		req.session.datasets=datasets;  //make sure it is saved as a session
		res.render('adminhome',{
										datasets:datasets
									}
			);	
	},req)
	
}

function databrowser(req,res){
	dataSource.getDataSets(function(datasets){
		req.session.datasets=datasets; // make sure it is saved as a session
		var perpage=10;
		var currentpage=req.params.currentpage || 1;

		var payload={
			classname:dataSetPrefix + req.params.dataset,
			per_page:perpage,
			page:currentpage,
			order: "-created_at"
		};

		ACS.Objects.query(payload,
			function(e){
				var rows=[];
				var outData=e[dataSetPrefix + req.params.dataset];
				// I now create a new array that includes a column with a hash of the record id, using the ACS_SECRET as encryption key
				outData.forEach(function(row){
					row.hmac=crypto.createHmac("sha1",settings.ACS_SECRET).update(row.id).digest("hex");
					rows.push(row);
					//console.log(row);
				})
				
				if(outData.length>0){
					var columns=Object.keys(outData[0]);
					res.render('databrowser', { 
												dataset: req.params.dataset, 
												data: rows , 
												columns: columns,
												totalpages: e.meta.total_pages,
												currentpage: currentpage,
												datasets:datasets
											});
				}else{
					res.send('no data.  Need to create a prettier message');
				}
			}
		)
	},req)
}

function deleterec(req,res){
	// rec is at req.params.recid and HMAC for that id is at req.params.hmac
	// if HMAC matches, delete freely
	if (req.params.hash === crypto.createHmac("sha1",settings.ACS_SECRET).update(req.params.recid).digest("hex")){
		var adminUser={
				login:settings.ADMIN_UID,
				password:settings.ADMIN_PWD
			}

		ACS.Users.login(adminUser,function(e){
			var session_id=e.meta.session_id;
			var objDelete={};
			objDelete.id=req.params.recid;

			if (e.success){
				objDelete.session_id=session_id; // pass the freaking sessionId god dammit
				objDelete.classname=dataSetPrefix + req.params.dataset;
				ACS.Objects.remove(objDelete, function (e) {
				    if (e.success) {
				    	// ok boys, if we deleted the last record of this collection we should redirect to /admin.  Otherwise, redirect to the dataset screen
						res.redirect('../../../../databrowser/' + req.params.dataset);
						console.log('Success');
				    } else {
				    	res.redirect('../../../../databrowser/' + req.params.dataset);
				    	console.log({message:((e.error && e.message) || JSON.stringify(e))});
				    }
				});
			}
		})
	}
}