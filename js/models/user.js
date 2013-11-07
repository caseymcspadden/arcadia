define(['underscore', 'backbone', 'models/row'], function(_, Backbone, RowModel) {
  	return RowModel.extend({

    // Default attributes for the todo.
    defaults: {
      username: '',
      name: '',
      email: '',
      created_at: '',
      updated_at: '',
      user_type: 1,
      admin: 0,
      active: 1
     },

    initialize: function() {
    },
    
    validate: function(attrs) {
	    console.log(attrs);
    }
    
    
  });
});