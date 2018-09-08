#!/usr/local/bin/python3

from cgitb import enable 
enable()

import pymysql as db
from os import environ
from http.cookies import SimpleCookie
from shelve import open

# Logout and save stats to db

result = 'fail'
http_cookie = environ.get('HTTP_COOKIE')
if http_cookie:
    cookie = SimpleCookie()
    cookie.load(http_cookie)
    if 'karols_sid' in cookie:
        karols_sid = cookie['karols_sid'].value
        session_store = open('sessions/sess_' + str(karols_sid), writeback=True)

        try:
            connection = db.connect('localhost', 'kpp1', 'mah9eiQu', '2021_kpp1')
            cursor = connection.cursor(db.cursors.DictCursor)

            dict_info = ['username', 'high_score', 'curr_balance', 'armour', 'health_regen', 'boost']

            cursor.execute("""UPDATE runner
                           SET high_score = %s,
                               curr_balance= %s,
                               armour = %s,
                               health_regen = %s,
                               boost = %s
                           WHERE username = %s
                           """, (session_store['high_score'], session_store['curr_balance'], session_store['armour'],
                 session_store['health_regen'], session_store['boost'], session_store['username']))
            connection.commit()

            cursor.close()
            connection.close()

            session_store['authenticated'] = False
            session_store.close()
            result = 'success'
        except (db.Error, IOError, Exception) as e:
            result = 'fail' + str(e)

print('Content-type: text/plain')
print()
print(result, end='')
