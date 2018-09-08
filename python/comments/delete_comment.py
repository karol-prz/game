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
def isAdmin():
    http_cookie = environ.get('HTTP_COOKIE')
    if http_cookie:
        cookie = SimpleCookie()
        cookie.load(http_cookie)
        if 'karols_sid' in cookie:
            try:
                karols_sid = cookie['karols_sid'].value
                session_store = open('../js_python/sessions/sess_' + karols_sid, writeback=True)
                if session_store['authenticated']:
                    return session_store['username'] == 'admin'
            except IOError:
                return ''
    return ''

if len(form_data):
    comment_id = escape(form_data.getfirst('my_id', '')).strip()
    if isAdmin():

        try:
            connection = db.connect('localhost', 'kpp1', 'mah9eiQu', '2021_kpp1')
            cursor = connection.cursor(db.cursors.DictCursor)

            cursor.execute('SELECT * from comments WHERE comment_id = %s', comment_id)
            if cursor.rowcount == 0:
                result = 'fail'
            else:
                cursor.execute("""
                    DELETE from comments WHERE comment_id = %s
                    """, comment_id)

                connection.commit()

                connection.close()
                cursor.close()
                result = 'success'

        except db.Error as e:
            
            result = 'fail                                                                  '


print(result)


