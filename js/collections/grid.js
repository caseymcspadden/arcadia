define([
  'underscore', 
  'backbone' 
  ], function(_, Backbone){

    return Backbone.Collection.extend({
    
    	lookupTables: {},
    
		displayFields: [],
		
		sortAscending: true,
		
		setDisplayFields: function(arr) {this.displayFields=arr;},
						
		addLookupTableFromArray: function(name,arr,keyField,valueField) {
			var table = {};
			_.each(arr,function(item) {
				table[item[keyField]] = item[valueField];
			});
			this.lookupTables[name]=table;
			console.log(this.lookupTables);
		},

		translate: function(key,value) {return value;},
		
		parse: function(response) {
			return response;
		}
  });
});
