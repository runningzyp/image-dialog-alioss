# -*- coding:utf-8 -*-

import base64
import oss2
import time
import datetime
import json
import hmac

from hashlib import sha1 as sha
from flask import Flask
from flask import render_template,request,url_for,redirect



# 请填写您的AccessKeyId。
access_key_id = 'LTAIqKp12uqVeSZn'
# 请填写您的AccessKeySecret。
access_key_secret = b'JhgMX4DWGFEwS7MnknuncMjuSm1HLI'
# host的格式为 bucketname.endpoint ，请替换为您的真实信息。
host = 'http://zhanyunpeng-test.oss-cn-shanghai.aliyuncs.com'
# callback_url为 上传回调服务器的URL，请将下面的IP和Port配置为您自己的真实信息。
callback_url = "http://106.14.134.160:5000/call-back"
# 用户上传文件时指定的前缀。
upload_dir = ''
expire_time = 300

def get_iso_8601(expire):
    gmt = datetime.datetime.utcfromtimestamp(expire).isoformat()
    gmt += 'Z'
    return gmt

def get_token():
    now = int(time.time())
    expire_syncpoint = now + expire_time
	
    expire = get_iso_8601(expire_syncpoint)

    policy_dict = {}
    policy_dict['expiration'] = expire
    condition_array = []
    array_item = []
    array_item.append('starts-with')
    array_item.append('$key')
    array_item.append(upload_dir)
    condition_array.append(array_item)
    policy_dict['conditions'] = condition_array 
    policy = json.dumps(policy_dict).strip().encode('utf-8')
    policy_encode = base64.b64encode(policy)
    h = hmac.new(access_key_secret, policy_encode, sha)
    sign_result = base64.encodebytes(h.digest()).strip().decode('utf-8')
    callback_dict = {}
    callback_dict['callbackUrl'] = callback_url
    callback_dict['callbackBody'] = 'bucket=${bucket}&filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}'
    callback_dict['callbackBodyType'] = 'application/x-www-form-urlencoded'
    callback_param = json.dumps(callback_dict).strip().encode('utf-8')
    base64_callback_body = base64.b64encode(callback_param).decode('utf-8')

    token_dict = {}
    token_dict['accessid'] = access_key_id
    token_dict['host'] = host
    token_dict['policy'] = policy_encode.decode('utf-8')
    token_dict['signature'] = sign_result 
    token_dict['expire'] = expire_syncpoint
    token_dict['dir'] = upload_dir
    token_dict['callback'] = base64_callback_body
    result = json.dumps(token_dict)
    return result



app = Flask(__name__)
@app.route('/',methods=['POST','GET'])
def index():
    if request.method == 'POST':
        return get_token()
    return render_template('index.html')

@app.route('/call-back',methods=['POST','GET'])
def call_back():
    if request.method =='POST':
        data = request.get_data()
        print(data)
        print(type(data))
        filename = request.form.get('filename')
        bucket = request.form.get('bucket')
       	url = host+'/'+filename
        return json.dumps({'filename':filename,'url':url})
    return 'success'


@app.route('/upload',methods=['POST','GET'])
def upload():
    return render_template('upload.html')

if __name__ == "__main__":
    app.run()