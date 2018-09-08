
var request_comment;
var delete_request;
var send_comment_request;
var name;
var login_button;

function init_comments(username){
	request_comment = new XMLHttpRequest();
    request_comment.addEventListener('readystatechange', update_comments, false);
    request_comment.open('GET', 'python/comments/get_comments.py', true);
    request_comment.send(null);
    name = typeof username === 'undefined' ? '' : username;

    // Send comment through ajax and update page
    var my_form = document.querySelector('#comment-form');
    my_form.addEventListener('submit', send_comment, false);

    // Check if logged in and can comment
    login_button = document.createElement('button');


    var text_box = document.querySelector('#post-comment textarea');
    var submit_button = document.querySelector('#post-comment input');

    if(name === ''){
        text_box.disabled = true;
        text_box.value = 'You must be logged in to comment. '

        submit_button.addEventListener('click', go_to_login);
        submit_button.value = 'Login';

    }
    else{
        text_box.disabled = false;
        submit_button.disabled = false;
        text_box.value = '';
        login_button.display = 'none';

        submit_button.value = 'Comment';
        submit_button.removeEventListener('click', go_to_login);
    }
    
}

function go_to_login(){
    window.open('login.html', "_self");
}

function send_comment(event){
    event.preventDefault();
    var comment_text = document.querySelector('#post-comment textarea').value;
    send_comment_request = new XMLHttpRequest();
    send_comment_request.addEventListener('readystatechange', function(){
        if(send_comment_request.readyState === 4 && send_comment_request.status === 200)
            init_comments(name);
    }, false);
    send_comment_request.open('GET', 'python/comments/comment.py?new_comment='+ encodeURIComponent(comment_text), true);
    send_comment_request.send(null);

}

function update_comments(){
	// Check that the response has fully arrived
    if ( request_comment.readyState === 4 ) {
        // Check the request_comment was successful
        if ( request_comment.status === 200 ) {
            var comments_section = document.querySelector('#comments');
            comments_section.innerHTML = request_comment.responseText;
            delete_button = document.querySelectorAll('#comments button');
            for (var i = 0; i < delete_button.length; i++) {
            	delete_button[i].addEventListener('click', delete_comment);
            };
            changeDeleteButton(name !== 'admin');
        }
    }
}

function changeDeleteButton(hide){
    if (typeof delete_button === 'undefined') return;
    for (var i = 0; i< delete_button.length; i++){
        delete_button[i].style.display = hide ? 'none' : 'inline';
    }
}

function delete_comment(event){
    delete_request = new XMLHttpRequest();
    delete_request.addEventListener('readystatechange', function(){init_comments(name);}, false);
    delete_request.open('GET', 'python/comments/delete_comment.py?my_id=' + event.target.id);
    delete_request.send(null);
}

