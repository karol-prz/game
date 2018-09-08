#!/usr/local/bin/python3

from cgitb import enable 
enable()

from cgi import FieldStorage, escape
import pymysql as db
from http.cookies import SimpleCookie
from shelve import open
from hashlib import sha256
from time import time

form_data = FieldStorage()

result = 'fail'

if len(form_data):
    username = escape(form_data.getfirst('username', '')).strip()
    pw = escape(form_data.getfirst('pw', '')).strip()
    if username and pw:
        try:
            sha256_password = sha256(pw.encode()).hexdigest()

            connection = db.connect('localhost', 'kpp1', 'mah9eiQu', '2021_kpp1')
            cursor = connection.cursor(db.cursors.DictCursor)
            cursor.execute("""SELECT * FROM runner 
                              WHERE username = %s
                              AND pw = %s""", (username, sha256_password))
            if cursor.rowcount == 0:
                result = 'fail'
            else:
                cookie = SimpleCookie()
                karols_sid = sha256(repr(time()).encode()).hexdigest()
                cookie['karols_sid'] = karols_sid
                cookie['karols_sid']['expires'] = 157680000
                cookie['karols_sid']['path'] = '/';

                session_store = open('sessions/sess_' + karols_sid, writeback=True)

                user_info = cursor.fetchone()
                session_store['authenticated'] = True
                result = ''
                dict_info = ['username', 'high_score', 'curr_balance', 'armour', 'health_regen', 'boost']
                for i in dict_info:
                    session_store[i] = user_info[i]
                    result += str(user_info[i]) + '\n'

                session_store.close()
                
                print(cookie)
            cursor.close()  
            connection.close()
        except (db.Error, IOError):
            result = 'fail'


    else:
        pass


print('Content-Type: text/html')
print()

print(result, end='')
