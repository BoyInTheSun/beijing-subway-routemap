from flask import Flask, request, make_response, Response
# import sqlalchemy
import uuid
import hashlib
import datetime
import os
import csv

ROOT = '/api'

app = Flask(__name__)


@app.route(ROOT + '/visit', methods=['GET'])
def visit():
    global uuids
    global person_time
    global person_num
    is_new = False
    person_time += 1
    this_uuid = request.cookies.get('uuid')
    this_ug = request.headers.get('User-Agent')
    this_ip = request.headers.get('X-Real-IP') or request.remote_addr
    if not this_uuid or this_uuid not in uuids:
        is_new = True
        fake_mac = int(hashlib.md5((this_ip + this_ug).encode()).hexdigest()[:12], 16)
        this_uuid = str(uuid.uuid1(node=fake_mac))
        uuids.add(this_uuid)
        person_num += 1
    with open('visiters.csv', 'a', newline='') as f:
        w = csv.writer(f)
        w.writerow([
            str(datetime.datetime.now()),
            this_uuid,
            this_ip,
            this_ug
        ])
    res = make_response({
        'message': 'new' if is_new else 'repeat',
        'person_time': person_time,
        'person_num': person_num
    })
    if is_new:
        res.set_cookie(key='uuid', value=this_uuid, path='/api', samesite='Strict', max_age=60 * 60 * 24)
    return res

if __name__=="__main__":
    uuids = set()
    person_time = 0
    person_num = 0
    if not os.path.exists('visiters.csv'):
        with open('visiters.csv', 'w', newline='') as f:
            w = csv.writer(f)
            w.writerow(['datetime', 'uuid', 'ip', 'ug'])
    else:
        with open('visiters.csv', 'r') as f:
            r = csv.reader(f)
            h = next(r)
            for line in r:
                person_time += 1
                if line[1] not in uuids:
                    uuids.add(line[1])
                    person_num += 1

    app.run(port=5080, host="127.0.0.1")