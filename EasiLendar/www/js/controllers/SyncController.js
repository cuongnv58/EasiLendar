/**
 * starter: Can Duy Cat
 * owner: Nguyen Manh Duy
 * last update: 17/03/2015
 * type: paticular controller
 */
 
angular.module('MainApp.controllers.sync', [])

.controller('SyncController', function($scope, $rootScope,$window, $document) {

    $scope.logIN = -1;
	
	$scope.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	$scope.months = [
                    'January', 'February','March', 'April', 'May',
                    'June', 'July', 'August', 'September','October',
                     'November', 'December'
                    ];
	$scope.typesOfEvent = ['BirthDay', 'Holiday', 'Restaurant', 'Important', 'Normal'];
	
	$scope.logInResult= false;
	var email= '';
	
	var apiKey = 'AIzaSyAmBIdo6sEPU5QK3lqVrflqNNyoRhCBF7I';
    var clientId = '164260242142-4er9a46uufjlu6h6hsbv3s7479mqv6pr.apps.googleusercontent.com';
    var scopes = 'https://www.googleapis.com/auth/calendar';
	
	// function should be called while register (for Page):
	
	$rootScope.logInToGmailCalendar = function() {
		
		// Log in to google account:
		
		gapi.auth.authorize({
            client_id: clientId,
            scope: scopes,
            immediate: true,
			approval_prompt: 'force',
            include_granted_scopes: false,
            cookie_policy: 'single_host_origin'
        }, $scope.testResult);
		
		return logInResult;
	}
	
	$scope.testLogInResult = function (authResult) {
		var result= false;
		
        if (authResult && !authResult.error) {
			$scope.logInResult= true;
			$scope.logIN= 1;
			
			makeApiCall();
		}
			
		else {
			$scope.logInResult= false;
			$scope.logIN= 0;
		}	
    }
	
	// function to load Google API and start all mode when click sync button:
	
	$scope.handleClientLoad = function(){
		if ($scope.logIN== -1){
			window.setTimeout($scope.checkAuth,1);
		}
	}
	
    $scope.checkAuth = function() { 		
        gapi.auth.authorize({
            client_id: clientId,
            scope: scopes,
            immediate: true,
            cookie_policy: 'single_host_origin'
        }, $scope.handleAuthResult);
		
    }
	
	$scope.buttonAffect = function () {
		
		var authorizeButton = document.getElementById('authorize-button');
		var updateButton = document.getElementById('update-button');
		
		var hello = document.getElementById('hello');
		
		authorizeButton.style.visibility= "visible";
		
		if ($scope.logIN == 0){
			authorizeButton.className = "button icon-left ion-social-googleplus button-calm easi-no-border";
			authorizeButton.onclick = $scope.handleAuthClick;
			authorizeButton.innerHTML = "Log in with your google account";
			hello.style.visibility= "hidden";
			
			updateButton.style.visibility= "hidden";
		}

		else if ($scope.logIN == 1){
			authorizeButton.className = "button icon-left icon icon ion-log-out button-calm easi-no-border";
			authorizeButton.style.width = "300px";
		
			authorizeButton.onclick = $scope.logMeOut;
			authorizeButton.innerHTML = "Log out your google account";
			
			if (email != '')	{
				hello.style.visibility= "visible";
				hello.innerHTML = "Hi, " + email;
			}
			
			updateButton.style.width = "300px";
			updateButton.className = "button icon-left ion-loop";
			updateButton.style.visibility= "visible";
			updateButton.innerHTML= "Update your google calendar";
			updateButton.onclick = $scope.makeApiCall;
		}	
	}
	
    $scope.handleAuthResult = function (authResult) {
        var authorizeButton = document.getElementById('authorize-button');

        if (authResult && !authResult.error) {
            $scope.logIN = 1;
			//result= authResult.access_token;
			var temp;
			
			gapi.client.load('calendar', 'v3', function() {
                var request = gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    "singleEvents": "true",
                    'maxResults': 1,
					"orderBy": "startTime",
                });
				request.execute(function(resp) {
					if (resp.items.length != 0) {
						email =  resp.items[0].creator.email;
						$scope.buttonAffect();
					}
				});
			});
        }
		
		else {
			$rootScope.showAlert("You have never signed in. Please log in to synchronize with your Google Calendar!");
            $scope.logIN = 0;
			$scope.buttonAffect();
        }
    }
	
	$scope.doNoThing = function(authResult) {
		
	}
	
	$scope.logMeOut = function() {
        $scope.logIN = 0;
		
		$rootScope.showAlert("In order to log out, you have to sign out your google account by your web browser");
		
		gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                approval_prompt: 'force',
                include_granted_scopes: false,
                immediate: false,
				cookie_policy: 'single_host_origin'
            }, $scope.doNoThing);
			
		$scope.buttonAffect();
		
		// code for local host:
		
		// code can not be used for local host:
		
		/*var theUrl= 'https://accounts.google.com/o/oauth2/revoke?token='+result; 
		
		var li = document.createElement('li');
		
		li.appendChild(document.createTextNode(theUrl));
		document.getElementById('events').appendChild(li);
		
		var xmlHttp = null;

		xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", theUrl, false );
		xmlHttp.send( null ); */
    }
	
	$scope.handleResult =  function (authResult) {
       
        if (authResult && !authResult.error) {
            $scope.logIN = 1;
			
			//result= authResult.access_token;
		
			// Load calendar:
			
			$scope.makeApiCall();
		}	
    }
	
    $scope.handleAuthClick = function(event) {
        if ($scope.logIN != 0) {
            //do nothing...
            return true;
        }
		else {
            gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                approval_prompt: 'force',
                include_granted_scopes: false,
                immediate: false,
				cookie_policy: 'single_host_origin'
            }, $scope.handleResult);
			
            return false;
        }
    }

    $scope.makeApiCall = function() {
        if ($scope.logIN == 1) {
            
            // default max result = 250
			// default farthest day is one year ago
			
			var toDay = new Date();
			var dd = toDay.getDate();
			var mm = toDay.getMonth()+1; //January is 0!
			var yyyy = toDay.getFullYear();

			if(dd<10) {
				dd='0'+dd;
			} 

			if(mm<10) {
				mm='0'+mm;
			} 

			toDay = mm+'/'+dd+'/'+yyyy;
			
			// form of timeMax: "yyyy-mm-dd T hh:mm:ss - offset
			
			var oneYearAgo= (yyyy-1) + '-' + mm + '-' + dd + 'T' + '00:00:00-00:00';
            
			// Load calendar from one year ago:
			
			document.getElementById('authorize-button').onclick= $scope.doNoThing;
			document.getElementById('update-button').onclick= $scope.doNoThing;

			gapi.client.load('calendar', 'v3', function() {
                var request = gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    "singleEvents": "true",
                    'maxResults': 1000,
					"orderBy": "startTime",
					
                    'timeMin': oneYearAgo
                });
				
                request.execute(function(resp) {
					
					if (resp.items.length != 0) {
						email =  resp.items[0].creator.email;
					}
					
					$scope.buttonAffect();
			
					$rootScope.uGmailCalendar = resp.items;
					
					$scope.convertMe();
					
					$rootScope.showAlert("Your calendar was update");
					
                });
            });
		}
    }
	
	$scope.convertMe = function() {
		if ($rootScope.uGmailCalendar.length== 0)	return;
		
		// change time:
		
		var uGC= {};
		uGC= $rootScope.uGmailCalendar;
		
		// array result is a array of array:
		
		$rootScope.uGmailCalendar = new Array();
		
		
		for(var i=0;i<uGC.length;i++){
			uGC[i].end.dateTime = new Date(uGC[i].end.dateTime);
			uGC[i].start.dateTime = new Date(uGC[i].start.dateTime);
			
			// value position to get the position of array of event:
			
			var position= new Date(uGC[i].start.dateTime.getFullYear(), uGC[i].start.dateTime.getMonth(), uGC[i].start.dateTime.getDate(), 0, 0, 0, 0);
			uGC[i].position= position;
			
			//Conver time to Day in week and Date in Month
			
			var date = uGC[i].start.dateTime.getDate();
			var day = $scope.days[uGC[i].start.dateTime.getDay()];
			var month = uGC[i].start.dateTime.getMonth() + 1;
			var year = uGC[i].start.dateTime.getFullYear();
			
			uGC[i].date = date;
			uGC[i].day = day;
			uGC[i].month = month;	
			uGC[i].year = year;
	
			//Convert time to Hour and Minute
			if(uGC[i].end.dateTime.getHours() >= 12) { var termEnd = 'PM';}
			else {termEnd = 'AM';}
			if(uGC[i].start.dateTime.getHours() >= 12) { var termStart = 'PM';}	
			else {termStart = 'AM'; }
			
			uGC[i].end.dateTime = uGC[i].end.dateTime.getHours() + ':' + (uGC[i].end.dateTime.getMinutes() < 10 ? '0':'') + uGC[i].end.dateTime.getMinutes() + termEnd ;
			uGC[i].start.dateTime = uGC[i].start.dateTime.getHours() + ':' + (uGC[i].start.dateTime.getMinutes() < 10 ? '0':'') + uGC[i].start.dateTime.getMinutes() + termStart;	
			
			uGC[i].mStatus= false;
			
			// make a empty array of each day:
		
			$rootScope.uGmailCalendar[position] = new Array();
		}
		
		for(var i=0;i<uGC.length;i++){
			$rootScope.uGmailCalendar[uGC[i].position].push(uGC[i]);
		}
	}
	
	/* */
	$rootScope.mLength= function(array) {
		var dem=0;
		for (var x in array) {
			dem++;
		}
		
		return dem;
	};
	
})
