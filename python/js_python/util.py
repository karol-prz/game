#!/usr/local/python3

from cgi import FieldStorage, escape
from shelve import open
from os import environ
from http.cookies import SimpleCookie
from os import environ



def getInt(key, min_int=None, max_int=None, default=0):
    form_data = FieldStorage()
    value = escape(form_data.getfirst(key, '')).strip()
    
    if value:
        try:
            value = int(value)
            if (min_int and value <= min_int) or (max_int and value > max_int):
                value = default
        except ValueError:
            value = default
    else:
        value = default
    return value


# return '' or username
def isLoggedIn():
    http_cookie = environ.get('HTTP_COOKIE')
    if http_cookie:
        cookie = SimpleCookie()
        cookie.load(http_cookie)
        if 'karols_sid' in cookie:
            try:
                karols_sid = cookie['karols_sid'].value
                session_store = open('sessions/sess_' + str(karols_sid), writeback=False)
                if 'authenticated' in session_store and session_store['authenticated']:
                    return session_store['username']
            except:
                return ''
    return ''

