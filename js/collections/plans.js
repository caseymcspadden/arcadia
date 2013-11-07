define([
  'underscore', 
  'backbone',
  'collections/grid', 
  'models/plan'
  ], function(_, Backbone, GridCollection, Plan) {
    return GridCollection.extend({

    // Reference to this collection's model.
    model: Plan,
    url: require.toUrl('').replace(/\/js\//,'/api/plans'),
    translate: function(key,value) {
	    if (key=='type' && this.lookupTables['plantypes'] !== undefined)
	    	return this.lookupTables['plantypes'][value] || '';
	    if (key=='idadvisor' && this.lookupTables['users'] !== undefined)
	    	return this.lookupTables['users'][value];
	    if (key=='idemployee' && this.lookupTables['users'] !== undefined)
	    	return this.lookupTables['users'][value];
	    if (key=='stage' && this.lookupTables['stages'] !== undefined)
	    	return this.lookupTables['stages'][value];
	    if (key=='last_touched_by' && this.lookupTables['lasttouch'] !== undefined)
	    	return this.lookupTables['lasttouch'][value];
	    if (key=='lastadvisorcomments')
	    	return value.length>0 ? 'Y' : '';
	    if (key=='data_request')
	    	return value==0 ? '' : 'Y';
	    if (key=='data_sent')
	    	return value==0 ? '' : 'Y';
	    if (key=='lastpreparercomments')
	    {
	    	var comments = value.split('\n'); 
	    	return (comments.length>0 ? comments[comments.length-1] : '');	
	    }	
	    return value;
    }
  });
});
