(function() {

	document.addEventListener('DOMContentLoaded', init, false);

	var warning;
	var request_login;
	var request_reqister;
	var request_check_login;
	var request_logout;
	var username_input = '';
    var username = '';

	var redirect_href;
	var submit_button;
	var title;

	var password;
	var password2;
	var pw2Label;

	function init(){
		warning = document.querySelector('#warning');
		document.querySelector('.back_to_game').addEventListener('click', back_to_game);

		request_check_login = new XMLHttpRequest();
        request_check_login.addEventListener('readystatechange', check_login, false);
        request_check_login.open('GET', 'python/js_python/check_login.py', true);
        request_check_login.send(null);

        redirect_href = document.querySelector('#login form span a');
        submit_button = document.querySelector('#login_button');
        username_input = document.querySelector('#name');
        password = document.querySelector('#password');
        password2 = document.querySelector('#password2');
        pw2Label = document.querySelector('label[for="password2"');
        title = document.querySelector('.title_bar h1');

        var form_element = document.querySelector('#login form');
        form_element.addEventListener('submit', function(event){event.preventDefault();});

		show_login();
	}

	function back_to_game(){
		window.open("index.html","_self");

	}

	function show_login(event){
		if (event){
        	event.preventDefault();
        }
        title.innerHTML = 'Login';
        warning.style.display = 'none';

        redirect_href.innerHTML = 'Not registered yet? Click here to register.'
        submit_button.value = 'Login';

        redirect_href.removeEventListener('click', show_login);
        redirect_href.addEventListener('click', show_register, false);

        submit_button.removeEventListener('click', logout);
        submit_button.removeEventListener('click', try_register);
        submit_button.addEventListener('click', try_login);

        password2.style.display = 'none';
        pw2Label.style.display = 'none';
         
    }    

    function show_register(event){
        event.preventDefault();
        title.innerHTML = 'Register';
        warning.style.display = 'none';

        redirect_href.innerHTML = 'Already registered? Click here to login.'
        submit_button.value = 'Register';

        password2.style.display = 'inline';
        pw2Label.style.display = 'inline';

        submit_button.removeEventListener('click', logout);
        redirect_href.removeEventListener('click', show_register);
        submit_button.removeEventListener('click', try_login);
        redirect_href.addEventListener('click', show_login, false);
        submit_button.addEventListener('click', try_register, false);
    }


    function try_login(event){
        event.preventDefault();

        warning.style.display = 'none';

        request_login = new XMLHttpRequest();
        var params = '';
        var values = [username_input.value, password.value];
        var keys = ['username', 'pw']

        for (var i=0; i< keys.length; i++){
            params += keys[i] + '=' + values[i] + '&';
        }

        username = username_input.value;

        request_login = new XMLHttpRequest();
        request_login.addEventListener('readystatechange', function(){
                // Check that the response has fully arrived
                if ( request_login.readyState === 4 ) {
                    // Check the request was successful
                    if ( request_login.status === 200 ) {
                        password.value = '';
                        warning.style.display = 'block';
                        if ( request_login.responseText.trim() !== 'fail' ) {
                            var parsedText = request_login.responseText.split('\n');
                            warning.style.color = 'green';
                            warning.innerHTML = 'Login Successful!';
                            show_logout();

                        } else  {
                            warning.style.color = 'red';
                            warning.innerHTML = 'The username or password is incorrect, try again';
                            
                        }
                    }
                }

            }, false);
        request_login.open('POST', 'python/js_python/login.py', true);
        request_login.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request_login.send(params);
        
    }

    function try_register(event){
        event.preventDefault();
        warning.style.display = 'none';

        request_register = new XMLHttpRequest();
        var params = '';
        // Get params
        if (password.value != password2.value) {
            warning.style.display ='block';
            warning.style.color = 'red';
            warning.innerHTML = 'Your password must match';
            password.value = '';
            password2.value = '';
            return;
        }

        if(password.value.length === 0 || username_input.value.length === 0){
            warning.style.display ='block';
            warning.style.color = 'red';
            warning.innerHTML = 'You must fill in the form.';
            password.value = '';
            password2.value = '';
            return;
        }

        username = username_input.value;

        var values = [username_input, pw1.value, 0, 0, 0, 0, 0];
        var keys = ['username', 'pw', 'high_score', 'curr_balance', 'armour', 'health_regen', 'boost']

        for (var i=0; i< keys.length; i++){
            params += keys[i] + '=' + values[i] + '&';
        }
        request_register = new XMLHttpRequest();
        request_register.addEventListener('readystatechange', function(){
            // Check that the response has fully arrived
            if ( request_register.readyState === 4 ) {
                // Check the request was successful
                if ( request_register.status === 200 ) {
                    warning.style.display = 'block';
                    warning.innerHTML = request_register.responseText;
                    password.value = '';
                    password2.value = '';
                    if ( request_register.responseText.trim() === 'Registration complete!' ) {
                        warning.style.color = 'green';  
                        show_logout();
                    } else  {
                        warning.style.color = 'red';
                    }
                }
            }

        }, false);
        request_register.open('POST', 'python/js_python/register.py', true);
        request_register.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request_register.send(params);
 
    }   

    function check_login(){

        // Check that the response has fully arrived
        if ( request_check_login.readyState === 4 ) {
            // Check the request was successful
            if ( request_check_login.status === 200 ) {
                console.log(request_check_login.responseText.trim());
                if ( request_check_login.responseText.trim() != 'fail' ) {
                    // logged in, update stats
           
                    show_logout();

                } else  {
                    // Not logged in or an error
                }
            }
        }
    }

    function show_logout(event){
        if(event) event.preventDefault();
        warning.style.display = 'none';
    	var forms = document.querySelectorAll('#login form *');
    	for (var i = 0; i < forms.length; i++) {
    		forms[i].disabled = true;
    	}
    	title.innerHTML = 'Logout';
    	
    	submit_button.value = 'Logout';
    	submit_button.disabled = false;
        username_input.value = username;

        redirect_href.removeEventListener('click', show_login);
        redirect_href.removeEventListener('click', show_register);
        redirect_href.addEventListener('click', function(event){event.preventDefault();});
    	redirect_href.innerHTML = 'You are already logged in';
        warning.innerHTML = '';
    	
        submit_button.removeEventListener('click', try_login);
        submit_button.removeEventListener('click', try_register);
    	submit_button.addEventListener('click', logout, false);
    }


	function logout(){
        request_logout = new XMLHttpRequest();
        request_logout.addEventListener('readystatechange', function(){
                if ( request_logout.readyState === 4 && request_logout.status === 200) {
                    warning.style.display = 'none'
                    if ( request_logout.responseText.trim() === 'success' ) {
                        var forms = document.querySelectorAll('#login form *');
				    	for (var i = 0; i < forms.length; i++) {
				    		forms[i].disabled = false;
				    	}
				    	show_login();

                    } else  {
                        warning.style.display = 'block';
                        warning.style.color = 'red';
                        warning.innerHTML = 'Couldn\'t log out. Please try again in a few minutes.'
                    }
                    
                }
        });
        request_logout.open('GET', 'python/js_python/logout.py', true);
        request_logout.send(null);
    }


})();
