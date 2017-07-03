module.exports = function(Employees){
    var express = require('express');
    var router = express.Router();
    var Employee = require('../modules/employees');
    var EmployeeModel = require('../models/Employee');
    var UserModel = require('../models/User');
    var ClientModel = require('../models/Client');
    var passport = require('passport');
    var authController = require('../auth');
    var oauth2Controller = require('../auth2');

    /*****************************************************************************************
    ******************************************************************************************/

    router.get('/test/', function(req, res, next){
      res.render('emp');
    });

    router.post('/employees/add/', function(req, res, next) {
       
        var params = req.body.data;
        delete params[0]._id; params[0].empId = Math.floor((Math.random() * 1000) + 1);
        var Emp = new EmployeeModel(params[0]);
            Emp.save(function(err) {
              if (err) throw err;
                res.json({data: params[0], message:'Employee saved successfully!', status: 200});
            });

      
    });

    router.get('/employees/:number', function(req, res, next) {
        var empId = req.params.number; 
          if (typeof empId == '') res.json({data: [], message:'Invalid Employee id', status: 200});
        else {
            EmployeeModel.find({empId: empId}).lean().exec(function(err, Employee) {
              if (err) throw err;
                console.log(Employee);
                if(Employee) {
                  Employee[0].lastViewedId = req.session.lastViewedId;
                  res.json({data: Employee, message: Employee.length +' record found', status: 200});
                }
                else res.json({data: [], message: 'No record found', status: 200});    
            });
            
        };
        console.log(1);
        req.session.lastViewedId = empId;
    });

    router.put('/employees/update/', function(req, res, next) {
       var params = req.body.data; 
       
       for(var row in params){ console.log(params[row]._id); console.log(params[row]);
            
         EmployeeModel.findByIdAndUpdate(params[row]._id, { $set: params[row]}, { new: true }, function (err, Employee) {
          if (err) return handleError(err);
          
          if(Employee) res.json({data: Employee, message: 'Record updated successfully', status: 200});
        });
           
       }
       

    });

    router.get('/employees/list/type/:filter*?', function(req, res, next) {
        var limit = req.params.limit,
            offset = req.params.offset,
            type = req.params.filter,
            filters = req.query ? req.query : {}; delete filters._;
        var status = ['active', 'onleave', 'inactive'];
        if (typeof limit === 'undefined' || typeof limit !== 'number') limit = -1;
        if (typeof offset === 'undefined' || typeof offset !== 'number') offset = 0;
        if (typeof type === 'undefined' || type == '') type = 0;

        var Emp = new EmployeeModel();
        
        var params = {limit: limit, offset: offset, filters: filters, sort_by: 'id'};
            Emp.search(params ,function(err, Employees) {
              if (err) throw err;
              // object of all the users
               results = Employees;
               for(var index in results){

                   results[index].DT_RowId = 'row_' + index;
                   
                }
            if(type == 0) res.json({data: results, message: results.length +' record found', status: 200});
               else res.render('list-html', { title: 'Employee List', data:  results});
            });

       
    });

    router.get('/list/', authController.isAuthenticated, function(req, res, next) {
       res.render('list', { title: 'Employee List'}); 
    });


    router.delete('/employees/delete/', function(req, res, next) {
       var rows = req.query.data;
       var count = 0;
       
       function set_output_data(){ console.log(count);
           count = count + 1; 
       }

       for (var row in rows) {
        objId = rows[row]._id;
        EmployeeModel.findByIdAndRemove(objId, function (err, Employee) { 
            if (err) throw err;
            if(Employee) set_output_data();   
        });   
       }
     console.log(count);
       if(count > 1){
            res.json({data: rows, message: "Employee successfully deleted", status: 200});
       }else{
            res.json({data: {}, message: "Employee not found", status: 200});
       } 
        

        
       // res.send("Hello Dev: "+ req.params.number);
    
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

