var ACS=require('acs').ACS;
//var settings=require('../lib/lilacs.js').getSettings();
var lilacsmod=require('../lib/lilacsmod.js');
var dataSetPrefix='lilacsds_';

function home(req, res) {
	lilacsmod.getDataSets(function(datasets){
		req.session.datasets=datasets;  //make sure it is saved as a session
		res.render('adminhome',{
										datasets:datasets
									}
			);	
	},req)
	
}

function databrowser(req,res){
	lilacsmod.getDataSets(function(datasets){
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
				var outData=e[dataSetPrefix + req.params.dataset];
				
				if(outData.length>0){
					var columns=Object.keys(outData[0]);
					res.render('databrowser', { 
												dataset: req.params.dataset, 
												data: outData , 
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