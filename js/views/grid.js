// site/js/views/library.js

define (['underscore', 'backbone', 'views/row', 'models/preferences', 'views/preferences', 'jqueryui', 'jquerycookie'], function(_, Backbone, RowView, preferences, PreferencesView) {

return Backbone.View.extend({
    el: '#CRBody',
    
    $head: null,
    
    $body: null,
    
    $editText: null,
 
    sortHeader: null,
        
    resizeElement: null,
    
    dialog: null,
    
    preferences: preferences,     // Instantiated Preferences Model  
    
	preferencesView: null,        // preferences view contained in preferences dialog
 
    preferencesDialog: null,      // number of days in feed, etc.
    
    displayColumnsDialog: null,   // which columns are hidden
    
    today: new Date(),
    
    name: '',
    
    rowViews: [],
            
    events:{
    	'change .monitor': 'contentChanged',
    	'click #gridheader table th': 'headerClick',
    	'mousedown #gridheader table th.inner span.resize': 'beginResize',
    	'mouseup #gridheader,#gridbody': 'endResize',
    	'mousemove #gridheader,#gridbody': 'mouseMove',
    	'click input.display-header-checkbox': 'toggleColumnVisibility'
	},

	initialize: function(options) {
		
		this.name=options.name;
		this.template = _.template(options.template);
		this.$el.html(this.template());
		this.$head = this.$el.find('#gridheader thead');
		this.$head2 = this.$el.find('#gridbody thead');
		this.$body = this.$el.find('#gridbody tbody');
		this.$el.append('<input id="edit-text" type="text" class="inline-edit">');
		this.$el.append('<select id="edit-select" class="inline-edit"></select>');

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
    	
    	if (options.displayColumnsButton!==undefined)
	 	{
			this.events['click ' + options.displayColumnsButton]='displayColumnsClicked';
				 		
	 		this.displayColumnsDialog = $("<div><p>Display Columns:</p><table><tbody></tbody></table></div>").dialog({
				title: 'Display Columns',
				autoOpen: false,
				//height: def.height || 250,
				width: 350,
				modal: false,
				context: this,
				appendTo: this.el,
				position: {my:"left top", at:"left bottom", of:options.displayColumnsButton},
				buttons: {
					"Close":  function() {$(this).dialog('close');}
					}
			});
			
			var hidden = (this.name===undefined || $.cookie(this.name)===undefined) ? [] : $.cookie(this.name).split('.');
			
			_.each(this.collection.displayFields, function(item) {
				var checked = !_.contains(hidden,item.field);
				this.displayColumnsDialog.find('tbody').append($('<tr><td><input class="display-header-checkbox" type="checkbox" name="' + item.field + '"' + (checked ? ' checked' : '') + '></td><td>' + item.header + '</td></tr>'));
			},this);
			
    	}
    	$('#gridbody').on('scroll', function () {
			$('#gridheader').scrollLeft($(this).scrollLeft());
		});
    
		if (options.preferencesButton !== undefined)
		{
			var that = this;
			this.preferencesView=new PreferencesView({model:preferences});
			this.$el.find('#test').html(this.preferencesView.el);
	 		this.preferencesDialog = $(this.preferencesView.el).dialog({
				title: 'Preferences',
				autoOpen: false,
				//height: def.height || 250,
				width: 350,
				modal: true,
				context: this,
				appendTo: this.el,
				position: {my:"left top", at:"left bottom", of:options.preferencesButton},
				buttons: {
					"Submit":  function() {that.preferences.save($(this).find('form').serializeObject());$(this).dialog('close');},
					"Close":  function() {$(this).dialog('close');}
					}
			});
			console.log(options.preferencesButton);
			$(options.preferencesButton).click(function(e) {console.log(that);that.preferencesDialog.dialog('open');});
			this.listenTo( this.preferences, 'change', this.preferencesChanged)
		}
    
		this.renderHead();
        
		this.collection.fetch({reset: true}); // NEW
        
		this.listenTo( this.collection, 'add', this.renderRows );
		this.listenTo( this.collection, 'reset', this.renderRows );
		this.listenTo( this.collection, 'change', this.modelChanged );
		//this.listenTo( this.collection, 'sort', this.sortRows );
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

 			html='<tr>';
 			for (var i=0;i<this.collection.displayFields.length;i++)
 			{
				var obj = this.collection.displayFields[i];
				var cls = (i<this.collection.displayFields.length-1 ? 'inner' : 'outer');
				html += '<th class="' + cls + '" id="h2_' + obj.field + '"/>';
			}
			html += '</tr>'
			this.$head2.html( html ); 	  	
			$('#gridbody').height($(window).height()-220);
    },

    sortRows: function(item)
    {
    	console.log('sorting');
	    this.renderRows(item);
    },
    
    renderRows: function( item ) {
    	_.each(this.rowViews, function(view) {
	    	view.remove();
    	})
    	this.rowViews = [];
    	
		this.collection.each(function( item ) {
      	this.renderRow( item );
			}, this );
		this.setColumnVisibility();
    },
    
    preferencesChanged: function()
    {
    	console.log("preferences changed!");
		
    },
    
    modelChanged: function(model)
   	{
		var $row = this.$body.find('#row-' + model.cid);
        
		var hidden = $.cookie(this.name)===undefined ? [] : $.cookie(this.name).split('.');

		_.each(hidden,function(name) {
			$row.find('td.field-'+name).addClass('CRHidden');
		},this);   	
	}, 
		
    renderRow: function( item ) {
        var rowView = new RowView({
            model: item
        });
        this.rowViews.push(rowView);
        this.$body.append( rowView.render().el );
        //$('#gridbody').height($(window).height()-220);
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
		this.renderRows();
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
		console.log(arg);
		if (this.dialog!==null)
		{
			this.dialog.dialog('option','position',{my:'left top', at:'left bottom', of:arg.element});
			var data = arg.model.toJSON();
			this.trigger('beginEditing',this.dialog,data,arg.field);
		}
	},

	newModel: function(e)
	{
		if (this.dialog!==null)
		{
			this.trigger('beginEditing',this.dialog,{},'');
		}
	},
	
	contentChanged: function(e)  // called when
	{
		$target = $(e.target);
		this.trigger('changeDialog',this.dialog,{name:$target.attr('name'), value:$target.val()});
	},
	
	displayColumnsClicked: function()
	{
		if (this.displayColumnsDialog!==null)
			this.displayColumnsDialog.dialog('open');
	},
	
	setColumnVisibility: function(hidden)
	{
		if (hidden===undefined)
			hidden = (this.name===undefined || $.cookie(this.name)===undefined) ? [] : $.cookie(this.name).split('.');
		this.$el.find('#gridheader th,#gridbody th,#gridbody td').removeClass('CRHidden');
		_.each(hidden,function(name) {
				this.$el.find('#h1_' + name +',#h2_'+name+',td.field-'+name).addClass('CRHidden');
		},this);
	},

	toggleColumnVisibility: function(e)
	{
		var hidden = [];
		
		$('.display-header-checkbox').each(function(i,item) {
			if (!$(item).is(':checked'))
				hidden.push($(item).attr('name'));
		});
		$.cookie(this.name,hidden.join('.'),{expires:365});
		this.setColumnVisibility(hidden);
	}
});
});