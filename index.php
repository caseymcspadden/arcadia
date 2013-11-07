<?php
require 'vendor/autoload.php';
require_once 'classes/User.php';
require_once 'classes/Services.php';

\Slim\Slim::registerAutoloader();
Twig_Autoloader::register();
$loader = new Twig_Loader_String();
$twig = new Twig_Environment($loader);

$app = new \Slim\Slim(array(
    'mode' => 'development',
    'log.writer' => new \Slim\Extras\Log\DateTimeFileWriter(array('path' => './logs')),
    'view' => new \Slim\Extras\Views\Twig()
    ));
 
$conn = new mysqli("127.0.0.1", "root", "taylor0619", "arcadia");
$user = new \CrossRiver\User($conn,$app);

$app->config(array(
        'log.enable' => true,
        'debug' => true,
        'docroot' => pathinfo($_SERVER['SCRIPT_NAME'],PATHINFO_DIRNAME),
        'connection' => $conn,
        'user' => $user
    ));
    
$authenticateUser = function($role='none') use ($user) {
	return function () use ( $role, $user ) {
        if (!$user->isLoggedIn()) {
            $app = \Slim\Slim::getInstance();
            $app->flash('error', 'Login required');
            $app->redirect($app->config('docroot').'/login');
        }
    };
};

$app->setName('Arcadia');

$app->map('/' , function() use ($app) {
	if ($app->config('user')->isLoggedIn())
	{
		if ($app->config('user')->isAdmin())
			$app->redirect($app->config('docroot').'/admin/feed');
		else if ($app->config('user')->isEmployee())
			$app->redirect($app->config('docroot').'/preparer');
		else if ($app->config('user')->isAdvisor())
			$app->redirect($app->config('docroot').'/advisor');
	}
	else
		 $app->redirect($app->config('docroot').'/login');
})->via("GET","POST");
		
$app->get('/login', function() use ($app) {
	echo $app->render('login.html', array('app' => $app));
	});

	
$app->get('/admin/users', $authenticateUser('admin'), function() use ($app) {
	echo $app->render('admin_users.html', array('app' => $app));
	});

$app->get('/admin/feed', $authenticateUser('admin'), function() use ($app) {
	echo $app->render('admin_feed.html', array('app' => $app));
	});

$app->get('/admin/plans', $authenticateUser('admin'), function() use ($app) {
	echo $app->render('admin_plans.html', array('app' => $app));
	});

$app->get('/advisor', $authenticateUser('advisor'), function() use ($app) {
	echo $app->render('advisor.html', array('app' => $app));
	});

$app->get('/preparer', $authenticateUser('preparer'), function() use ($app) {
	echo $app->render('preparer.html',array('app' => $app));
	});

$app->get('/calendar', $authenticateUser('any'), function() use ($app) {
	echo $app->render('calendar.html', array('app' => $app));
	});

$app->map('/api/:resource+' , function($resource) use ($app) {
	if ($app->config('user')->isLoggedIn())
	{
		$services = new \CrossRiver\Services($app,$resource);
		$services->process();
	}
})->via('GET','POST','PUT','DELETE');

$app->run();
$conn->close();

?>