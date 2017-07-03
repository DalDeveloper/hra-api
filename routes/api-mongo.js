module.exports = function(Employees){
    var express = require('express');
    var fs = require('fs');
    var fsImpl = require('../aws'); console.log(fsImpl);
    var multiparty = require('connect-multiparty');
    var multipartMiddleware = multiparty();
    var Employee = require('../modules/employees');
    var EmployeeModel = require('../models/Employee');
    var UserModel = require('../models/User');
    var ClientModel = require('../models/Client');
    var passport = require('passport');
    var authController = require('../auth');
    var oauth2Controller = require('../auth2');
    var router = express.Router();
    var getImagePath = 'https://s3.amazonaws.com/' + fsImpl.getPath() + '/';
   
    /*****************************************************************************************************************
    ***************************************************** CURD START *************************************************
    ******************************************************************************************************************/

    // C = Create - This End point create a new employee.

    router.post('/employees/', multipartMiddleware, function(req, res, next) {
       
        var params = req.body; 
       
        // don't forget to delete all req.files when done
        var profilepic = req.files.profilepic; 
        
        if(profilepic){
         
          var stream = fs.createReadStream(profilepic.path);
          var imageName = (params.name + '_' + params.surname + '.' + (profilepic.name).split('.').pop()).toLowerCase();
          
         fsImpl.writeFile(imageName, stream).then(function() {
            fs.unlink(profilepic.path);	
            //console.log('It\'s saved!');
          }, function(reason) {
            throw reason;
          });
        }
        params.empId = Math.floor((Math.random() * 1000) + 1);
        params.image = imageName || ''; 
        var Emp = new EmployeeModel(params);
            Emp.save(function(err,Employee) {
              if (err) throw err;
                Employee.image = getImagePath + Employee.image;
                res.json({data: Employee, message:'Employee saved successfully!', status: 200});
            });
    });

    // U = Update - This End point update an employee.

    router.put('/employees/', multipartMiddleware, function(req, res, next) {
       var params = req.body; 
        // don't forget to delete all req.files when done
        var profilepic = req.files.profilepic; 
        
        if(profilepic){
         
          var stream = fs.createReadStream(profilepic.path);
          var imageName = (params.name + '_' + params.surname + '.' + (profilepic.name).split('.').pop()).toLowerCase();
          params.image = imageName;
         fsImpl.writeFile(imageName, stream).then(function() {
            fs.unlink(profilepic.path);	
            //console.log('It\'s saved!');
          }, function(reason) {
            throw reason;
          });
        }    
         EmployeeModel.findByIdAndUpdate(params._id, { $set: params}, { new: true }, function (err, Employee) {
          if (err) return handleError(err);
          
          if(Employee) res.status(200).json({data: Employee, message: 'Record updated successfully', status: 200});
        });

    });

    // R = Read - These two End points list employees or a single employee.
    
       // List all.

    router.get('/employees/', function(req, res, next) {
        var limit = req.params.limit || -1,
            offset = req.params.offset || 0,
            type = req.params.filter || 0,
            filters = req.query ? req.query : {}; delete filters._;
        var status = ['active', 'onleave', 'inactive'];

        var Emp = new EmployeeModel();
        
        var params = {limit: limit, offset: offset, filters: filters, sort_by: 'id'};
            Emp.search(params ,function(err, Employees) {
              if (err) throw err;
              // object of all the users
               results = Employees;
               results.forEach(function(element) {
                  if(element.image) element.image = getImagePath + element.image;
               }, this);
            if(type == 0) res.status(200).json({data: results, message: (results.length || 'No') +' record found', status: 200});
               else res.status(200).render('list-html', { title: 'Employee List', data:  results});
            });

       
    });

      //Employee by Id.
    router.get('/employees/:number', function(req, res, next) {
        var empId = req.params.number;
          if (isNaN(empId)) res.status(200).json({data: [], message:'Invalid Employee id', status: 200});
        else {
            EmployeeModel.find({empId: empId}).lean().exec(function(err, Employee) {
              if (err) throw err;
              
                if(Employee) {
                  if(Employee.length > 0) Employee[0].image = getImagePath + Employee[0].image;
                  res.status(200).json({data: Employee, message: (Employee.length || 'No') +' record found', status: 200});
                }  
            });
            
        };
    });

    // D = Delete - This End point delete an employee.

    router.delete('/employees/', function(req, res, next) {
      
      var empId = req.body.empId;
          if (isNaN(empId)) res.status(200).json({data: [], message:'Invalid Employee id', status: 200});
        else {
            EmployeeModel.find({empId: empId}).lean().exec(function(err, Employee) {
              if (err) throw err;
               if(Employee.length > 0){
                    objId = Employee[0]._id;
                  EmployeeModel.findByIdAndRemove(objId, function (err, Emp) {
                    if (err)  res.status(200).json({data: {}, message: "Invalid employee id", status: 200});  
                    if(Emp) res.status(200).json({data: {}, message: "1 Employee deleted", status: 200});
                    });
                  }
                else{
                    res.status(200).json({data: {}, message: "Employee not found", status: 200});  
                }    
            });
            
        };        

    });

    /****************************************************************************************************************
    **************************************************** CURD END ***************************************************
    *****************************************************************************************************************/
     
     // Create endpoint handlers for /users  
    router.get('/users/', authController.isAuthenticated, function(req, res, next) {

        UserModel.find(function(err, Users){
            if(err) throw err;
            res.json({data: Users}); 

         });       
    });

    // Create endpoint handlers for /users  
    router.post('/users/', function(req, res, next) {

       var User = new UserModel({
        username: req.body.username,
        password: req.body.password
      });

      User.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'New user added!' });
      });

   }); 


    router.post('/clients/', authController.isAuthenticated, function(req, res, next) {

      // Set the client properties that came from the POST data
      var client = new ClientModel();
        
      client.name = req.body.name;
      client.id = req.body.id;
      client.secret = req.body.secret;
      client.userId = req.user._id;

      // Save the client and check for errors
      client.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'Client added!', data: client });
      });

    });

    // Create endpoint /api/clients for GET
    router.get('/clients/', function(req, res) {
      // Use the Client model to find all clients
      ClientModel.find({ userId: req.user._id }, function(err, clients) {
        if (err)
          res.send(err);

        res.json(clients);
      }); 

    }); 

    // Create endpoint handlers for oauth2 authorize
    router.get('/oauth2/authorize', authController.isAuthenticated, oauth2Controller.authorization);
    router.post('/oauth2/authorize', authController.isAuthenticated, oauth2Controller.decision);

    // Create endpoint handlers for oauth2 token
    router.post('/oauth2/token', authController.isClientAuthenticated, oauth2Controller.token);
    
    return router;
}