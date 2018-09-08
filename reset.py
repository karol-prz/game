#!/usr/local/bin/python3

from cgitb import enable
enable()

# Other imports can go here
from cgi import FieldStorage
from html import escape
import pymysql as db
from hashlib import sha256
from time import time
from shelve import open
from os import environ
from http.cookies import SimpleCookie
import os

print("Content-type: text/html")
print()

output = """
        <h1>You are not wanted here!</h1>
        <p>You do not have permission to view this webpage, <a href="login.html">login</a> and come back later</p>
"""

def showUsers(cursor):
    result = ''
    cursor.execute('SELECT * from runner where username <> "admin"');
    result += """
        <p>Remove users. WARNING: This action is irreversible.</p>
        <form method="get" action="reset.py">"""
    for row in cursor.fetchall():
        username_no_spaces = row['username'].replace(' ', "+")
        result += """
            <label for="%s">%s</label>
            <input type="checkbox" value="%s" name="remove" id="%s"/><br>
            """ % (username_no_spaces, row['username'], row['username'], username_no_spaces)

    result += """
            <input type="submit" value="Remove Selected"/>
        </form>"""
    return result


cookie = SimpleCookie()
http_cookie_header = environ.get('HTTP_COOKIE')
if http_cookie_header:
    cookie.load(http_cookie_header)
    if 'karols_sid' in cookie:
        karols_sid = cookie['karols_sid'].value
        session_store = open('python/js_python/sessions/sess_' + str(karols_sid), writeback=True)
        if session_store['authenticated'] and session_store['username'] == 'admin':
            try:
                connection = db.connect('localhost', 'kpp1', 'mah9eiQu', '2021_kpp1')
                cursor = connection.cursor(db.cursors.DictCursor)

                output = """
                    <p>Reset all values to default in my database</p>
                    <form method="get" action="reset.py">
                        <label for="accept">I accept so go ahead</label>
                        <input type="checkbox" value="accept" name="reset" id="accept"/>
                        <input type="submit" value="Reset"/>
                    </form>
                    """

                form_data = FieldStorage()

                reset_input = form_data.getlist('reset')
                remove_input = form_data.getlist('remove')

                if len(form_data) != 0:

                    if(len(reset_input) > 0):

                        commands = ["""drop table if exists runner;""",
                            """
                            create table runner
                            (
                                username varchar(100) not null,
                                pw varchar(64),
                                high_score int,
                                curr_balance int,
                                armour int,
                                health_regen int,
                                boost int,
                                primary key (username)
                            );""",
                            """
                                INSERT INTO runner (username, pw, high_score, curr_balance, armour, health_regen, boost)
                                select 'admin', SHA2('hello', 256), 0, 1000, 5, 5, 5
                                ;""",
                            """
                                INSERT INTO runner (username, pw, high_score, curr_balance, armour, health_regen, boost)
                                select 'NaN', SHA2('undefined', 256), 0, 10000000, 0, 0, 0
                                ;"""]
                        for c in commands:
                            cursor.execute(c)
                            connection.commit()


                        os.chdir('python/js_python/sessions')
                        sessions = os.listdir('.')
                        for sesh in sessions:
                            if('sess_' + str(karols_sid) != sesh):
                                os.remove(sesh)

                        output += showUsers(cursor)
                        output += """
                            <p>
                                Database was reset successfully!
                            </p>"""

                    elif (len(remove_input) > 0):
                        sql_command = 'DELETE from runner WHERE'
                        for users in remove_input:
                            sql_command += ' username = %s OR'

                        cursor.execute(sql_command[:-3], remove_input)
                        connection.commit()

                        output += showUsers(cursor)
                        output += '<p>%s deleted succesfully!</p>' % (', '.join(remove_input))


                    cursor.close()
                    connection.close()

                else:
                    output += showUsers(cursor)

            except db.Error as e:
                output += '<p>Sorry! We are experiencing problems at the moment. Please call back later.</p>'
                output += str(e)



print("""
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>Reset</title>
            <style>p{border-top: 1px black dashed; padding-top: 0.5em;}</style>
        </head>
        <body>
      
        %s

        </body>
    </html>""" % output) 

