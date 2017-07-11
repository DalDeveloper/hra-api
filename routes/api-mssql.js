    module.exports = function(){
        var express = require('express');
        var objEmployee = require('../models/MSEmployee');
        var router = express.Router();
        router.get('/employee/', function (req, res, next) {           
           objEmployee.getEmployeeList(function (error, result) {
                if (result != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(result);
                }
                else if (error != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(error);
                }
            });
        });
        router.get('/employee/:id', function (req, res, next) {
            objEmployee.getEmployeeByID(req.params.id,function (error, result) {
                if (result != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(result);
                }
                else if (error != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(error);
                }
            });
        });
        router.post('/addEmployee', function (req, res, next) {
            console.log(req.body);
            var EmpJSON = [];
            EmpJSON.EmpID = 0;
            EmpJSON.Name = req.body.name;
            EmpJSON.SurName = req.body.surname;
            EmpJSON.Gender = req.body.gender;
            EmpJSON.DOB = req.body.dob;
            EmpJSON.DOJ = req.body.doj;
            EmpJSON.Email = req.body.email;
            EmpJSON.Mobile = req.body.mobile;
            EmpJSON.Address = req.body.address;
            EmpJSON.BGroup = req.body.bgroup;
            EmpJSON.Designation = req.body.designation;
            EmpJSON.Exp = req.body.exp;
            EmpJSON.Age = req.body.age;
            EmpJSON.Pan_No = req.body.pan_no;
            EmpJSON.Status = req.body.status;
            EmpJSON.Image = req.body.image;
            objEmployee.InsertUpdateEmployeeData(EmpJSON, function (error, status) {
                if (status != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(status);
                }
                else if (error != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(error);
                }
            });
        });

        router.post('/editEmployee', function (req, res, next) {
            var EmpJSON = [];
            EmpJSON.EmpID = req.body.empId;
            EmpJSON.Name = req.body.name;
            EmpJSON.SurName = req.body.surname;
            EmpJSON.Gender = req.body.gender;
            EmpJSON.DOB = req.body.dob;
            EmpJSON.DOJ = req.body.doj;
            EmpJSON.Email = req.body.email;
            EmpJSON.Mobile = req.body.mobile;
            EmpJSON.Address = req.body.address;
            EmpJSON.BGroup = req.body.bgroup;
            EmpJSON.Designation = req.body.designation;
            EmpJSON.Exp = req.body.exp;
            EmpJSON.Age = req.body.age;
            EmpJSON.Pan_No = req.body.pan_no;
            EmpJSON.Status = req.body.status;
            EmpJSON.Image = req.body.image;
            objEmployee.InsertUpdateEmployeeData(EmpJSON, function (error, status) {
                if (status != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(status);
                }
                else if (error != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(error);
                }
            });
        });

        router.post('/deleteEmployee/:id', function (req, res, next) {
            objEmployee.DeleteEmployeeData(req.params.id, function (error, status) {
                if (status != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(status);
                }
                else if (error != null) {
                    res.set("Content-Type", "application/JSON");
                    res.json(error);
                }
            });
        });

        return router;

    }