// site/js/views/users.js

define (['jquery', 'underscore', 'backbone', 'views/grid', 'jqueryui', 'util/jquery-extensions'], function($, _, Backbone, GridView) {




//var _hintactions = {'due_date':202,'office_due':210,'idadvisor':201,'idemployee':200,'plan':203,'type':211};

//the stage of a plan after an action is selected

return GridView.extend( {

 	actions: [
 		{id:1, name:'Open'},
 		{id:10, name:'Data Gather complete'},
 		{id:11, name:'Data Entry complete'},
 		{id:12, name:'Analyze Goals Complete'},
 		{id:13, name:'Write-up complete'},
 		{id:20, name:'Back to Data Gather'},
 		{id:21, name:'Back to Data Entry'},
 		{id:22, name:'Back to Analyze Goals'},
 		{id:23, name:'Back to Write-up'},
 		{id:30, name:'Flag'},
 		{id:31, name:'Resolve Flag'},
 		{id:100, name:'Delete Plan'},
 		{id:126, name:'Sign Off'},
 		{id:127, name:'Close'},
 		{id:200, name:'Change Preparer'},
 		{id:201, name:'Change Advisor'},
 		{id:202, name:'Change Due Date'},
 		{id:203, name:'Rename'},
 		{id:204, name:'Advisor Comment'},
 		{id:205, name:'Preparer Comment'},
 		{id:206, name:'Data request sent to client'},
 		{id:207, name:'Data received from client'},
 		{id:208, name:'Data sent to Arcadia'},
 		{id:209, name:'Data received by Arcadia'},
 		{id:210, name:'Change home office due date'},
 		{id:211, name:'Change plan type'},
 		{id:212, name:'Upload file to Arcadia'},
 		{id:213, name:'Last touched by'},
 		{id:230, name:'Payment received from client'},
 		{id:231, name:'Change Fee'},
 		{id:232, name:'Change Balance Due'}
 	],
 	
 	allowedactions: {
		0:[1],
		1:[1],
		2:[11,12,13,200,201,202,203,210,211,212],
		3:[12,13,21,200,201,202,203,210,211,212],
		4:[13,22,21,200,201,202,203,210,211,212],
		5:[23,22,21,200,201,202,203,210,211,212],
		126:[23,22,21,200,201,202,203,210,211,212],
		127:[23,22,21,200,201,202,203,210,211,212]
	},
	
	actionstages: {0:2, 1:2, 11:3, 12:4, 13:5, 21:2, 22:3, 23:4, 126:126, 127:127},

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