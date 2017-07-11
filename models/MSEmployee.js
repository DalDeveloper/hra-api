(function (MSEmployee) {
    var tedious = require('tedious');
    var request;
    var type;
    var getImagePath = "http://localhost:8080/uploads/"; 
    function openConnection(callback) {
        var connection = require('../msdb.js')();
        console.log(connection);
        connection.on("connect", function (error) {
            if (error) {

                callback(error,null);
            }
            else {
                callback(null, connection);
            }
        });
    }

    MSEmployee.getEmployeeList =  function (next) {
        openConnection(function (error,connection) {
            if (error != null) {
                console.log("Failed To Connect DB.Error : " + error);
                next(error, null);
            }
            else {
              request = new tedious.Request("spNode_GetEmployeeList", function (err, resultSet, rows) {
                    if (err) {
                        next(err, null);
                    }
                    else {
                        var returndata = [];
                        rows.forEach(function (columns) {
                            var returnRow = {};
                            columns.forEach(function (column) {
                                if(column.metadata.colName =='image')
                                    returnRow[column.metadata.colName] = getImagePath+ column.value;
                                else
                                    returnRow[column.metadata.colName] = column.value;
                            });

                            returndata.push(returnRow);
                        });
                        var result ={};
                        result.data = returndata;
                        result.status = "success";
                        next(null, result);
                    }
                    connection.close();
                });
                connection.callProcedure(request);
            }
        });
    }

    MSEmployee.getEmployeeByID = function(empID, next) {
        openConnection(function (error, connection) {
            if (error != null) {
                console.log("Failed To Connect DB.Error : " + error);
                next(error, null);
            }
            else {
                type = tedious.TYPES;
                request = new tedious.Request("spNode_GetEmployeeByID", function (err, resultSet, rows) {
                    if (err) {
                        next(err, null);
                    }
                    else {
                        var returndata = [];
                        rows.forEach(function (columns) {
                            var returnRow = {};
                            columns.forEach(function (column) {
                                 if(column.metadata.colName =='image')
                                    returnRow[column.metadata.colName] = getImagePath+ column.value;
                                else
                                    returnRow[column.metadata.colName] = column.value;
                            });

                            returndata.push(returnRow);
                        });
                        //next(null, returndata);
                        var result ={};
                        result.data = returndata;
                        result.status = "success";
                        next(null, result);
                    }
                    connection.close();
                });
                request.addParameter('empID', type.BigInt, empID);
                connection.callProcedure(request);
            }
        });
    }

    MSEmployee.InsertUpdateEmployeeData = function(EmpJSON, next) {
        openConnection(function (error, connection) {
            if (error != null) {
                console.log("Failed To Connect DB.Error : " + error);
                next(error, null);
            }
            else {
                if (EmpJSON != null) {
                    type = tedious.TYPES;
                    request = new tedious.Request("spNode_InsertUpdate_Employee", function (err, resultSet, rows) {
                        if (err) {
                            next(err, null);
                        }
                        else {
                            var returndata = [];
                            returndata.push({ status: 'success' });
                            next(null, returndata);
                        }
                        connection.close();
                    });

                    if(EmpJSON.Image == undefined) {
                        EmpJSON.Image = '';
                    }
                    request.addParameter('EmpID', type.BigInt, EmpJSON.EmpID);
                    request.addParameter('Name', type.VarChar, EmpJSON.Name);
                    request.addParameter('SurName', type.VarChar, EmpJSON.SurName);
                    request.addParameter('Gender', type.VarChar, EmpJSON.Gender);
                    request.addParameter('DOB', type.Date, EmpJSON.DOB);
                    request.addParameter('DOJ', type.Date, EmpJSON.DOJ);
                    request.addParameter('Email', type.VarChar, EmpJSON.Email);
                    request.addParameter('Mobile', type.VarChar, EmpJSON.Mobile);
                    request.addParameter('Address', type.VarChar, EmpJSON.Address);
                    request.addParameter('BGroup', type.VarChar, EmpJSON.BGroup);
                    request.addParameter('Designation', type.VarChar, EmpJSON.Designation);
                    request.addParameter('Exp', type.VarChar, EmpJSON.Exp);
                    request.addParameter('Age', type.Int, EmpJSON.Age);
                    request.addParameter('Pan_No', type.VarChar, EmpJSON.Pan_No);
                    request.addParameter('Status', type.VarChar, EmpJSON.Status);                    
                    request.addParameter('Image', type.VarChar, EmpJSON.Image);
                    connection.callProcedure(request);
                }
            }
        });
    }

    MSEmployee.DeleteEmployeeData = function(EmpID, next) {
        openConnection(function (error, connection) {
            if (error != null) {
                console.log("Failed To Connect DB.Error : " + error);
                next(error, null);
            }
            else {
                if (EmpID != null) {
                    type = tedious.TYPES;
                    request = new tedious.Request("spNode_Delete_Employee", function (err, resultSet, rows) {
                        if (err) {
                            next(err, null);
                        }
                        else {
                            var returndata = [];
                            returndata.push({ status: 'success' });
                            next(null, returndata);
                        }
                        connection.close();
                    });
                    request.addParameter('EmpID', type.BigInt, EmpID);
                    connection.callProcedure(request);
                }
            }
        });
    }
})(module.exports);