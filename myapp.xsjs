var SearchField = String($.request.parameters.get("SearchField"));
var body = "";
var results = [];

function fiesel(table_name) {

	var result = "";
	var column = "";
	var columns = [];
	var column_count = 0;
	var table = table_name;
	var connection3 = $.db.getConnection();
	var statement3 = connection3.prepareStatement("select column_name from table_columns where table_name = '" + table + "'");
	var resultSet3 = statement3.executeQuery();
			while (resultSet3.next()){
				column = resultSet3.getString(1);
				column_count ++;
				columns.push(column);
			}
	var sql_statement = "select to_decimal (score(),3,2) as score, * from " + table + " where contains((" + columns + 
	"), '" +  SearchField + "', fuzzy(0.7, 'termMappingTable=termmappings,termMappingListId=*')) order by score desc";
	var connection4 = $.db.getConnection();
	var statement4 = connection4.prepareStatement(sql_statement);
	var resultSet4 = statement4.executeQuery();
	
	var i = 1;
			while (resultSet4.next()){
				while (i <= column_count + 1){
					result = " " + resultSet4.getNString(i);
					i++;
					results.push(result);
				}
			}
			if (result!==""){
				results.push(" <i>found in</i> " + table_name + "<br>");

			}
		
	columns = [];
	return results;
}


function doGet() {
	try {
		
		  /* identify user and schema to be worked upon */
		  
		  var connection0 = $.db.getConnection();
		  var statement0 = connection0.prepareStatement("SELECT CURRENT_USER, CURRENT_SCHEMA FROM DUMMY")
		  var resultSet0 = statement0.executeQuery();
		  var user = "";
		  var schema = "";
		  while (resultSet0.next()) {
			  user 		= resultSet0.getString(1);
			  schema 	= resultSet0.getString(2);
		  }

		  /* retrieve information on privileges granted */
		  
		  var check_privilege = "select privilege from SYS.GRANTED_PRIVILEGES where GRANTEE = '" + user + "' and schema_name = '" + schema + "'";
		  var connection1 = $.db.getConnection();
		  var statement1 = connection1.prepareStatement(check_privilege);
		  var resultSet1 = statement1.executeQuery();
		  var retrieve_privilege = "";
		  while (resultSet1.next()) {
			  retrieve_privilege = resultSet1.getString(1);
		  }
		  var privilege_granted = 0;
		  if (retrieve_privilege == 'CREATE ANY'|| 'SELECT') {
			  privilege_granted = 1;
		  }
		  
		  /* get all tables from schema. Note: authorization is granted on schema objects. 
		   * There is no possibility to grant privileges on table objects. */
		  
		  if (privilege_granted == 1) {
			  
			  var get_table_names = "SELECT TABLE_NAME FROM M_CS_TABLES WHERE SCHEMA_NAME = '" + schema + "'";
			  var connection2 = $.db.getConnection();
			  var statement2 = connection2.prepareStatement(get_table_names);
			  var resultSet2 = statement2.executeQuery();
			  var table_name = "";
			  var table_names = [];
			  var count_tables = 0;
			  while (resultSet2.next()){
				  table_name = resultSet2.getString(1);
				  count_tables++;
				  table_names.push(table_name);
			  }
			  
			  
		  }
		  else {
				$.response.contentType = "text/plain";
				$.response
						.setBody("Error: No modification rights. Please contact your system administrator.");
				$.response.returnCode = 403;
		  }
			
			table_names.forEach(fiesel);			
			

			body = "<html>" + "<br>" + results + "</html>";
			$.response.setBody(body);

		} catch (err) {
			$.response.contentType = "text/plain";
			$.response
					.setBody("Error while executing query: [" + err.message + "]");
			$.response.returnCode = 200;
	}
}
	doGet();