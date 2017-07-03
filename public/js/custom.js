function filterGlobal () {
    $('#datalist').DataTable().search(
        $('#global_filter').val()
    ).draw();
}
 
function filterColumn ( i ) {
    $('#datalist').DataTable().column( i ).search(
        $('#col'+i+'_filter').val()
    ).draw();
}

$(document).ready(function() {

    $('#datalist').DataTable({
      	 "ajax": {
            "url": "http://localhost:8080/employees/list/type/0",
            "dataSrc": "data"
        },
      	 "processing": true,
         "columns": [
            { "data": "empId" },
            { "data": "name" },
            { "data": "surname" },
            { "data": "gender" },
            { "data": "dob" },
            { "data": "doj" },
            { "data": "email" },
            { "data": "mobile" },
            { "data": "address" },
            { "data": "bgroup" },
            { "data": "designation" },
            { "data": "exp" },
            { "data": "salary" },
            { "data": "pan_no" },
            { "data": "status" }
        ]
    });
    $('input.global_filter').on( 'keyup click', function () {
        filterGlobal();
    } );
 
    $('input.column_filter').on( 'keyup click', function () {
        filterColumn( $(this).parents('tr').attr('data-column') );
    } );

} );