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
	    if (key=='due_date' || key=='office_due')
			return value.dashDateToSlashDate();
	    if (key=='last_touched_by' && this.lookupTables['lasttouch'] !== undefined)
	    	return this.lookupTables['lasttouch'][value];
	    if (key=='lastadvisorcomments')
	    	return value.length>0 ? 'Y' : '';
	    if (key=='data_request' || key=='data_sent')
	    	return value=='0000-00-00' ? '' : value.dashDateToSlashDate();
	    if (key=='lastpreparercomments')
	    {
	    	var comments = value.split('\n'); 
	    	return (comments.length>0 ? comments[comments.length-1] : '');	
	    }	
	    return value;
    },
    
    sortTranslate: function(key,value) {
	    if (key=='due_date' || key=='office_due')
			return value;
		return this.translate(key,value);
    },

    encode: function(data)
    {
    	var actionstages = {0:2, 1:2, 11:3, 12:4, 13:5, 21:2, 22:3, 23:4, 126:126, 127:127};
    
		data.stage = actionstages[data.idaction] || data.stage;
		data.due_date = data.due_date.slashDateToDashDate();
		data.office_due = data.office_due.slashDateToDashDate();
		return data;    
    }
  });
});
