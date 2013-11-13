define([
  'underscore', 
  'backbone' 
  ], function(_, Backbone){

    return Backbone.Collection.extend({
    
    	initialize: function(options)
		{
	 		if (options!==undefined && options.url !== undefined)
	 			this.url = options.url;
		},
		
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
		},

		translate: function(key,value) {return value;},

		sortTranslate: function(key,value) {return value;},
		
		encode: function(data) {return data;},   // this is called before data is sent to the server
		
		parse: function(response) {
			return response;
		},
		
		comparator: function(a,b)
		{
			if(this.sortField===undefined)
				return 0;
			var aval = this.sortTranslate(this.sortField,a.get(this.sortField));
			var bval = this.sortTranslate(this.sortField,b.get(this.sortField));
			var comp = aval.localeCompare(bval);
			return this.sortAscending ? comp : -comp;
		}
  });
});
