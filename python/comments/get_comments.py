#!/usr/local/bin/python3

from cgitb import enable 
enable()

from cgi import FieldStorage
from html import escape
import pymysql as db
from time import time

print("Content-type: text/html")
print()

result = ''



try:
    connection = db.connect('localhost', 'kpp1', 'mah9eiQu', '2021_kpp1')
    cursor = connection.cursor(db.cursors.DictCursor)

    cursor.execute("""
        SELECT comment_id, username, comment FROM comments
        ORDER BY comment_id DESC
        """)

    for r in cursor.fetchall():

        result += '''
            <section >
                <div>
                    <strong>%s</strong> 
                    <button type="button" id="%s">Delete</button>
                </div>
                <p>%s</p>
            </section>''' % (r['username'], r['comment_id'], r['comment'])

    connection.close()
    cursor.close()

except db.Error as e:
    error = open('error.log', 'a+')
    error.write(str(e) + '\n')
    result = '<p>Our servers are under maintenance at the moment. Please call back in a minute</p>'


print(result)



