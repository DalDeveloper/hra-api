var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmployeeSchema = new Schema({
	empId: String,
	name: String,
	surname: String,
	gender: String,
	dob: String,
	doj: String,
	age: Number,
	email: String,
	mobile: String,
	address: String,
	bgroup: String,
	image: String,
	designation: String,
	exp: Number,
	pan_no: String,
	status: String
});
EmployeeSchema.methods.search = function(params, cb){
	  return this.model('Employee').find(params.filters,cb).sort('empId').lean();

}
var Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee;