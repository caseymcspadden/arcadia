define([
  'jquery', 
  'underscore', 
  'backbone'
  ], function($, _, Backbone){
  return Backbone.View.extend({

    //... is a list tag.
    tagName:  'tr',
        
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
				html += '<td class="field-' + obj.field +'">' + this.model.collection.translate(obj.field,vals[obj.field]) + '</td>';
			},this);
			this.$el.attr('id','row-'+this.model.cid);
      this.$el.html(html);
      return this;
      //this.$el.html(this.template(this.model.toJSON()));
      //this.cacheInput();
    },

	click: function(e)
	{
		this.model.trigger('edit',{model:this.model, field:$(e.target).attr('class').substr(6), event:e, element:this.$el});
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
    }

  });
});