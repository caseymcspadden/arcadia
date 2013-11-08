// site/js/views/users.js

define (['jquery', 'underscore', 'backbone', 'views/grid', 'jqueryui', 'util/jquery-extensions'], function($, _, Backbone, GridView) {
return GridView.extend( {

 	initialize: function(options)
 	{
	 	this.constructor.__super__.initialize.apply(this, [options]);
	 	
	 	this.listenTo(this,'launchDialog',this.launchDialog)
		this.listenTo(this,'changeDialog',this.changeDialog)
 	},
 	
 	launchDialog: function($dialog,data)
 	{
 		$dialog.dialog('option','title',data.name);
		var $form = $dialog.find('form');
		$form.find('[name=id]').val(data.id || 0);
		$form.find('[name=name]').val(data.name || '');		
		$form.find('[name=username]').val(data.username || '');		
		$form.find('[name=email]').val(data.email || '');		
		$form.find('[name=user_type]').val(data.user_type || 1);		
		$form.find('[name=admin]').prop('checked',data.admin);
		$dialog.dialog('open');	
 	},
 	
 	changeDialog: function($dialog, data)
 	{
	 	console.log(data.name + " " + data.value);
 	} 		
});
});