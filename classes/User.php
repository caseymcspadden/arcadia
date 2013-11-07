<?php

namespace CrossRiver;

class User {
  private $logged_in=false;
    private $id=0;
    private $app;
	private $name;
	private $username;
	private $email;
	private $created_at;
	private $updated_at;
	private $user_type;
	private $admin;
	const SALT_LENGTH = 30;
	
	static function CreateUser($connection, $arr)
	{
	  $retval = false;

	  $salt = User::make_salt($arr["password"]);
	  
	  $encrypted_password = User::encrypt_password($arr["password"], $salt);
	  
	  $arr['admin'] = (strtoupper($arr['admin'])=='TRUE' ? 1 : (strtoupper($arr['admin'])=='FALSE' ? 0 : $arr['admin']));
	  
	  $stmt = $connection->prepare("INSERT into users (name, username, email, encrypted_password, created_at, updated_at, salt, user_type, admin) VALUES (? , ?, ? , ? , NOW() , NOW() , ? , ?, ?)");
	  
	  $stmt->bind_param("sssssii", $arr["name"], $arr['username'], $arr["email"], $encrypted_password, $salt, $arr["user_type"], $arr["admin"]);
	  
	  try {
	  	$stmt->execute();
	  	$retval = mysqli_insert_id($connection);
	  }
		catch (Exception $e){
			dbg($e->getMessage());
		}
		
		$stmt->close();
		return $retval;
	}
	
	static function UpdateUser($connection, $arr)
	{
		$retval = $arr["id"];
	  
		$arr['admin'] = (strtoupper($arr['admin'])=='TRUE' ? 1 : (strtoupper($arr['admin'])=='FALSE' ? 0 : $arr['admin']));

		if ($arr["password"]!="")
		{
	  	$salt = User::make_salt($arr["password"]);
	  	$encrypted_password = User::encrypt_password($arr["password"], $salt);
	  
	  	$stmt = $connection->prepare("UPDATE users SET username=?, name=?, email=?, encrypted_password=?, updated_at=NOW(), salt=?, user_type=?, admin=? WHERE id=?");
	  
	  	$stmt->bind_param("sssssiii", $arr['username'], $arr["name"], $arr["email"], $encrypted_password, $salt, $arr["user_type"], $arr["admin"], $arr["id"]);
	  }
	  else
	  {
	  	$stmt = $connection->prepare("UPDATE users SET username=?, name=?, email=?, updated_at=NOW(), user_type=?, admin=? WHERE id=?");
	  
	  	$stmt->bind_param("sssiii", $arr['username'], $arr["name"], $arr["email"], $arr["user_type"], $arr["admin"], $arr["id"]);
	  }
	  
	  try {
	  	$stmt->execute();
	  }
		catch (Exception $e){
			dbg($e->getMessage());
			$retval=false;
		}
		$stmt->close();
		return $retval;
	}
	
	function __construct($connection,$app=null) {
		$this->app = $app;
		if ($app!=null && $app->request()->params("logout")=="1") {
			$app->setCookie("uid","",time()-3600);
			$this->logged_in=false;
			return;
		}
		if ($this->authenticateWithUserNameAndPassword($connection, $_POST['login'], $_POST["username"], $_POST["password"]))
			return;
		return ($this->authenticateWithCookie($connection, $app==null ? $_COOKIE : $app->request()->cookies()));
	}
	
  function isEmployee() {
  	return ($this->user_type == 2) ? true : false;
  }
  function isAdvisor() {
  	return ($this->user_type == 1) ? true : false;
  }
  function isAdmin() {
  	return ($this->admin == 1) ? true : false;
  }
  function isLoggedIn() {
    return $this->logged_in;
  }
  function getId() {
    return $this->id;
  }
  function getUserName() {
  	return $this->username;
  }
  function getName() {
    return $this->name;
  }
  function getEmail() {
    return $this->email;
  }
  function getCreatedAt() {
    return $this->created_at;
  }
  function getUpdatedAt() {
    return $this->updated_at;
  }
  function getUserType() {
    return $this->user_type;
  }
  
  /*
  static private function make_salt($password)
  {
  	return hash('sha256',$password.uniqid(rand(), true));
  }
  
  static private function encrypt_password($password,$salt)
  {
  	return hash('sha256',$salt.$password);
  }
  */
  
  static private function make_salt($password)
  {
  	return substr(md5($password.uniqid(rand(), true)), 0, User::SALT_LENGTH);
  }
  
  static private function encrypt_password($password,$salt)
  {
  	return md5($salt.$password);
  }
  
  
  private function authenticateWithCookie($connection, $cookie)
  {
  	$this->logged_in=false;
  	if (isset($cookie) && isset($cookie['uid']))
  	{
  		$id_hash = explode("-",$cookie['uid']);
  		
  		if (sizeof($id_hash) < 2)
  		  return false;
  		
   	    $stmt = $connection->prepare("SELECT id, username, name, email, created_at, updated_at, salt, user_type, admin FROM users WHERE id=?");
	    $stmt->bind_param("i", $id_hash[0]);
    	try {
    		$stmt->execute();
			$stmt->bind_result($this->id, $this->username, $this->name, $this->email, $this->created_at, $this->updated_at, $salt, $this->user_type, $this->admin);
			$stmt->fetch();  	
			//if (hash('sha256',$id_hash[0].$salt) == $id_hash[1]) {	
			if ($salt == $id_hash[1]) {
  		     $this->logged_in=true;
  		  }
   	  }
  	  catch (Exception $e) {
  		   dbg($e->getMessage());
  	  }
  	  $stmt->close();
	  }
  	return $this->logged_in;
  }

  private function authenticateWithUserNameAndPassword($connection, $login, $username, $password)
  {
  	$this->logged_in=false;
  	if (!isset($username) || !isset($password) || !isset($login))
  		return false;
  
  	$stmt = $connection->prepare("SELECT id, username, email, name, encrypted_password, created_at, updated_at, salt, user_type, admin FROM users WHERE username=?");
	  $stmt->bind_param("s", $username);
  	$this->logged_in=true;
  	try {
  		$stmt->execute();
  		$stmt->bind_result($this->id, $this->username, $this->email, $this->name, $encrypted_password, $this->created_at, $this->updated_at, $salt, $this->user_type, $this->admin);
  		$stmt->fetch();
  		
  		/*
  		if ($encrypted_password == hash('sha256',$salt.$password)) {
	  		if ($this->app!=null)
	  			$this->app->setCookie("uid",$this->id."-".hash('sha256',$this->id.$salt),time()+3600*24*365);
	  		else
	  			setcookie("uid",$this->id."-".hash('sha256',$this->id.$salt),time()+3600*24*365);  		
  		}
  		else
  		  $this->logged_in=false;
		*/
  		
  		if ($encrypted_password == md5($salt.$password)) {
  			if ($this->app!=null)
  				$this->app->setCookie("uid",$this->id."-".$salt,time()+3600*24*365);
  			else
				setcookie("uid",$this->id."-".$salt,time()+3600*24*365);
 		}
  		else
  		  $this->logged_in=false;
  	}
  	catch (Exception $e) {
  		dbg($e->getMessage());
  		$this->logged_in=false;
  	}
  	$stmt->close();
  	return $this->logged_in;
  }  
};


?>