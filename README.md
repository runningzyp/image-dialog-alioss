# image-dialog-alioss

为editor.md编辑器添加上传图片插件,可以上传图片到阿里云的对象存储空间oss

## 创作动机

editor.md 是一款支持markdown的WEB编辑器，用户可以在自己的网站上使用其进行内容编辑,由于其自带的图片组件只适用于上传图片到本地服务器,由于带宽限制和不方便管理等原因,不如上传到第三方云存储,本插件采用了阿里云的对象存储oss,通过BGP网络或者CDN加速的方式，提供用户就近访问，有效降低云服务器负载，提升用户体验
## 项目目录

*static/editor.md-master* 为编辑器文件,其中plugins为插件目录文件夹

*image-dialog-alioss* 为项目文件目录,其中的同名js文件为插架主文件,需要放在plugins文件夹目录中
## 怎么使用

本项目使用`python3 flask`做服务器端,使用前需要配置python 开发环境

1. **克隆项目到本地**

    `git clone http://github.com/runningzyp/image-dialog-alioss.git`

2. **进入项目目录**

    `cd imgae-dialog-alioss`

3. **配置环境**

    `pip3 install -r requirements.txt`

4. **运行服务器**

    `python3 appserver.py`

浏览器访问 http://127.0.0.1:5000/upload 即可



原理介绍:

![](http://zhanyunpeng-test.oss-cn-shanghai.aliyuncs.com/dir/[1543282796]oss.png)

前端向服务器申请上传令牌后,上传图片到阿里云oss并回调,上传成功后服务器返回数据到阿里云oss,阿里云oss再返回图片网址到前端,完成整个过程


## 如何移植

### 前端配置
首先初始化editor.md编辑器,并且引入本项目插件文件
可以参考项目中upload.html示例


`<script src="../editor.md-master/plugins/img-dialog-alioss/img-dialog-alioss.js">`

```javascript
<script>
    var uploadtEditor;
    $SCRIPT_ROOT = "http://127.0.0.1:5000"; //你的本地服务器获取令牌地址
    $(function () {
        uploadEditor = editormd("upload-editormd", {
            width: '80%',
            height: '800px',
            syncScrolling: "single",
            path: "{{url_for('static',filename= 'editor.md-master/lib/')}}",
            imageUpload: true,
            imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
            toolbarIcons: function () {
                return ["bold", "del", "italic", "hr", "image", "alioss", "table", "datetime", "|",
                    "preview", "watch", "|", "fullscreen"
                ];
            },
            toolbarIconsClass: {
                alioss: "fa-cloud-upload"
            },
            toolbarHandlers: {
                alioss: function (cm, icon, cursor, selection) {
                    this.imageDialogAli();
                }
            },
            aliyunTokenUrl: $SCRIPT_ROOT, //本地服务器获取阿里云token的url
        });

    })
</script>

```

注意

> uploadEditor = editormd("upload-editormd", {});

其中`upload-editormd` 为 textarea域
```
<div id="upload-editormd">
    <textarea></textarea>
</div>
```

### 服务器端配置

本插件服务器是用python写的,如果用其他语言写的话
需要设置服务器令牌获取地址 *$SCRIPT_ROOT* 
插件向该地址发送一个post请求并期望返回一个json格式的 令牌数据
数据内容包括以下几个域
```json
{
"accessid":"6MKOqxGiGU4AUk44",
"host":"http://post-test.oss-cn-hangzhou.aliyuncs.com",
"policy":"eyJleHBpcmF0aW9uIjoiMjAxNS0xMS0wNVQyMDo1MjoyOVoiLCJjdb25kaXRpb25zIjpbWyJjdb250ZW50LWxlbmd0aC1yYW5nZSIsMCwxMDQ4NTc2MDAwXSxbInN0YXJ0cy13aXRoIiwiJGtleSIsInVzZXItZGlyXC8iXV19",
"signature":"VsxOcOudxDbtNSvz93CLaXPz+4s=",
"expire":1446727949,
"callback":"eyJjYWxsYmFja1VybCI6Imh0dHA6Ly9vc3MtZGVtby5hbGl5dW5jcy5jdb206MjM0NTAiLCJjYWxsYmFja0hvc3QiOiJvc3MtZGVtby5hbGl5dW5jcy5jdb20iLCJjYWxsYmFja0JvZHkiOiJmaWxlbmFtZT0ke29iamVjdH0mc2l6ZT0ke3NpemV9Jm1pbWVUeXBlPSR7bWltZVR5cGV9JmhlaWdodD0ke2ltYWdlSW5mby5oZWlnaHR9JndpZHRoPSR7aW1hZ2VJdbmZvLndpZHRofSIsImNhbGxiYWNrQm9keVR5cGUiOiJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQifQ==",
"dir":"user-dirs/"
}
```

上述示例的callback内容采用的是base64编码。经过base64解码后的内容如下：


```json
{"callbackUrl":"http://oss-demo.aliyuncs.com:23450",
"callbackHost":"oss-demo.aliyuncs.com",
"callbackBody":"filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}",
"callbackBodyType":"application/x-www-form-urlencoded"}
```

具体示例请参考 https://help.aliyun.com/document_detail/31927.html


