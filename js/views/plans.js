// site/js/views/users.js

define (['jquery', 'underscore', 'backbone', 'views/grid', 'jqueryui', 'util/jquery-extensions'], function($, _, Backbone, GridView) {
return GridView.extend( {

 	initialize: function(options)
 	{
	 	this.constructor.__super__.initialize.apply(this, [options]);
	 	
	 	this.listenTo(this,'initDialog',this.populateDialog)
		this.listenTo(this,'changeDialog',this.changeDialog)
 	},
 	
 	populateDialog: function($dialog,data)
 	{

 	},
 	
 	changeDialog: function($dialog, data)
 	{
	 	console.log(data.name + " " + data.value);
 	} 		
});
});