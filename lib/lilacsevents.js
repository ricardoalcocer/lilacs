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
  var eventsPrefix='lilacsev_';
	return _events[eventsPrefix + dataset][event](data);
}



/*

// the actual user-defined function 
//  alert(_this.id);
//  return true;


// this I add to give the user access to the payload object
var fnself="_this=JSON.parse(_this);";

// I add my stuff with the user's stuff to build the full function
var fn=fnself + "alert(_this.id);return true;";

// I create the function objec
var fnn=new Function("_this",fn);

// I call the function with the actual payload
fnn('{"id":1}');
 
 */