from flask import Flask, render_template, request, jsonify
import pymysql
import os

app = Flask(__name__)

db_host = os.environ.get('DB_HOST', 'localhost')
db_user = os.environ.get('DB_USER', 'root')
db_password = os.environ.get('DB_PASSWORD', 'Vaj@2001')
db_name = os.environ.get('DB_NAME', 'appointzen')

def get_db_connection():
    return pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        db=db_name,
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/book', methods=['GET', 'POST'])
def book():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        mobile = request.form['mobile']
        date = request.form['date']
        time = request.form['time']
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                sql = "INSERT INTO appointments (name, email, mobile, date, time) VALUES (%s, %s, %s, %s, %s)"
                cursor.execute(sql, (name, email, mobile, date, time))
            conn.commit()
            return render_template('success.html', name=name, date=date, time=time)
        except Exception as e:
            return render_template('book.html', error=f"Error: {e}")
        finally:
            conn.close()
    
    return render_template('book.html')

if __name__ == '__main__':
    app.run(debug=True)
