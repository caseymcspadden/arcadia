// site/js/views/library.js

define (['underscore', 'backbone', 'views/row', 'jqueryui'], function(_, Backbone, RowView) {

return Backbone.View.extend({
    el: '#CRBody',
    
    $head: null,
    
    $body: null,
 
    sortHeader: null,
        
    resizeElement: null,
    
    dialog: null,
    
    preferencesDialog: null,
            
    events:{
    	'change .monitor': 'contentChanged',
    	'click #gridheader table th': 'headerClick',
    	'mousedown #gridheader table th.inner span.resize': 'beginResize',
    	'mouseup #gridheader,#gridbody': 'endResize',
    	'mousemove #gridheader,#gridbody': 'mouseMove',
    	'click input.display-header-checkbox': 'displayHeader'
	},

	initialize: function(options) {
		this.template = _.template(options.template);
    	this.$el.html(this.template());
		this.$head = this.$el.find('#gridheader thead');
		this.$body = this.$el.find('#gridbody tbody');

	 	if (options.dialog!==undefined)
	 	{
	 		var def = options.dialog;
		 	
	 		this.dialog = this.$el.find(def.id).dialog({
				title: def.title || '',
				autoOpen: false,
				//height: def.height || 250,
				width: def.width || 350,
				modal: def.modal===undefined ? true : def.modal,
				context: this,
				appendTo: this.el,
				position: {my:"left top", at:"left bottom", of:(def.newbutton||this.$el)},
				buttons: {
					"Submit": function() {
						var collection = $(this).dialog('option','context').collection;
						var data = collection.encode($(this).find('form').serializeObject());
						if (data.id=='0')
						{
							console.log('creating');
							console.log(data);
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
			
			this.events['click ' + def.newbutton]='newModel';
			$(def.id + ' .date').datepicker();
	 	}
    	
    	if (options.preferencesButton!==undefined)
	 	{
			this.events['click ' + options.preferencesButton]='preferencesClicked';
				 		
	 		this.preferencesDialog = $("<div><p>Display Columns:</p><table><tbody></tbody></table></div>").dialog({
				title: 'Display Preferences',
				autoOpen: false,
				//height: def.height || 250,
				width: 350,
				modal: false,
				context: this,
				appendTo: this.el,
				position: {my:"left top", at:"left bottom", of:options.preferencesButton},
				buttons: {
					"Save":  function() {$(this).dialog('close');},
					"Cancel":  function() {$(this).dialog('close');}
					}
			});
			
			_.each(this.collection.displayFields, function(item) {
				var checked = true;
				this.preferencesDialog.find('tbody').append($('<tr><td><input class="display-header-checkbox" type="checkbox" name="' + item.field + '"' + (checked ? ' checked' : '') + '></td><td>' + item.header + '</td></tr>'));
			},this);
			
    	}

    	$('#gridbody').on('scroll', function () {
			$('#gridheader').scrollLeft($(this).scrollLeft());
		});
    	this.renderHead();
        
		this.collection.fetch({reset: true}); // NEW
        
		this.listenTo( this.collection, 'add', this.renderRow );
		this.listenTo( this.collection, 'reset', this.renderRows );
		this.listenTo( this.collection, 'sort', this.renderRows );
		this.listenTo( this.collection, 'edit', this.editModel );
	},
    
		/*
	addBook: function( e ) {
    	e.preventDefault();

		var formData = {};

		$( '#addBook div' ).children( 'input' ).each( function( i, el ) {
        	if( $( el ).val() != '' )
			{
            	formData[ el.id ] = $( el ).val();
			}
		});
		this.collection.create(formData);
	},
		*/

    render: function() {
    	this.renderHead();
		this.renderRows();
	},
     
    renderHead: function()
    {
			var html='<tr>';
			for (var i=0;i<this.collection.displayFields.length;i++)
			{
				var obj = this.collection.displayFields[i];
				var cls = (i<this.collection.displayFields.length-1 ? 'inner' : 'outer');
				html += '<th class="' + cls + '" id="h1_' + obj.field + '">' + obj.header + '<span class="sort"></span><span class="CRFloatRight resize"></span></th>';
			}
			html += '</tr>';
			this.$head.html(html);
    },

    renderRows: function( item ) {
 			var html='<tr>';
 			for (var i=0;i<this.collection.displayFields.length;i++)
 			{
				var obj = this.collection.displayFields[i];
				var cls = (i<this.collection.displayFields.length-1 ? 'inner' : 'outer');
				html += '<th class="' + cls + '" id="h2_' + obj.field + '"/>';
			}
			html += '</tr>'
			this.$body.html( html ); 	  	
			this.collection.each(function( item ) {
            this.renderRow( item );
			}, this );
    },

    renderRow: function( item ) {
        var rowView = new RowView({
            model: item
        });
        this.$body.append( rowView.render().el );
    },
    
    headerClick: function(e)
    {
    	if (this.resizeElement)
    	{
			this.resizeElement=null;
    		return;
    	}
    
    	var selected = $(e.currentTarget).attr('id').substr(3);
    	if (selected == this.sortHeader)
    	{
	    	this.$el.find('#h1_' + selected +' span.sort').removeClass(this.collection.sortAscending ? 'ui-icon-triangle-1-n' : 'ui-icon-triangle-1-s').addClass(this.collection.sortAscending ? 'ui-icon-triangle-1-s' : 'ui-icon-triangle-1-n');
	    	this.collection.sortAscending = !this.collection.sortAscending;
    	}
    	else
    	{
    		this.collection.sortAscending = true;
    		if (this.sortHeader)
			this.$el.find('#h1_' + this.sortHeader +' span.sort').toggleClass('ui-icon ui-icon-triangle-1-n');
			this.$el.find('#h1_' + selected + ' span.sort').toggleClass('ui-icon ui-icon-triangle-1-n');
		}
		this.sortHeader = selected;
		this.collection.sortField=this.sortHeader;
		this.collection.sort();
		//this.collection.fetch({reset:true, data:{'sortBy': (this.collection.sortAscending ? '+' : '-')+this.sortHeader}});
    },
    
    beginResize: function(e)
    {
    	var $headElement = $(e.target).parent();
		this.resizeElement = {field: $headElement.attr('id').substr(3), origWidth: $headElement.width(), origX: e.pageX};
    },
    
    endResize: function(e) 
    {
    	var totwidth=0;
    	_.each(this.$el.find('#gridheader .inner'), function(item) {
	    	totwidth += $(item).width();
    	});
    	var maxwidth = this.$el.width();
    	//if (totwidth < maxwidth)
    	//	this.$el.find('#gridheader table, #gridbody table').width(maxwidth);
    },
    
    mouseMove: function(e)
    {
	    if (this.resizeElement)
	    {
	    	//console.log(e);
	    	$('#h1_'+this.resizeElement.field +',#h2_'+this.resizeElement.field).width(this.resizeElement.origWidth + e.pageX - this.resizeElement.origX);
				e.preventDefault();
		}
	},
	
	editModel: function(arg)  // arg is an object {element:el , field:field, model:mod, event:e} from collection's "edit" event
	{
		if (this.dialog!==null)
		{
			this.dialog.dialog('option','position',{my:'left top', at:'left bottom', of:arg.element});
			var data = arg.model.toJSON();
			this.trigger('launchDialog',this.dialog,data,arg.field);
		}
	},

	newModel: function(e)
	{
		if (this.dialog!==null)
		{
			this.trigger('launchDialog',this.dialog,{},'');
		}
	},
	
	contentChanged: function(e)  // called when
	{
		$target = $(e.target);
		this.trigger('changeDialog',this.dialog,{name:$target.attr('name'), value:$target.val()});
	},
	
	preferencesClicked: function()
	{
		if (this.preferencesDialog!==null)
			this.preferencesDialog.dialog('open');
	},
	
	displayHeader: function(e)
	{
		var name = $(e.target).attr('name');
		$('#h1_' + name +',#h2_'+name+',td.field-'+name).toggleClass('CRHidden');
	}
});
});