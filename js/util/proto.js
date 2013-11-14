String.prototype.addSlashes = function() 
{ 
   //no need to do (str+'') anymore because 'this' can only be a string
   return this.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

String.prototype.dashDateToSlashDate = function()
{
	if (this.indexOf('-')<0) return this;
	return this.substr(5, 2) + '/' + this.substr(8, 2) + '/' + this.substr(0, 4);
}

String.prototype.slashDateToDashDate = function()
{
	if (this.indexOf('/')<0) return this;
	return this.substr(6, 4) + '-' + this.substr(0, 2) + '-' + this.substr(3, 2);
}

Date.prototype.toMySql = function()
{
	return this.getFullYear().toString() + '-' + (this.getMonth()+101).toString().substr(1, 2) + '-' + (this.getDate()+100).toString().substr(1, 2);
}

Date.prototype.toSlashDate = function()
{
	return (this.getMonth()+101).toString().substr(1, 2) + '/' +  (this.getDate()+100).toString().substr(1, 2) + '/' + this.getFullYear().toString();
}