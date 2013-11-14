// site/js/views/users.js

define (['jquery', 'underscore', 'backbone', 'views/grid', 'jqueryui', 'util/jquery-extensions'], function($, _, Backbone, GridView) {




//var _hintactions = {'due_date':202,'office_due':210,'idadvisor':201,'idemployee':200,'plan':203,'type':211};

//the stage of a plan after an action is selected

return GridView.extend( {

 	actions: null,
 	
 	users: null,
 	
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
	
	hintactions: {'plan':203,'type':211,'due_date':202,'office_due':210,'idadvisor':201,'idemployee':200},
	
	actionstages: {0:2, 1:2, 11:3, 12:4, 13:5, 21:2, 22:3, 23:4, 126:126, 127:127},

 	initialize: function(options)
 	{
	 	this.constructor.__super__.initialize.apply(this, [options]);
	 	
	 	this.listenTo(this,'beginEditing',this.beginEditing)
		this.listenTo(this,'changeDialog',this.changeDialog)
 	},
 	
 	// called when application preferences have changed
 	preferencesChanged: function() {
 		console.log("preferences changed");
 		var today_milliseconds = this.today.getTime();
 		this.collection.each(function(item) {
	    	console.log(((new Date(this.collection.translate('due_date',item.attributes.due_date))).getTime()-today_milliseconds)/86400000);;
	    },this);
 	},
 	
 	beginEditing: function($dialog,data,field)
 	{
 		if (this.actions===null)
 		{
 			var that = this;
 			$.get(require.toUrl('').replace(/\/js\//,'/api/actions'), function(d) {that.actions={};_.each(d,function(item){that.actions[item['id']]=item['selecttext'];})}).
 				done(function() {$.get(require.toUrl('').replace(/\/js\//,'/api/users'), function(d) {
 					var $advisorDropdown = $dialog.find('[name=idadvisor]');
 					var $employeeDropdown = $dialog.find('[name=idemployee]');
 					_.each(d, function(item) {
 						$dropdown = item.user_type==1 ? $advisorDropdown : $employeeDropdown;
	 					$dropdown.append($('<option value="'+item.id+'">' + item.name + '</option>'));
	 				}); 		
 				}).
 				done(function() {that.initDialog($dialog,data,field);})});
 		}
 		else
 		{
 			this.initDialog($dialog,data,field);
 		}
 	},
 	
 	// this function won't be called unless data has been loaded
 	initDialog: function($dialog,data,field)
 	{
 		var $form = $dialog.find('form');
 		var $actionDropdown = $dialog.find('[name=idaction]');
 		$actionDropdown.find('option').remove();
	 	var stage = data.stage || 0;
		_.each(this.allowedactions[stage], function(action) {
			$actionDropdown.append($('<option value="'+action+'">' + this.actions[action] + '</option>'));
			
		},this); 		
		var action = this.hintactions[field] || this.allowedactions[stage][0];
		
		$actionDropdown.val(action);
		$form.find('[name=id]').val(data.id || 0);
		$form.find('[name=stage]').val(data.stage || 0);
		$form.find('[name=plan]').val(data.plan || '');	
		$form.find('[name=type]').val(data.type || 1);	
		$form.find('[name=due_date]').val(data.due_date ? data.due_date.dashDateToSlashDate() : '01/01/2000');	
		$form.find('[name=office_due]').val(data.office_due ? data.office_due.dashDateToSlashDate() : '01/01/2000');	
	 	
	 	if (data.idadvisor) $form.find('[name=idadvisor]').val(data.idadvisor);
	 	if (data.idemployee) $form.find('[name=idemployee]').val(data.idemployee);
	 	
	 	$dialog.dialog('option','title',data.plan);
	 	$dialog.dialog('open');
	 	this.changeDialog($dialog,{name:'idaction',value:action});
	},
	 	
 	changeDialog: function($dialog, data)
 	{
 		if (data.name!='idaction')
 			return;
 			 		
 		var action = parseInt(data.value);
 
 		this.setVisibility($dialog.find('#row-plan'),_.contains([1,203],action));
 		this.setVisibility($dialog.find('#row-type'),_.contains([1,211],action));
 		this.setVisibility($dialog.find('#row-due_date'),_.contains([1,202],action));
 		this.setVisibility($dialog.find('#row-office_due'),_.contains([1,210],action));
 		this.setVisibility($dialog.find('#row-idadvisor'),_.contains([1,201],action));
 		this.setVisibility($dialog.find('#row-idemployee'),_.contains([1,200],action));
 		this.setVisibility($dialog.find('#row-comments'),_.contains([212],action));
 	},
 	
 	setVisibility: function($row,visible)
 	{
	 	$row.removeClass('CRHidden');
	 	if (!visible) $row.addClass('CRHidden');
 	}		
});
});