#!/usr/local/bin/python3

from cgitb import enable 
enable()

from cgi import FieldStorage
from html import escape
import pymysql as db
from os import environ
from http.cookies import SimpleCookie
from shelve import open

form_data = FieldStorage()

print("Content-type: text/html")
print()
result = ''
# return '' or username
def isLoggedIn():
    http_cookie = environ.get('HTTP_COOKIE')
    if http_cookie:
        cookie = SimpleCookie()
        cookie.load(http_cookie)
        if 'karols_sid' in cookie:
            try:
                karols_sid = cookie['karols_sid'].value
                session_store = open('../js_python/sessions/sess_' + karols_sid, writeback=True)
                if session_store['authenticated']:
                    return session_store['username']
            except IOError:
                return ''
    return ''


if len(form_data):
    comment = escape(form_data.getfirst('new_comment', '')).strip()
    username = isLoggedIn()
    result += 'Username: %s \n\n Comment: %s \n\n' % (username, comment)
    if comment and username:
        result += 'hi \n'
        try:
            connection = db.connect('localhost', 'kpp1', 'mah9eiQu', '2021_kpp1')
            cursor = connection.cursor(db.cursors.DictCursor)

            cursor.execute("""
                INSERT INTO comments (username, comment, comment_time)
                VALUES (%s, %s, NOW())
                """, (username, comment))
            connection.commit()
            connection.close()
            cursor.close()
        except db.Error as e:

            result += str(e)

