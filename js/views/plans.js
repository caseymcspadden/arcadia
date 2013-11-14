// site/js/views/users.js

define (['jquery', 'underscore', 'backbone', 'views/grid', 'jqueryui', 'util/jquery-extensions'], function($, _, Backbone, GridView) {




//var _hintactions = {'due_date':202,'office_due':210,'idadvisor':201,'idemployee':200,'plan':203,'type':211};

//the stage of a plan after an action is selected

return GridView.extend( {

 	dialog: null,
 	
 	today: new Date(),
 	
 	commentsDialog: null,
 	
 	actions: null,
 	
 	users: null,
 	
 	allowedactions: {
		0:[1],
		1:[1],
		2:[11,12,13,200,201,202,203,206,207,208,209,210,211,212,231,232],
		3:[12,13,21,200,201,202,203,206,207,208,209,210,211,212,231,232],
		4:[13,22,21,200,201,202,203,206,207,208,209,210,211,212,231,232],
		5:[23,22,21,200,201,202,203,206,207,208,209,210,211,212,231,232],
		126:[23,22,21,200,201,202,203,206,207,208,209,210,211,212,231,232],
		127:[23,22,21,200,201,202,203,206,207,208,209,210,211,212,231,232]
	},
	
	hintactions: {'plan':203,'type':211,'due_date':202,'office_due':210,'idadvisor':201,'idemployee':200,'fee':231,'balance_due':232},
	
	actionstages: {0:2, 1:2, 11:3, 12:4, 13:5, 21:2, 22:3, 23:4, 126:126, 127:127},

 	events:{
    	'change .monitor': 'contentChanged',
    	'click #gridheader table th': 'headerClick',
    	'mousedown #gridheader table th.inner span.resize': 'beginResize',
    	'mouseup #gridheader,#gridbody': 'endResize',
    	'mousemove #gridheader,#gridbody': 'mouseMove',
    	'click input.display-header-checkbox': 'toggleColumnVisibility',
    	'click #button-new-plan': 'newModel',
	},
 	
 	initialize: function(options)
 	{
	 	this.constructor.__super__.initialize.apply(this, [options]);
	 	
	 	this.dialog = this.$el.find('#dialog-plans').dialog({
			title: 'New Plan',
			autoOpen: false,
			width: 410,
			modal: true,
			context: this,
			appendTo: this.el,
			position: {my:"left top", at:"left bottom", of:'#button-new-plan'},
			buttons: {
				"Submit": function() {
					var collection = $(this).dialog('option','context').collection;
					var data = collection.encode($(this).find('form').serializeObject());
					if (data.id=='0')
					{
						delete data.id;
						collection.create(data);
					}
					else
						collection.get(data.id).save(data);
					$(this).dialog('close');
				},
				"Cancel":  function() {$(this).dialog('close');}
			}
		});
			
		$('#dialog-plans .date').datepicker();
		
		
		this.commentsDialog = $('<div><form><input type="hidden" name="id"><table class="full-width"><tbody><tr><td>Comments for Advisor</td><td>Internal Comments</td></tr><tr><td><textarea name="advisorcomments" class="comments"></textarea></td><td><textarea name="preparercomments" class="comments"></textarea></td></tr></tbody></table></form></div>').dialog({
			title: 'Comments',
			autoOpen: false,
			width: 600,
			modal: true,
			context: this,
			appendTo: this.el,
			buttons: {
				"Submit": function() {
					var collection = $(this).dialog('option','context').collection;
					var data = $(this).find('form').serializeObject();				
					console.log(data);
					//collection.encode($(this).find('form').serializeObject());
					collection.get(data.id).save(data);
					$(this).dialog('close');
				},
				"Cancel":  function() {$(this).dialog('close');}
			}
		});


	 	//this.listenTo(this,'beginEditing',this.beginEditing);
		//this.listenTo(this,'changeDialog',this.changeDialog);
		this.listenTo(this.collection,'edit',this.editModel);
 	},
 	
 	// called when application preferences have changed
 	preferencesChanged: function() {
 		console.log(this.preferences);
 		var today_milliseconds = this.today.getTime();
 		this.collection.each(function(item) {
	    	console.log(((new Date(this.collection.translate('due_date',item.attributes.due_date))).getTime()-today_milliseconds)/86400000);;
	    },this);
 	},
 	
	editModel: function(arg)  // arg is an object {element:el , field:field, model:mod, event:e} from collection's "edit" event
	{
		var data = arg.model.toJSON();
		this.beginEditing(data,arg.field,arg.element);
	},

	newModel: function(e)
	{
		this.beginEditing({},'');
	},

 	beginEditing: function(data,field,element)
 	{
 		if (this.actions===null)
 		{
 			var that = this;
 			$.get(require.toUrl('').replace(/\/js\//,'/api/actions'), function(d) {that.actions={};_.each(d,function(item){that.actions[item['id']]=item['selecttext'];})}).
 				done(function() {$.get(require.toUrl('').replace(/\/js\//,'/api/users'), function(d) {
 					var $advisorDropdown = that.dialog.find('[name=idadvisor]');
 					var $employeeDropdown = that.dialog.find('[name=idemployee]');
 					_.each(d, function(item) {
 						$dropdown = item.user_type==1 ? $advisorDropdown : $employeeDropdown;
	 					$dropdown.append($('<option value="'+item.id+'">' + item.name + '</option>'));
	 				}); 		
 				}).
 				done(function() {that.initDialog(data,field,element);})});
 		}
 		else
 		{
 			this.initDialog(data,field,element);
 		}
 	},

 	contentChanged: function(e)  // called when
	{
		$target = $(e.target);
		this.changeDialog({name:$target.attr('name'), value:$target.val()});
	},
	
 	// this function won't be called unless data has been loaded
 	initDialog: function(data,field,element)
 	{
 		console.log("Init dialog " + field);
	 	if (field=='lastadvisorcomments' || field=='lastpreparercomments')
	 	{
	 		var $form = this.commentsDialog.find('form');
	 		$form.find('[name=id]').val(data.id || 0);
		 	this.commentsDialog.dialog('option','title',data.plan||'New Plan');
		 	this.commentsDialog.dialog('open');
		 	this.commentsDialog.dialog("widget").position({my:'left top', at:'left bottom', of:element||'#button-new-plan'});
		 	return;
	 	}
 		
 		var $form = this.dialog.find('form');
 		var $actionDropdown = this.dialog.find('[name=idaction]');
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
		$form.find('[name=due_date]').val(data.due_date!==undefined ? this.collection.translate('due_date',data.due_date) : this.defaultDueDate());
		$form.find('[name=office_due]').val(data.office_due!==undefined ? this.collection.translate('office_due',data.office_due) : this.defaultDueDate());
		$form.find('[name=fee]').val(data.fee||'0.00');	
		$form.find('[name=balance_due]').val(data.balance_due||'0.00');	
	 	
	 	if (data.idadvisor) $form.find('[name=idadvisor]').val(data.idadvisor);
	 	if (data.idemployee) $form.find('[name=idemployee]').val(data.idemployee);
	 	
	 	//console.log($(element.context).attr('id'));;
	 	//this.dialog.dialog('option',{'title':data.plan||'New Plan', 'position':{my:'left top', at:'left bottom', of:element||'#button-new-plan'}});
	 	//this.dialog.dialog('option','position',{my:'left top', at:'left bottom', of:arg.element});
	 	this.dialog.dialog('option','title',data.plan||'New Plan');
	 	this.dialog.dialog('open');
	 	this.dialog.dialog("widget").position({my:'left top', at:'left bottom', of:element||'#button-new-plan'});
	 	this.changeDialog({name:'idaction',value:action});
	},
	
	defaultDueDate: function()
	{
		var date = new Date(this.today.getTime() + parseInt(this.preferences.get('duedays'))*24*60*60*1000);
		return date.toSlashDate();
	},
	 	
 	changeDialog: function(data)
 	{
 		if (data.name!='idaction')
 			return;
 			 		
 		var action = parseInt(data.value);
 
 		this.setVisibility(this.dialog.find('#row-plan'),_.contains([1,203],action));
 		this.setVisibility(this.dialog.find('#row-type'),_.contains([1,211],action));
 		this.setVisibility(this.dialog.find('#row-due_date'),_.contains([1,202],action));
 		this.setVisibility(this.dialog.find('#row-office_due'),_.contains([1,210],action));
 		this.setVisibility(this.dialog.find('#row-idadvisor'),_.contains([1,201],action));
 		this.setVisibility(this.dialog.find('#row-idemployee'),_.contains([1,200],action));
 		this.setVisibility(this.dialog.find('#row-data_request'),_.contains([206],action));
 		this.setVisibility(this.dialog.find('#row-data_received'),_.contains([207],action));
 		this.setVisibility(this.dialog.find('#row-data_sent'),_.contains([208],action));
 		this.setVisibility(this.dialog.find('#row-data_acknowledged'),_.contains([209],action));
 		this.setVisibility(this.dialog.find('#row-comments'),_.contains([212],action));
 		this.setVisibility(this.dialog.find('#row-fee'),_.contains([231],action));
 		this.setVisibility(this.dialog.find('#row-balance_due'),_.contains([232],action));
 	},
 	
 	setVisibility: function($row,visible)
 	{
	 	$row.removeClass('CRHidden');
	 	if (!visible) $row.addClass('CRHidden');
 	}		
});
});