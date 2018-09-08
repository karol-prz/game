#!/usr/local/bin/python3

from cgitb import enable 
enable()

from cgi import FieldStorage, escape
import pymysql as db
from http.cookies import SimpleCookie
from shelve import open
from hashlib import sha256
from time import time
import util

form_data = FieldStorage()

result = 'Error, try again later.'

if len(form_data):
    username = escape(form_data.getfirst('username', '')).strip()
    pw = escape(form_data.getfirst('pw', '')).strip()

    if username and pw:
        try:
            sha256_password = sha256(pw.encode()).hexdigest()

            connection = db.connect('localhost', 'kpp1', 'mah9eiQu', '2021_kpp1')
            cursor = connection.cursor(db.cursors.DictCursor)
            cursor.execute("""SELECT * FROM runner 
                              WHERE username = %s""", (username))
            if cursor.rowcount > 0:
                result = 'This username is already taken'
            else:
                # Take in current status if sent
                high_score = util.getInt('high_score', 0)
                curr_balance = util.getInt('curr_balance', 0)
                armour = util.getInt('armour', 0, 5)
                health_regen = util.getInt('health_regen', 0, 5)
                boost = util.getInt('boost', 0, 5)

                cursor.execute("""
                        INSERT INTO runner (username, pw, high_score, curr_balance, armour, health_regen, boost)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)

                    """, (username, sha256_password, high_score, curr_balance, armour, health_regen, boost))
                connection.commit()

                cookie = SimpleCookie()
                karols_sid = sha256(repr(time()).encode()).hexdigest()
                cookie['karols_sid'] = karols_sid
                cookie['karols_sid']['expires'] = 157680000
                cookie['karols_sid']['path'] = '/';

                session_store = open('sessions/sess_' + karols_sid, writeback=True)

                session_store['authenticated'] = True

                dict_info = ['username', 'high_score', 'curr_balance', 'armour', 'health_regen', 'boost']
                stats = [username, high_score, curr_balance, armour, health_regen, boost]
                for i in range(len(dict_info)):
                    session_store[dict_info[i]] = stats[i]


                session_store.close()
                result = 'Registration complete!'
                
                print(cookie)
            cursor.close()  
            connection.close()
        except (db.Error, IOError) as e:
            result = 'Sorry! We are experiencing problems at the moment. Please call back later.'
            result += '\n' + str(e)


    else:
        result = 'Stop messing with the javascript!' 
    
print('Content-Type: text/html')
print()


print(result)