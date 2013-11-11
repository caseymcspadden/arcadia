define([
	'jquery', 
 	'underscore', 
  'backbone',
  'text!templates/preferences.html'
  ], function($, _, Backbone,PreferencesTemplate){
  return Backbone.View.extend({

    //... is a list tag.
    tagName:  'div',
    
    $template: _.template(PreferencesTemplate),
    		
    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
    	this.$el.html( this.$template( this.model.toJSON() ) );
    
    	//this.preferences = options.preferences;
    	//this.today = options.today;
      //this.listenTo(this.model, 'change', this.render);
      // in case the model is destroyed via a collection method
      // and not by a user interaction from the DOM, the view
      // should remove itself
      //this.listenTo(this.model, 'destroy', this.remove);
      //this.listenTo(this.preferences, 'change', this.preferencesChanges)
    },

    // Re-render the contents of the todo item.
    // To avoid XSS (not that it would be harmful in this particular app),
    // we use underscore's "<%-" syntax in template to set the contents of the todo item.
    render: function() {
    	var vals = this.model.toJSON();
    	return this;
    }
  });
});