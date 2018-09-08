(function() {


// Global Varibales

 	var context;
    var canvas;
    var width;
    var height;
    
    var startHeight;
    var stickImages = [];
    var runningImages = [];    
    var duckImages = []; 
    var score = 0;

    var counter = 0;
    var jumping = false;
    var rolling = false;
    var jumpSpeed = 0;
    var jumpTime;
    var j = 0;
    var stickheight;

    var healthBoxStartX = 64;

    var houses = [];
    var houseSize = 30;
    var light=['#C8C8C8', '#D0D0D0', '#D3D3D3', '#D8D8D8', '#DCDCDC', '#E0E0E0', 
    '#E8E8E8', '#F0F0F0', '#F5F5F5', '#F8F8F8', '#FFFFFF'];
    var houseSpeed = 6;
    
    var obstacles = [];
    var lowObstacleY;
    var highObstacleY;
    var redColors = ['#e50000', '#cc0000', '#b20000', '#990000',
    '#7f0000', '#660000', '#4c0000'];
    
    var health = 100;
    
    var running_interval;
    
    
    var outer_div;
    var main_menu_element;
    
    // List of upgrades in form ['Name', 'Current Value', 'Starting upgrade price', 'Upgrade multiplier']
    var my_upgrades = [['Armour', 0, 50, 2], 
            ['Health Regen', 0, 150, 2.2],
            ['Boost', 0, 200, 2.5]
              ];
    var total_score = 0;
    var high_score = 0;
    var logged_in = false;
    var invincible = false;
    var boosting = false;
    var username;

    var main_menu;
    var upgrades;
    var leaderboard;
    var login;
    var pages;

    var warning_span;
    var greeting;
    var login_out_button;

    var password;
    var password2;
    var pw2Label;
    var username_input;

    //Requests
    var request_check_login;
    var request_login;
    var request_register;
    var request_logout;
    var request_leaderboard;
    


// Run at the start

    document.addEventListener('DOMContentLoaded', init, false);

    function init(){
        main_menu = document.querySelector('#main_menu');
        upgrades = document.querySelector('#upgrades');
        leaderboard = document.querySelector('#leaderboard');
        login = document.querySelector('#login');
        pages = [main_menu, upgrades, leaderboard, login];

        warning = document.querySelector('#warning');
        
        // Set up listeners
        var back_to_main = document.querySelectorAll('.back_to_main');
        var play_buttons = document.querySelectorAll('.play_button');
        
        for (var i = 0; i<back_to_main.length; i++){
            back_to_main[i].addEventListener('click', showMainMenu);
        }
        for (var i=0; i<play_buttons.length; i++){
            play_buttons[i].addEventListener('click', start_game);
        }
        setupImagesAndBackground();

        request_check_login = new XMLHttpRequest();
        request_check_login.addEventListener('readystatechange', check_login, false);
        request_check_login.open('GET', 'python/js_python/check_login.py', true);

        request_check_login.send(null);

        // Init vars for login/register
        redirect_href = document.querySelector('#login form span a');
        submit_button = document.querySelector('#login_button');
        username_input = document.querySelector('#name');
        password = document.querySelector('#password');
        password2 = document.querySelector('#password2');
        pw2Label = document.querySelector('label[for="password2"');
        title = document.querySelector('.title_bar h1');
        
        showMainMenu();
    
    }

    function setupImagesAndBackground(){
    
        for (var i = 0; i<7; i++){
            var stickImage = new Image();
            stickImage.src = "images/run-" + i + ".png";            
            runningImages.push(stickImage);
        }
            
        for (var i = 0; i<5; i++){
            var stickImage = new Image();
            stickImage.src = "images/duck" + i + ".png";            
            duckImages.push(stickImage);
        }

        stickImages = runningImages;      
    }

    function check_login(){

        // Check that the response has fully arrived
        if ( request_check_login.readyState === 4 ) {
            // Check the request was successful
            if ( request_check_login.status === 200 ) {
                if ( request_check_login.responseText.trim() != 'fail' ) {
                    // logged in, update stats
                    var parsedText = request_check_login.responseText.split('\n');
                    initialize_stats(parsedText);
                    show_logout();

                } else  {
                    init_comments('');
                    // Not logged in or an error
                }
            }
        }
    }





// Main menu stuff

	function showMainMenu(){
        hidePages();
        main_menu.style.display = 'block';
        var button_list = [start_game, go_to_upgrades, show_leaderboard, show_login];
        var buttons = document.querySelectorAll('#main_menu button');
        for (var i=0; i<buttons.length; i++){
            buttons[i].addEventListener('click', button_list[i], false);
            
        }
        login_out_button = buttons[3];
        if(logged_in){
            show_logout();
        }
    }

	function show_greeting(){
        var first_element = main_menu.firstChild;
        greeting = document.createElement('h1');
        greeting.innerHTML = 'Hello ' + username;
        greeting.style.margin = '1em auto';
        logged_in = true;

        main_menu.insertBefore(greeting, first_element);
        window.setTimeout(showMainMenu, 500);
    }

// Leaderboard stuff

	function show_leaderboard(){
        hidePages();
        leaderboard.style.display = 'block';
        request_leaderboard = new XMLHttpRequest();
        request_leaderboard.addEventListener('readystatechange', update_leaderboard, false);
        request_leaderboard.open('GET', 'python/js_python/leaderboard.py', true);

        request_leaderboard.send(null);
    }

    function update_leaderboard(){
        if ( request_leaderboard.readyState === 4 && request_leaderboard.status === 200) {

            //Show table
            var xml = request_leaderboard.response;

            var section = document.querySelector('#leaderboard .content');
            section.innerHTML = xml;

        }
    }

// Upgrades Stuff

	function go_to_upgrades(){
    
        hidePages();

        upgrades.style.display = 'block';
        var balance = document.querySelector('#total_score');
        balance.innerHTML = total_score;
        var data;
        
        var table = document.querySelector('#upgrades table');
        table.innerHTML = '';
        for (var i=0; i<my_upgrades.length;i++){

            var row = document.createElement('tr');
            row.id = my_upgrades[i][0];
            
            var header = document.createElement('th');
            header.innerHTML = my_upgrades[i][0];
            header.colspan = '2';
            row.append(header);
            
            for (j=0; j<5; j++){
                data = document.createElement('td');
                var span = document.createElement('span');
                span.className = 'box';
                span.innerHTML = '&nbsp;';
                if(j< my_upgrades[i][1]){
                    span.style.background = 'green';
                }
                data.appendChild(span);
                row.append(data);
            }
            data = document.createElement('td');

            var button_upgrade = document.createElement('button');
            button_upgrade.value = 'button';
            button_upgrade.colspan = '3';
            var upgrade_cost = my_upgrades[i][2];
            for (j=0; j<my_upgrades[i][1]; j++){
                upgrade_cost *= my_upgrades[i][3];
            }
            button_upgrade.innerHTML = Math.floor(upgrade_cost);
            button_upgrade.addEventListener('click', handle_upgrade);
            
            data.appendChild(button_upgrade);
            
            row.append(data);
            
            table.appendChild(row);   
        }

    
    }

    function handle_upgrade(event){
        var row = event.srcElement.parentElement.parentElement;
        var rows = document.querySelectorAll('#upgrades tr');

        var status;
        for(var i =0; i<rows.length; i++){
            if (rows[i].id === row.id){
            status = i;
            }
        }
        var upgrade_cost = my_upgrades[status][2] ;
        for (var i=0; i<my_upgrades[status][1]; i++){
            upgrade_cost *= my_upgrades[status][3];
        }
        upgrade_cost = upgrade_cost;

        if(upgrade_cost < total_score){
            my_upgrades[status][1]++;
            var boxes = row.querySelectorAll('span');
            
            for (var k=0; k<boxes.length; k++){
            if(k<my_upgrades[status][1]){
                boxes[k].style.background = 'green';
            }
            }
            total_score -= upgrade_cost;
            document.querySelector('#total_score').innerHTML = total_score;
            event.srcElement.innerHTML = Math.floor(upgrade_cost * my_upgrades[status][3]);
            update_stats();
            
        }
    }

// Login/Register/Logout Stuff

	function show_login(event){
		if (event){
        	event.preventDefault();
        }
        hidePages();
        login.style.display = 'block';
        title.innerHTML = 'Login';
        warning.style.display = 'none';

        redirect_href.innerHTML = 'Not registered yet? Click here to register.'
        submit_button.value = 'Login';

        redirect_href.removeEventListener('click', show_login);
        redirect_href.addEventListener('click', show_register, false);

        submit_button.removeEventListener('click', try_register);
        submit_button.addEventListener('click', try_login, false);

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
                            initialize_stats(parsedText);

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

        username = username_input.value;

        if(password.value.length === 0 || username.length === 0){
            warning.style.display ='block';
            warning.style.color = 'red';
            warning.innerHTML = 'You must fill in the form.';
            password.value = '';
            password2.value = '';
            return;
        }

        var values = [username, password.value, 0, 0, 0, 0, 0];
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
                        show_greeting(); 
                        init_comments(username);                     
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


	function show_logout(){
        login_out_button.removeEventListener('click', show_login);
        login_out_button.addEventListener('click', logout);
        login_out_button.innerHTML = 'Logout';
    }

    function logout(){
        request_logout = new XMLHttpRequest();
        request_logout.addEventListener('readystatechange', function(){
                if ( request_logout.readyState === 4 && request_logout.status === 200) {
                    
                    if ( request_logout.responseText.trim() === 'success' ) {
                        // Reset to defaults
                        username = '';
                        high_score = 0;
                        total_score = 0;
                        my_upgrades = [['Armour', 0, 50, 2], 
                                        ['Health Regen', 0, 150, 2.2],
                                        ['Boost', 0, 200, 3]
                                          ];
                        logged_in = false;

                        login_out_button.innerHTML = 'Login';
                        login_out_button.removeEventListener('click', logout);
                        login_out_button.addEventListener('click', show_login);
                        main_menu.removeChild(document.querySelector('#main_menu > h1'));
                        init_comments(username);

                    } else  {
                        console.log('Couldn\'t log out');
                        console.log(request_logout.responseText);
                    }
                    
                }
        });
        request_logout.open('GET', 'python/js_python/logout.py', true);
        request_logout.send(null);
    }


// Game Drawing/Basic Stuff

	function start_game(){
        
        hidePages();

        canvas = document.querySelector('canvas');
        context = canvas.getContext('2d');

        width = canvas.width;
        height = canvas.height;
        startHeight = height - 190;
        lowObstacleY = height - 70;
        highObstacleY = height - 260;
        stickheight = startHeight - 20;

        invincible = username === 'admin';
            
        window.addEventListener('keydown', keyPressed, false);
        window.addEventListener('keyup', keyUnpressed, false);
        running_interval = setInterval(draw, 33);
          
    }

    function draw(){

        score += 0.02;
    
        if (health < 100){
            health += 0.002 + (my_upgrades[1][1] * .01);
        }    
       
       	// Dont overspeed, keep at 20
        if (houseSpeed < 20){
            houseSpeed += 0.004;
        }
        context.clearRect(0, 0, width, height);

        // Draws stickman every second interval 
        if (j % 2 === 0){
            counter ++;
            j = 0;
        }
            
        if (counter === stickImages.length){
            counter = 0;
        }

        // Keep track of boosting time
        if (boosting){
            var curr_time = new Date().getTime();
            if (typeof boostpresstime !== 'undefined'){
                boosttime += (curr_time - boostpresstime);
            }
           
            boostpresstime = curr_time;
            
            if (boosttime > (my_upgrades[2][1] * 2000) || my_upgrades[2][1] === 0){
                stopBoosting();
            }
        }

        drawBackground();
        drawObstacles();
        showHealth();
        showBoost();
        showScore();
        drawStickman();
        j++;
        
    }

    function showHealth(){
        showProgress('Health: ', health, 0);
    }

    function showBoost(){
        if(my_upgrades[2][1] > 0){
            var full_progress = my_upgrades[2][1] * 2000;
            var current_progress = full_progress - boosttime;
            var as_percent = (current_progress/full_progress) * 100;
            showProgress('Boost: ', as_percent, 1);
        }
    }

    function showScore(){
        context.fillStyle = 'black';
        context.font = '16px Arial';
        context.fillText('Score:  ' + Math.floor(score), 10, 40 + (my_upgrades[2][1] > 0 ? 25 : 0));
    }

    function drawObstacles(){
        if (obstacles.length == 0
         || (obstacles.length < 2 + Math.floor(houseSpeed) 
            && getLastItem(obstacles).x + getLastItem(obstacles).xSize + 300 + getRandomNumber(houseSpeed, Math.floor(100 * houseSpeed/8)) < width)){
            obstacles.push(makeObstacle());
        }
        
        if (obstacles[0].x < -obstacles[0].xSize ){
            obstacles.shift();
        }
            
        for (var i = 0; i<obstacles.length; i++){
            if (collides(obstacles[i]) && !invincible){
                health -= (3 - (my_upgrades[0][1] * 0.03));
                if (health < 0){
                    context.clearRect(0, 0, width, height);
                    stop();
                    return;
                }
            }

            context.fillStyle = obstacles[i].color;
            context.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].xSize, obstacles[i].ySize);
            obstacles[i].x -= Math.floor(houseSpeed) * 2;
        }
        
    }

    function drawBackground(){
        if(houses.length === 0 || (houses[houses.length -1].x <= width - houseSize)){
            houses.push({
            x : width,
            y : getRandomNumber(0, height/2),
            color : getRandomItem(light)
            });
        }
      
        for (var i = 0; i<houses.length; i++){
            if (houses[i].x < -houseSize - 20){
                houses.splice(i, 1);
            }
        
            context.fillStyle = houses[i].color;
            context.fillRect(houses[i].x, houses[i].y, houseSize, (height/2) - houses[i].y);
            houses[i].x -= Math.floor(houseSpeed);
        }
      
    }

    function drawStickman(){
            
        
        stickheight = startHeight - 20;

        if (jumping){
        var gravity = rolling ? 4.9 : 3.4;
            var addedHeight = (jumpSpeed * jumpTime) - (gravity * (jumpTime * jumpTime));
            if(addedHeight < 0){
                jumping = false;
                addedHeight = 0;
                stickImages = runningImages;
            }
            stickheight -= addedHeight;
            jumpTime += .66;
            
        }

        var duckHeight = 70;
        
        
        context.drawImage(stickImages[counter], 
                  width/4, !rolling ? stickheight : stickheight + duckHeight + 10, 
                  stickImages[counter].width, 
                  !rolling ? stickImages[counter].height : stickImages[counter].height - duckHeight);
        if (boosting){
            makeYellow(width/4, !rolling ? stickheight : stickheight + duckHeight + 10, 
                  stickImages[counter].width, 
                  !rolling ? stickImages[counter].height : stickImages[counter].height - duckHeight);
        }
        

    }

    function stop(){
        clearInterval(running_interval);
        window.removeEventListener('keyup', keyPressed);
        window.removeEventListener('keydown', keyUnpressed);    

        counter = 0;
        houses = [];
        obstacles = [];
        houseSpeed = 6;
        j = 0;
        rolling = false;
        jumping = false;
        health = 100;
        var boostpresstime = undefined;
        var boosttime = 0;
        
        score = Math.floor(score);
        if (score > high_score){
            high_score = score;
        }
        total_score +=score;
        score = 0;
        
        var main = document.querySelector('main');
        main.removeChild(canvas);
        canvas = document.createElement('canvas');
        canvas.height = 700;
        canvas.width = 1500;
        main.appendChild(canvas);

        update_stats();
        go_to_upgrades();
        
    }



// Game logic/reactions/listeners

	function makeObstacle(){
    
        var x = width;
        var y = getRandomItem([lowObstacleY, highObstacleY]);;
        var color = getRandomItem(redColors);

        var ySize = y === lowObstacleY ? height - y : 70;
        var xSize = getRandomNumber(20, y === lowObstacleY ? 40 : 200);
        
        return {
            x : x, y : y,
            color : color,
            xSize : xSize,
            ySize : ySize };
    
    }

	function collides(x){
        var duckHeight = 70;
        //var stickheight = startHeight - 20;
        var collision = false;
        var image = stickImages[counter];
        switch(x.y){
            case highObstacleY:
            if (!(   x.x < (width/4) + 70
                || x.x > (width/4) + image.width
                || rolling 
                ) ){
                collision = true;
            }
            break;
            case lowObstacleY:
            if (!( x.x < (width/4) || x.x > (width/4) + image.width - 16 
                || x.y > (!rolling ? stickheight : stickheight + duckHeight + 10) + (!rolling ? stickImages[counter].height : stickImages[counter].height - duckHeight)
            )){
              
                collision = true;
            }
        }

        return collision;
    }

    function makeYellow(imageX, imageY, imageWidth, imageHeight){
        // http://jsfiddle.net/m1erickson/2d7ZN/
        var imgData = context.getImageData(imageX, imageY, imageWidth, imageHeight);
        var data = imgData.data;

        for (var i = 0; i < data.length; i += 4) {
            red = data[i + 0];
            green = data[i + 1];
            blue = data[i + 2];
            alpha = data[i + 3];

            // skip transparent/semiTransparent pixels - skip non-blck pixels
            if (alpha < 200 || !(red < 10 && green < 10 && blue < 10)) {
                continue;
            }

            data[i + 0] = 255;
            data[i + 1] = 215;
            data[i + 2] = 0;
        }
        context.putImageData(imgData, imageX, imageY);
    }

    function keyPressed(event){
        
        switch(event.keyCode){

            case 87:
            case 38 :
                event.preventDefault();
                if(jumping){
                    return;
                }
                //up arrow
                counter = 0;
                stickImages = [runningImages[4]];
                jumping = true;
                jumpSpeed = 50;
                jumpTime = 0;
                rolling = false;
                break;

            case 83:
            case 40 :
                event.preventDefault();
                //down
             
                rolling = true;
                stickImages = duckImages;
                if (counter >= stickImages.length){
                    counter = 0;
                }
                break;
            case 32:
                event.preventDefault();
                boost_start();
                break;   
        }
    }

    function keyUnpressed(event){
        switch(event.keyCode){
            case 83:
            case 40 :
                event.preventDefault();
                rolling = false;
                stickImages = runningImages;
                break;

            case 87:
            case 32 :
                event.preventDefault();
                stopBoosting();
                break;
        }
    }

    function stopBoosting(){
        if(boosting){
            houseSpeed -= 10;
            boosting = false;
            if(username !== 'admin'){
               invincible = false;
            }
        }
        boostpresstime = undefined;
    }

    function boost_start(){
        if (!boosting){
            houseSpeed += 10;
            boosting = true;
            invincible = true;
        }
    }


// Help Functions

	function showProgress(label, valueaspercent, progressno){
        var level = 0;
        for (var i = 0; i < progressno; i++) {
            level += 25;
        };
        context.fillStyle = 'black';
        context.font="16px Arial";
        context.fillText(label, 10 , 20 + level);
        context.fillRect(healthBoxStartX, 5 + level, 100 + 6 , 18 );
        context.fillStyle = 'beige';
        context.fillRect(healthBoxStartX+3, 6 + level, 100, 15 );
        context.fillStyle = valueaspercent < 30 ? 'red' : 'green';
        context.fillRect(healthBoxStartX +3, 6 + level, valueaspercent, 15);
    }

	function hidePages(){
        for (var i=0; i<pages.length;i++){
            pages[i].style.display = 'none';
        }
    }
	
    function update_stats(){
        var request = new XMLHttpRequest();
        var params = '';
        var values = [high_score, total_score, my_upgrades[0][1], my_upgrades[1][1], my_upgrades[2][1]];
        var keys = ['high_score', 'curr_balance', 'armour', 'health_regen', 'boost'];
        for (var i=0; i< keys.length; i++){
            params += keys[i] + '=' + values[i] + '&';
        }
        request.open('GET', 'python/js_python/update_stats.py?' + params, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.send(null);
    }

	function initialize_stats(stats){
        //dict_info = ['username', 'high_score', 'curr_balance', 'armour', 'health_regen', 'boost'];
        username = stats[0];
        high_score = convertToInt(stats[1]);
        total_score = convertToInt(stats[2]);
        my_upgrades[0][1] = convertToInt(stats[3]);
        my_upgrades[1][1] = convertToInt(stats[4]);
        my_upgrades[2][1] = convertToInt(stats[5]);
        
        init_comments(username);

        show_greeting();

    }

	function getRandomItem(list){
        return list[getRandomNumber(0, list.length-1)];
    }
    
    function getLastItem(list){
        return list[list.length - 1];
    }
      

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function convertToInt(i) {
        return ~~Number(i);
    }

})();
