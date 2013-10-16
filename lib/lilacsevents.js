/*
This adds initial support to events.
 */

var _events = {
    'mobileplatforms' : {	// this is the name of a data-set on ACS
      'onset' : function(_this){
      	_this=JSON.parse(_this);
        return true
      },
      'onedit' : function(_this){
      	_this=JSON.parse(_this);
        console.log('onedit');      
        return true
      },
      'ondelete' : function(_this){
      	_this=JSON.parse(_this);
        console.log('onedit');      
        return true
      }
    }
};

exports.call=function(event,dataset,data){
	return _events[dataset][event](data);
}