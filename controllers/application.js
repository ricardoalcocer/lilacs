var ACS=require('acs').ACS;
var settings=require('/lib/lilacs.js').getSettings();

function index(req, res) {
	res.render('index', { title: 'Welcome to Node.ACS!' });
}