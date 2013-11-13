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
				})
				
				if (outData.length>0) var columns=Object.keys(outData[0]);
					res.render('databrowser', { 
												dataset: req.params.dataset, 
												data: rows , 
												columns: columns,
												totalpages: e.meta.total_pages,
												currentpage: currentpage,
												datasets:datasets
											});
			}
		)
	},req)
}

function deleterec(req,res){
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
					// now check if there are still records for this dataset
			    	ACS.Objects.query({
			    		classname:dataSetPrefix + req.params.dataset
			    	},function(e){
			    		if(e[dataSetPrefix + req.params.dataset].length === 0){
			    			// remove this dataset from lilacs_config
			    			deleteDataSet(req.params.dataset);
			    		}
			    	});
					res.redirect('../../../../databrowser/' + req.params.dataset);
				});
			}
		})
	}
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

function editform(req,res){
	dataSource.getDataSets(function(datasets){
		req.session.datasets=datasets;  //make sure it is saved as a session

		ACS.Objects.show({
			classname:dataSetPrefix + req.params.dataset,
			id:req.params.recid,			
			unsel:JSON.stringify({"all":"user"}) // don't get info about the user	
		},function(e){
			res.render('editrec',{
				dataset:req.params.dataset,
				datasets:datasets,
				columns: Object.keys(e[dataSetPrefix + req.params.dataset][0]),
				thisrec:e[dataSetPrefix + req.params.dataset][0]
			});
		})
	},req)
}

function saveeditform(req,res){
	// edit the record
	var tmpObj=req.body;
	var cols=Object.keys(tmpObj);
	var obj={};

	cols.forEach(function(item){
		if (item !== 'id' || item !== 'dataset'){
			// parse in case it is an array or a hash
			try{
				obj[item]=JSON.parse(tmpObj[item]);
			}catch(e){
				obj[item]=tmpObj[item];				
			}
		}
	});
	var recId=tmpObj.id;
	var dataset=tmpObj.dataset;

	// remove unwanted fields
	delete obj['id'];
	delete obj['dataset'];
	//

	var adminUser={
		login:settings.ADMIN_UID,
		password:settings.ADMIN_PWD
	}

	ACS.Users.login(adminUser,function(e){
		var session_id=e.meta.session_id;
		var payload={
			    classname: dataSetPrefix + dataset,
			    id:recId,
			    fields: obj,
			    session_id:session_id // pass the freaking sessionId god dammit
			};
		//console.log(payload);
		if (e.success){
			ACS.Objects.update(payload, function (e) {
			    if (e.success) {
			        res.redirect('../../../databrowser/' + dataset);
			    } else {
			    	var response={message:((e.error && e.message) || JSON.stringify(e))}
			        res.send(response);
			    }
			});
		}
	})
}
