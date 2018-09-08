#!/usr/local/bin/python3

from cgitb import enable 
enable()

from os import environ
from http.cookies import SimpleCookie
from shelve import open
import util
import pymysql as db
print('Content-Type: text/html')
print()
# Updates stats
# Write to d and session store

result = 'fail'
http_cookie = environ.get('HTTP_COOKIE')
if http_cookie:
    cookie = SimpleCookie()
    cookie.load(http_cookie)
    
    if 'karols_sid' in cookie:
        karols_sid = cookie['karols_sid'].value
        #try:
        session_store = open('sessions/sess_' + str(karols_sid), writeback=True)
        if session_store['authenticated']:

            # Take in current status if sent
            high_score = util.getInt('high_score', 0)
            curr_balance = util.getInt('curr_balance', 0)
            armour = util.getInt('armour', 0, 5)
            health_regen = util.getInt('health_regen', 0, 5)
            boost = util.getInt('boost', 0, 5)

            connection = db.connect('localhost', 'kpp1', 'mah9eiQu', '2021_kpp1')
            cursor = connection.cursor(db.cursors.DictCursor)

            dict_info = ['high_score', 'curr_balance', 'armour', 'health_regen', 'boost']
            generic_list = [high_score, curr_balance, armour, health_regen, boost]
            for i in range(len(dict_info)):
                session_store[dict_info[i]] = generic_list[i]

            cursor.execute("""
                UPDATE runner
                SET high_score = %s,
                curr_balance= %s,
                armour = %s,
                health_regen = %s,
                boost = %s
                WHERE username = %s
                """, (session_store['high_score'], session_store['curr_balance'], session_store['armour'],
                session_store['health_regen'], session_store['boost'], session_store['username']))
            connection.commit()

            session_store.close()
            result = 'success'
       # except (IOError, db.Error):
       #     result = 'fail'





print(result)