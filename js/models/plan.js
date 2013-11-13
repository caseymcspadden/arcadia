define(['underscore', 'backbone', 'models/row'], function(_, Backbone, RowModel) {
  	return RowModel.extend({

    // Default attributes for the todo.
    defaults: {
	  type: 1,
	  stage: 1,
	  waiting_on: 1,
	  doc_count: 0,
	  fee: 0,
	  payment_method: 1,
	  balance_due: 0,
	  data_request: '0000-00-00',
	  data_received: '0000-00-00',
	  data_sent: '0000-00-00',
	  data_acknowledged: '0000-00-00',
	  flagged: 0,
	  attention: 0,
	  active: 1,
	  lastadvisorcomments: '',
	  lastpreparercomments: ''  
     },

    initialize: function() {
    }
  });
});