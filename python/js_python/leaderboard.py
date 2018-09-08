#!/usr/local/bin/python3

from cgitb import enable 
enable()


import pymysql as db
from os import environ
from http.cookies import SimpleCookie
from shelve import open

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
                session_store = open('sessions/sess_' + str(karols_sid), writeback=True)
                if session_store['authenticated']:
                    return session_store['username']
            except:
                return ''
    return ''


try:

    connection = db.connect('localhost', 'kpp1', 'mah9eiQu', '2021_kpp1')
    cursor = connection.cursor(db.cursors.DictCursor)
    cursor.execute("""SELECT username, high_score FROM runner 
                      WHERE username <> 'admin'
                      ORDER BY high_score DESC 
                      """)
    logged_in = isLoggedIn()
    result = '<table>'
    for row in cursor.fetchall()[0:10]:
        result += '''
                    <tr id="%s">
                        <th>%s</th><th>%d</th>
                    </tr>
        ''' % ('loggedin' if row['username'] == logged_in else '', row['username'], row['high_score'])
    result += '</table>'
    cursor.close()  
    connection.close()
except (db.Error, IOError) as e:
    result = '<p>Our servers are under maintenance, please call back later!' + str(e) + '</p>'

print('Content-Type: text/html')
print()

print(result)

