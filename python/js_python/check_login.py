#!/usr/local/bin/python3

from cgitb import enable 
enable()

from os import environ
from http.cookies import SimpleCookie
from shelve import open

# Check if session store is still active, run when webpage loads
# If it is return current stats

print('Content-type: text/plain')
print()

result = 'fail'
http_cookie = environ.get('HTTP_COOKIE')
if http_cookie:
    cookie = SimpleCookie()
    cookie.load(http_cookie)
    if 'karols_sid' in cookie:
        try:
            karols_sid = cookie['karols_sid'].value
            session_store = open('sessions/sess_' + str(karols_sid), writeback=True)
            if 'authenticated' in session_store and session_store['authenticated']:
                result = ''
                dict_info = ['username', 'high_score', 'curr_balance', 'armour', 'health_regen', 'boost']
                for i in dict_info:
                    result += str(session_store[i]) + '\n'
                session_store.close()
                
        except IOError:
            result = 'fail'

print(result, end='')
