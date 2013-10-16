var ACS=require('acs').ACS;
var settings=require('/lib/lilacs.js').getSettings();

function home(req, res) {
	res.render('adminhome', { title: 'Admin' });
}