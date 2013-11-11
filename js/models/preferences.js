define(['underscore', 'backbone'], function(_, Backbone) {
  	preferences = Backbone.Model.extend({
	    
   	 	id: 'default',
   	 	
   	 	url: require.toUrl('').replace(/\/js\//,'/api/preferences'),
	    
	    defaults: {
				duedays: 5,
				reddays: 5,
				feeddays: 5
			},

			initialize: function() {
				this.fetch();			
			}
  });
  return new preferences;
});