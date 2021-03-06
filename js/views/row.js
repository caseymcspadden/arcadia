define([
  'jquery', 
  'underscore', 
  'backbone'
  ], function($, _, Backbone){
  return Backbone.View.extend({

    //... is a list tag.
    tagName:  'tr',
    
    $editElement: null,
        
    // The DOM events specific to an item.
		/*
    events: {
      "click .check"              : "toggleDone",
      "dblclick div.todo-content" : "edit",
      "click span.todo-destroy"   : "clear",
      "keypress .todo-input"      : "updateOnEnter",
      'blur input': 'close'
    },
		*/
    events: {
		'mouseenter' : 'mouseEnter',
		'mouseleave' : 'mouseLeave',
		'click' : 'click'
		//'keypress .edit': 'updateOnEnter',
    //'blur .edit': 'doneEditing'
	},
		
    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.render);
      // in case the model is destroyed via a collection method
      // and not by a user interaction from the DOM, the view
      // should remove itself
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the contents of the todo item.
    // To avoid XSS (not that it would be harmful in this particular app),
    // we use underscore's "<%-" syntax in template to set the contents of the todo item.
    render: function() {
    	var vals = this.model.toJSON();
		var html='';
		_.each(this.model.collection.displayFields, function(obj) {
				html += '<td id="r-'+this.model.cid+'-f-'+obj.field+'" class="inner">' + this.model.collection.translate(obj.field,vals[obj.field]) + '</td>';
		},this);
	   html += '<td class="outer"></td>';
	   this.$el.attr('id','row-'+this.model.cid);
       this.$el.html(html);
       return this;
      //this.$el.html(this.template(this.model.toJSON()));
      //this.cacheInput();
    },

	click: function(e)
	{
		//this.doneEditing();
		//$e = $(e.target);
		///this.$editElement = $('#edit-text');
		//$('#edit-text').css('width',''+$e.width()+'px').css('height',''+$e.height()+'px');
		//this.$editElement.addClass('editing').width($e.width()).height($e.height()).position({my:'left top', at:'left top', of:$e}).val($e.html());
		//$('#edit-text').addClass('editing');
		//this.$editElement.on('keypress',{context:this},this.updateOnEnter);
		//this.$editElement.on('blur',{context:this},this.doneEditing);
		//console.log($('#edit-text'));
		var str = $(e.target).attr('id');
		this.model.trigger('edit',{model:this.model, field:str.substr(str.indexOf('f-')+2), event:e, element:$(e.target)});
	},
   
    mouseEnter: function(e)
    {
    	this.$el.addClass('hover');
    },
    
    mouseLeave: function(e)
    {
        this.$el.removeClass('hover');
    },

    // Remove this view from the DOM.
    // Remove event listeners from: DOM, this.model
    remove: function() {
      this.stopListening();
      this.undelegateEvents();
      this.$el.remove();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    },
    
    doneEditing: function() {
	    if (this.$editElement !== null)
	    {
	    	console.log("done editing");
	    	this.$editElement.removeClass('editing').off('keypress').off('blur');
	    }
	    this.$editElement = null;
    },
    
    updateOnEnter: function( e ) {
      if ( e.which === 13 ) {
        e.data.context.doneEditing();
      }
     }   
   });
});