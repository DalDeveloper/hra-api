var Employee = function(){

	this.values = {
		empId: null,
		name: null,
		surname: null,
		gender: null,
		dob: null,
		doj: null,
		email: null,
		mobile: null,
		address: null,
		bgroup: null,
		image: null,
		resume: null,
		designation: null,
		exp: null,
		salary: null,
		pan_no: null,
		status: null
	};

	this.setInfo = function(info){
		for(var val in this.values){
			if(this.values[val] !== 'undefined'){
				this.values[val] = info[val];
			}
		}
	};


	this.getInfo = function(){

		return this.values;
	}

	this.updateProfile = function(field, val){

		if(field != 'empId' ) this.values[field] = val;
		
	}
}

module.exports = function(info){

	var emp = new Employee();
	emp.setInfo(info);

	return emp; 

}