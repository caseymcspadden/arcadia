define([
  'underscore', 
  'backbone',
  'collections/grid', 
  'models/user'
  ], function(_, Backbone, GridCollection, User) {
    return GridCollection.extend({

    // Reference to this collection's model.
   model: User,
   url: require.toUrl('').replace(/\/js\//,'/api/users'),
   translate: function(key,value) {
		if (key=='user_type')
			return (value==1 ? 'Advisor' : 'Employee');
		else if (key=='admin')
			return (value==1 ? 'X' : '');
	    return value;
    }
  });
});
