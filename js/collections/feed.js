define([
  'underscore', 
  'backbone',
  'collections/grid', 
  'models/plan'
  ], function(_, Backbone, GridCollection, Feed) {
    return GridCollection.extend({

    // Reference to this collection's model.
    model: Feed,
    url: require.toUrl('').replace(/\/js\//,'/api/feed'),
    translate: function(key,value) {
	    return value;
    }
  });
});
