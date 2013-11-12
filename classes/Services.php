<?php
//require_once 'classes/User.php';

namespace CrossRiver;

class Services {

	protected $_sortParam = "sortBy";
	protected $_app;
	protected $_request;
	protected $_response;
	protected $_resource;
	protected $_id;
	protected $_method;
	protected $_locationpath;
	protected $_content_type = "application/json";
	protected $_content_disposition = null;
	
	public function __construct($app, $resource) {				
		$this->_app = $app;
				
		$this->_request = $this->_app->request();
		if (strlen($this->_request->getBody())>0)
			$this->_postvals = json_decode($this->_request->getBody(),TRUE);
		else
			$this->_postvals = $this->_request->params();
		$this->_response = $this->_app->response();
		
		$lastresource = $resource[count($resource)-1];
		$pos = strpos($lastresource,'.');
		if ($pos!==FALSE)
		{
			$resource[count($resource)-1] = substr($lastresource,0,$pos);
			$extension = substr($lastresource,$pos+1); 
			switch ($extension)
			{
				case 'csv':
					$this->_content_type="application/csv";
					$this->_content_disposition = "attachment;filename=\"$lastresource\"";
					break;
				default:
					break;	
			}
		}		
				
		$this->_resource = $resource[0];
		if (count($resource)>0 && $resource[count($resource)-1]=="")
			array_pop($resource);
		$this->_id = count($resource) <=1 ? 0 : $resource[1];
		$this->_method = $this->_app->request()->getMethod();
		$str = "";
		$params = $this->_request->params();
		foreach ($params as $k=>$v)
			$str .= "$k=$v, ";
		$hstr = "";
		$headers = $this->_request->headers();	
		foreach ($headers as $k=>$v)
			$hstr .= "$k=$v,";
		$this->_locationpath = "http://" . $headers["HOST"] . $this->_app->config("docroot") . "/api/" . $this->_resource . '/';
		
		$this->_resourcePath = $resource;	
		//$this->_app->getLog()->debug();
		
		//$this->_locationpath = $this->_app->config("docroot") . "/services/" . $this->_resource ."/";
		/*
		$this->_app->getLog()->debug("!REQUEST METHOD= " . $this->_method . " ON " . $this->_resource . " id=" . $this->_id . "\n" . 
							 "PARAMETERS: "  . $str . "\n".
							 "HEADERS: "  . $hstr . "\n".
							 "LOCATION: " . "http://" . $headers["HOST"] . $this->_app->config("docroot") . "/services/" . $this->_resource ."/\n".
							 "BODY: *** " . $this->_request->getBody() . " ***\n\n");
		*/
	}
	
	public function process()
	{
		$args = array();
		$headers = $this->_request->headers();
		if ($this->_id != 0)
			$args["id"] = $this->_id;

		if (array_key_exists("RANGE",$headers))
		{
			$range = $headers["RANGE"];
			$i = strpos($range,'-');
			$args["first"] = substr($range,6,$i-6);
			$args["last"]  = substr($range,$i+1);
			if ($args["last"]<$args["first"]) $args["last"]=1000000000;
		}
				
		$this->_response['Content-Type'] = $this->_content_type;
		if ($this->_content_disposition != null)
			$this->_response['Content-Disposition'] = $this->_content_disposition;
		//$this->_response['Content-Type'] = 'application/json';
		
		$method = strtolower($this->_method) . '_' . $this->_resource;
				
		if (!method_exists($this,$method))
		{
			if ($this->_method=="PUT")
			{
				//$this->_response["Location"] = $this->_locationpath . $this->_id;
				$this->_response->setBody("");
				$this->_response->setStatus(204);
			}
			return "";
		}
		$this->_response->status(200);
		try
		{
			$this->_response->body(call_user_func(array($this,$method),$this->_app->config('connection'),$args,$this->_request->params(),$this->_postvals));
		}
		catch (Exception $e)
		{
			//$this->_app->getLog()->debug("Services Exception: " . $e->getMessage());
		}
	}
	
	protected function get_calendar($conn,$args,$params,$post)
	{
		$r = $this->_resourcePath;
		$querystr = "1";
		
		if (count($r)>1)
		{
			$querystr = "YEAR(due)=$r[1]";
			if (count($r)>2)
				$querystr .= " AND MONTH(due)=$r[2]";
			if (count($r)>3)
				$querystr .= " AND DAYOFMONTH(due)=$r[3]";
		}
				
		$result = $conn->query("SELECT * FROM view_plan_summaries WHERE $querystr AND active<>0");
		return $this->fetch_rows($result,$args);		
	}
	
	protected function get_documents($conn,$args,$params,$post)
	{
		//$result = $conn->query("SELECT name,type FROM plan_documents WHERE id=$args[id]");
		//$record = $result->fetch_assoc();
					
		$query = "SELECT id, idaction, name, type, idplan, idupdater, updated_at, comments FROM view_documents WHERE " . ($this->_id>0 ? "idplan=".$this->_id : "1");
		
		$result = $conn->query($query);

		if (count($this->_resourcePath)<=2)
			return $this->fetch_rows($result,$args);
		
		$name = $this->_resourcePath[2];
		$found=null;
		
		if ($result != null)
		{
			while ($row = $result->fetch_assoc())
			{
				if ($row["name"]==$name)
				{
					$found=$row;
					break;
				} 		
			}
		}
		$result->free();
		
		if ($found==null)
			return "FILE NOT FOUND";
			
		$filename = $_SERVER['DOCUMENT_ROOT'] . $this->_app->config("docroot") . "/documents/$found[idplan]/$name";			
			
		
		if (!file_exists($filename))
			return "FILE NOT FOUND";
		
		$size = filesize($filename);
		$this->_response['Content-Type'] = $found["type"];
		$this->_response['Content-Length'] = $size;
		$this->_response['Content-Disposition'] = "attachment; filename=\"$name\"";

		$handle = fopen($filename, "rb");
		$contents = fread($handle, $size);
		fclose($handle);
					
		return $contents;
	}

	protected function post_documents($conn,$args,$params,$post)
	{
		$this->_response->status(201);
		return "[]";
	}
	
	protected function put_documents($conn,$args,$params,$post)
	{
		$this->_app->getLog()->debug("PUTTING DOCUMENTS");

		//$this->_response["Location"] = $this->_locationpath . $this->_id . "/";
		$this->_response->status(204);
		return "";
	}

	protected function get_preferences($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT * FROM config WHERE name='default'");
		return $this->fetch_rows($result,$args);
	}
	
	protected function put_preferences($conn,$args,$params,$post)
	{
		$id=$this->_id;
		$query = "UPDATE config SET duedays=$post[duedays], feeddays=$post[feeddays], reddays=$post[reddays] WHERE name=\"$id\"";
		$conn->query($query);
		$this->_response->status(204);
		return "";
	}

	protected function get_actions($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT id, name, selecttext FROM actions");
		return $this->fetch_rows($result,$args);
	}

	protected function get_stages($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT id, name FROM stages");
		return $this->fetch_rows($result,$args);
	}

	protected function get_plantypes($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT id, name FROM plantypes");
		return $this->fetch_rows($result,$args);
	}

	protected function get_paymenttypes($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT id, code, name FROM paymenttypes");
		return $this->fetch_rows($result,$args);
	}
	
	protected function get_parties($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT id, name FROM parties");
		return $this->fetch_rows($result,$args);
	}
	
	protected function get_usertypes($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT id, name AS label FROM usertypes");
		return $this->fetch_rows($result,$args);
	}

	protected function get_feed($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT id, updated_at, plan, due_date, office_due, action, actionname, stage, idupdater, updater, comments FROM view_log WHERE DATEDIFF(NOW(),updated_at)<=210" .
				$this->params_to_sql($args,$params));	
		return $this->fetch_rows($result,$args);	
	}

	protected function get_users($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT id, username, name, email, created_at, updated_at, user_type, typename, admin  FROM view_users_version2 WHERE 1" . $this->params_to_sql($args,$params));
		return $this->fetch_rows($result,$args);
	}

	protected function post_users($conn,$args,$params,$post)
	{
		$id = \CrossRiver\User::CreateUser($conn,$post);
		$this->_response["Location"] = $this->_locationpath . $id . "/";
		$this->_response->status(201);
		return $this->get_users($conn,array('id'=>$id),null,null);
	}

	protected function put_users($conn,$args,$params,$post)
	{
		$post["id"] = $this->_id;
		\CrossRiver\User::UpdateUser($conn,$post);
		//$this->_response["Location"] = $this->_locationpath . $this->_id; // . "/";
		$this->_response->status(204);
		return "";
	}

	protected function get_plans($conn,$args,$params,$post)
	{
		$result = $conn->query("SELECT id, plan, due_date, office_due, active, type, fee, balance_due, last_touched_by, doc_count, attention, idadvisor, idemployee, stage, data_request, data_received, data_sent, data_acknowledged, lastadvisorcomments, lastpreparercomments from view_plans WHERE active<>0".
				$this->params_to_sql($args,$params));	
		return $this->fetch_rows($result,$args);	
	}

	protected function post_plans($conn,$args,$params,$post)
	{
		foreach ($post AS $k=>$v)
		//$this->_app->getLog()->debug("$k = $v");	
		$ret = "{}";
		$last_touched_by = isset($post["last_touched_by"]) ? $post["last_touched_by"] : 1;
		$fee = isset($post["fee"]) ? $post["fee"] : 0;
		$balance_due = isset($post["balance_due"]) ? $post["balance_due"] : 0;
		
		$stmt = $conn->prepare("INSERT into plans (name, type, due, office_due, idemployee, idadvisor, stage, last_touched_by, fee, balance_due, data_request, data_received, data_sent, data_acknowledged, flagged, attention, active) VALUES (?,?,?,?,?,?,?,?,?,?,0,0,0,0,0,0,1)"); 
	  	
	  $stmt->bind_param("sissiiiidd", 
	  	$post["plan"],
	  	$post["type"],
	  	$post["due_date"],
	  	$post["office_due"],
	  	$post["idemployee"],
	  	$post["idadvisor"],
	  	$post["stage"],
	  	$last_touched_by,
	  	$fee,
	  	$balance_due
	  );
			  
	  try {
	  	$stmt->execute();
	  	$id = mysqli_insert_id($conn);
			$stmt->close();
	  	if ($id>0)
	  	{
	  		$iduser = $this->_app->config('user')->getId();
	  		$conn->query("INSERT INTO plan_actions (idplan, idupdater, action, updated_at) VALUES ($id, $iduser, 1, NOW())");
				$this->_response["Location"] = $this->_locationpath . $id . "/";
				$this->_response->status(201);
				$ret = $this->get_plans($conn,array('id'=>$id),null,null);
			}
	  }
	  catch (Exception $e)
	  {
			$this->_app->getLog()->debug("Services Exception: " . $e->getMessage());
			$ret="{}";
	  }

	  return $ret;
	}

	protected function put_plans($conn,$args,$params,$post)
	{
		$id = $this->_id;
		$action = $post['idaction'];
		$idaction = 0;
		$comments = isset($post['comments']) ? $post['comments'] : "";
		$iduser = $this->_app->config('user')->getId();
		$planupdates = array();
		$changes = array();
		$planstr = "";
		
		switch ($action)
		{
			case 10: $planupdates['stage']=2; break; //"10","data gather complete","Data Gather complete"
			case 11: $planupdates['stage']=3; break; //"11","data entry complete","Data Entry complete"
			case 12: $planupdates['stage']=4; break; //"12","analyze goals complete","Analyze Goals Complete"
			case 13: $planupdates['stage']=5; break; //"13","write-up complete","Write-up complete"
			case 20: $planupdates['stage']=4; break; //"20","back to data gather","Back to Data Gather"
			case 21: $planupdates['stage']=3; break; //"21","back to data entry","Back to Data Entry"
			case 22: $planupdates['stage']=2; break; //"22","back to analyze goals","Back to Analyze Goals"
			case 23: $planupdates['stage']=1; break; //"23","back to write-up","Back to Write-up"
			case 100: $planupdates['active']=0; break; //"100","deleted","Delete Plan"
			case 126: $planupdates['stage']=126; break; //"126","signed off","Sign Off"
			case 127: $planupdates['stage']=127; break; //"127","closed","Close"
			case 200: $planupdates['idemployee'] = $changes['idemployee'] = $post['idemployee']; break; //"200","changed preparer","Change Preparer"
			case 201: $planupdates['idadvisor'] = $changes['idadvisor'] = $post['idadvisor']; break; //"201","changed advisor","Change Advisor"
			case 202: $planupdates['due'] = $changes['due'] = $post['due_date']; break; //"202","changed due date","Change Due Date"
			case 203: $planupdates['name'] = $changes['name'] = $post['plan']; break; //"203","renamed","Rename"
			case 210: $planupdates['office_due'] = $changes['office_due'] = $post['office_due']; break; //"210","change home office due date","Change home office due date"
			case 211: $planupdates['type'] = $changes['type'] = $post['type']; break; //"211","changed plan type","Change plan type"
			case 213: $planupdates['last_touched_by'] = $changes['last_touched_by'] = $post['last_touched_by']; break; //"213","changed last touched by","Last touched by"
			case 231: $planupdates['fee'] = $changes['fee'] = $post['fee']; break; //"231","change fee","Change Fee"
			case 232: $planupdates['balance_due'] = $changes['balance_due'] = $post['balance_due']; break; //"232","change balance due","Change Balance Due"
			case 206: $planupdates['data_request'] = 1; $planupdates['data_received'] = 0; break;//"206","data request to client","Data request sent to client "
			case 207: $planupdates['data_received'] = 1; $planupdates['data_request'] = 0; break;//"207","data received from client","Data received from client"
			case 208: $planupdates['data_sent'] = 1; $planupdates['data_acknowledged'] = 0; break;//"208","data sent to arcadia","Data sent to Arcadia"
			case 209: $planupdates['data_acknowledged'] = 1; $planupdates['data_sent'] = 0; break;//"209","data received by Arcadia","Data received by Arcadia"
		}
		
		/// INSERT into PLAN_ACTIONS
		
		$query = "INSERT INTO plan_actions (idplan, idupdater, action, comments, updated_at) VALUES ($id, $iduser, $action, \"$comments\",NOW())";
		
		//$this->_app->getLog()->debug($query);
		
		$conn->query($query);
		$idaction = mysqli_insert_id($conn);
		
		foreach ($planupdates AS $k=>$v)
			$planstr .= ((strlen($planstr)==0 ? '' : ',')."$k=\"$v\"");
		
		if (strlen($planstr) > 0)
		{
			$query = "UPDATE plans SET " . $planstr . " WHERE id=$id";
			//$this->_app->getLog()->debug($query);
			$conn->query($query);
		}
		
		foreach ($changes AS $k=>$v)
		{
			$query = "INSERT INTO plan_changes (idaction, colname, colval) VALUES ($idaction, \"$k\", \"$v\")";
			//$this->_app->getLog()->debug($query);
			$conn->query($query);
		}
		
		$this->process_uploaded_files($conn,$_FILES,$id,$idaction);

//"1","opened","Open"
//"30","flagged","Flag"
//"31","resolved","Resolve Flag"
//"204","advisor comment","Advisor Comment"
//"205","preparer comment","Preparer Comment"
//"212","file uploaded to Arcadia","Upload file to Arcadia"
//"230","payment received from client","Payment received from client"
		$this->_response->status(204);
		return "[]";
	}

	protected function get_advisorplans($conn,$args,$params,$post)
	{
		$user = $this->_app->config('user');
		$params["idadvisor"] = $user->getId();
		return $this->get_plans($conn,$args,$params,$post);
	
	//	$result = $conn->query("SELECT id, plan, due_date, office_due, active, type, fee, balance_due, last_touched_by, attention, idadvisor, idemployee, stage, data_request, data_received, data_sent, lastadvisorcomments, lastpreparercomments from view_plans WHERE active<>0".
		//		" AND idadvisor=" . $user->getId() . 
			//	$this->params_to_sql($args,$params));	
		//return $this->fetch_rows($result,$args);	
	}

	protected function put_advisorplans($conn,$args,$params,$post)
	{
		$iduser = $this->_app->config('user')->getId();
		$post['idadvisor'] = $iduser;
		return $this->put_plans($conn,$args,$params,$post);
	}
	
	protected function get_preparerplans($conn,$args,$params,$post)
	{
		$user = $this->_app->config('user');
		$params["idemployee"] = $user->getId();
		return $this->get_plans($conn,$args,$params,$post);

//		$user = $this->_app->config('user');

	//	$result = $conn->query("SELECT id, plan, due_date, office_due, active, type, fee, balance_due, last_touched_by, attention, idadvisor, idemployee, stage, data_request, data_received, data_sent, lastadvisorcomments, lastpreparercomments from view_plans WHERE active<>0".
		//		" AND idemployee=" . $user->getId() . 
			//	$this->params_to_sql($args,$params));	
		//return $this->fetch_rows($result,$args);	
	}

	private function fetch_rows($result,$args,$encode=TRUE)
	{
		$ret = array();
		$count = 0;
		$first = (isset($args["first"]) ? $args["first"] : 0);
		
		if ($result != null)
		{
			while ($row = $result->fetch_assoc())
			{
				$ret[] = $row;
				$count++;
			}
		}
		$result->free();
		
		if (isset($args['first']))
			$this->_response['Content-Range'] = "items ".$first."-".($first+$count-1);
		
		if ($encode)
		{
			if ($this->_content_type=='application/json')
				return (count($ret)==1 ? json_encode($ret[0]) : json_encode($ret));
			else
				return $this->array_to_csv($ret);
		}
		return $ret;
	}
	
	private function array_to_csv($arr)
	{
		$csv = "";
		for ($i=0;$i<count($arr);$i++)
		{
			if ($i==0)
				$csv .= implode(',',array_keys($arr[$i])) . "\n";
			$csv .= implode(',',array_values($arr[$i])) . "\n";
		}
		return $csv;
	}
		
	private function params_to_sql($args,$params)
	{
		$filter = (isset($args['id']) ? " AND id=" . $args['id'] : "");
		$sort = "";
		$limit = "";
				
		if ($params != null)
		{
			foreach ($params as $k=>$v)
			{
				if ($k==$this->_sortParam)
				{
					$sortfields = explode(',', $v);
					foreach ($sortfields as $field)
					{
						$direction = (strpos($field, '-')===FALSE ? " ASC" : " DESC");
						$sort .= ((strlen($sort)==0 ? " ORDER BY " : ", ") . str_replace(array("-","+"), "", $field) . $direction);
					}
				}
				else
				{
					$filter .= " AND $k=\"$v\"";
				}
			}
		}
		if (isset($args["first"]))
			$limit = " LIMIT " . $args["first"] . "," . ($args["last"]-$args["first"]+1);
		
		//$this->_app->getLog()->debug("SQL: $filter$sort$limit");
		return $filter.$sort.$limit;		
	}
	
	private function process_uploaded_files($conn, $files, $idplan, $idaction)
	{
		if (count($files)==0)
			return;
		
		for ($i=0;$i<count($files['files']['name']);$i++)
		{
			$this->_app->getLog()->debug($files['files']['name'][$i] . " " . 
																	 $files['files']['type'][$i] . " " .
																	 $files['files']['tmp_name'][$i] . " " .
																	 $files['files']['size'][$i]
																	 );
			
			if (!file_exists($_SERVER['DOCUMENT_ROOT'] . $this->_app->config("docroot") . "/documents/$idplan"))
				mkdir($_SERVER['DOCUMENT_ROOT'] . $this->_app->config("docroot") . "/documents/$idplan");
			
			$type = $files['files']['type'][$i];
			$size = $files['files']['size'][$i];
			$uniquename = $this->get_unique_filename($_SERVER['DOCUMENT_ROOT'] . $this->_app->config("docroot") . "/documents/$idplan/" . $files['files']['name'][$i]);
			$this->_app->getLog()->debug($uniquename);
			move_uploaded_file($files['files']['tmp_name'][$i], $uniquename);
			
			$parts = pathinfo($uniquename);

			$uniquefilename = $parts['basename'];
			
		  $query = "INSERT INTO plan_documents (idaction, name, type, size) VALUES ($idaction, \"$uniquefilename\", \"$type\", $size)";
		  
		  $conn->query($query);
		}
		
		$query = "UPDATE plans SET doc_count=doc_count+$i WHERE id=$idplan";
		$conn->query($query);
	}
	
	private function get_unique_filename($filename)
	{
		$parts = pathinfo($filename);
		$dir = $parts['dirname'] .'/';
		$base = $parts['filename'];
		$extension = '.' . $parts['extension'];
		
		$unique = $filename;
		
		$i=1;
		
		while ($i<100 && file_exists($unique))
		{
			$unique = $dir.$base."($i)".$extension;
			$i++;

		}
				
		return $unique;
	}	
}

?>