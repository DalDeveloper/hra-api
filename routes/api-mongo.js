module.exports = function(Employees){
    var express = require('express');
    var fs = require('fs');
    var fileUpload = require('express-fileupload');
    var fsImpl = require('../aws');
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
    var getImagePath = "http://localhost:8080/uploads/"; //'https://s3.amazonaws.com/' + fsImpl.getPath() + '/';
    var localUploadPath = "D:/ApacheWebroot/nodejs/hra-api/public/uploads/";

    /*****************************************************************************************************************
    ***************************************************** CURD START *************************************************
    ******************************************************************************************************************/

    // C = Create - This End point create a new employee.

    router.post('/employees/', function(req, res, next) {
       
        var params = req.body; 
        if(params._id) delete params._id; //console.log(params);
        if(params._$visited) delete params._$visited; //console.log(params);
        
        params.empId = Math.floor((Math.random() * 1000) + 1);
        params.image = params.image || ''; 
        var Emp = new EmployeeModel(params);
            Emp.save(function(err,Employee) {
              if (err) throw err;
                //Employee.image = getImagePath + Employee.image;
                res.json({data: Employee, message:'Employee saved successfully!', status: 200});
            });
    });

    // U = Update - This End point update an employee.

    router.put('/employees/', function(req, res, next) { console.log(req.body);
       var params = req.body; 
       var empId = params.empId;
       if (isNaN(empId)) res.status(200).json({data: [], message:'Invalid Employee id', status: 200});
       else {
         EmployeeModel.findOneAndUpdate({empId: empId}, { $set: params}, { new: true }, function (err, Employee) {
            if (err) return handleError(err);
            if(Employee){
              Employee.image = getImagePath + Employee.image;
              res.status(200).json({data: Employee, message: 'Employee updated successfully', status: 200}); }
            else{
              res.status(200).json({data: {}, message: 'No record found', status: 200});
            }  
         });
            
        };
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
            EmployeeModel.findOne({empId: empId}).lean().exec(function(err, Employee) {
              if (err) throw err;
              
                if(Employee) {
                  Employee.image = getImagePath + Employee.image;
                  res.status(200).json({data: Employee, message: '1 record found', status: 200});
                } else{
                    res.status(200).json({data: {}, message: 'No record found', status: 200});
                } 
            });
            
        };
    });

    // D = Delete - This End point delete an employee.

    router.delete('/employees/:number', function(req, res, next) {
      
      var empId = req.params.number;
          if (isNaN(empId)) res.status(200).json({data: [], message:'Invalid Employee id', status: 200});
        else {
            EmployeeModel.findOneAndRemove({empId: empId}, function (err, Employee) {
                if (err)  throw err;  
                if(Employee) res.status(200).json({data: {}, message: "Employee deleted", status: 200});
                else res.status(200).json({data: {}, message: "Employee Not Found", status: 200});
            });
            
        };        

    });

    /****************************************************************************************************************
    **************************************************** CURD END ***************************************************
    *****************************************************************************************************************/
     //File Upload

     router.put('/upload/', fileUpload(), function(req, res, next) {
       
        var params = JSON.parse(req.body.details);
        var image = req.files.image;
        var rand = Math.floor((Math.random() * 100000000000) + 1);

        if(image){
         
         // var stream = fs.createReadStream(image.path);
          var imageName = (params.name + '_' + params.surname + '_' + rand + '.' + (image.name).split('.').pop()).toLowerCase();
          params.image = imageName;

          //AWS Upload Scripts

         /*fsImpl.writeFile(imageName, stream).then(function() {
            fs.unlink(image.path);	
            //console.log('It\'s saved!');
          }, function(reason) {
            throw reason;
          });*/

          // Local Upload

         image.mv(localUploadPath + imageName, function(err) {
              if (err) throw err;
              
              
            var empId = params.empId;
          
            if (isNaN(empId)) res.status(200).json({data: [], message:'Invalid Employee id', status: 200});
            else {

              EmployeeModel.findOneAndUpdate({empId: empId}, { $set: params}, { new: true }, function (err, Employee) {
                  if (err) return handleError(err);
                  if(Employee){
                    Employee.image = getImagePath + Employee.image;
                    res.status(200).json({data: Employee, message: 'File uploaded successfully', status: 200}); }
                  else{
                    res.status(200).json({data: {}, message: 'No record found', status: 200});
                  }  
              });   
            };

          });
          

        }else{
           res.status(404).json({data: {}, message: 'No image found', status: 404});
        }
    });

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