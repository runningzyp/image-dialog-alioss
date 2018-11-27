# image-dialog-alioss

为editor.md编辑器添加上传图片插件,可以上传图片到阿里云的对象存储空间oss

## 创作动机

editor.md 是一款支持markdown的WEB编辑器，用户可以在自己的网站上使用其进行内容编辑,由于其自带的图片组件只适用于上传图片到本地服务器,由于带宽限制和不方便管理等原因,不如上传到第三方云存储,本插件采用了阿里云的对象存储oss,通过BGP网络或者CDN加速的方式，提供用户就近访问，有效降低云服务器负载，提升用户体验
## 项目目录

editor.md-master 为编辑器文件,其中plugins为插件目录文件夹
image-dialog-alioss 为项目文件目录,其中的同名js文件为插架主文件,需要放在plugins文件夹目录中
## 怎么使用

本项目使用**python3 flask**做服务器端,使用前需要配置python 开发环境

1. **克隆项目到本地**

    `git clone http://github.com/runningzyp/image-dialog-alioss.git`

2. **进入项目目录**

    `cd imgae-dialog-alioss`

3. **配置环境**

    `pip3 install -r requirements.txt`

4. **运行服务器**

    `python3 appserver.py`

浏览器访问 http://127.0.0.1:5000/upload 即可


### 前端配置
首先初始化editor.md编辑器,并且引入本项目插件文件
可以参考项目中upload.html示例

`<script src="../editor.md-master/plugins/img-dialog-alioss/img-dialog-alioss.js">`

### 服务器端配置

原理介绍:

![](http://zhanyunpeng-test.oss-cn-shanghai.aliyuncs.com/dir/[1543282796]oss.png)

前端向服务器申请上传令牌后,上传图片到阿里云oss并回调,上传成功后服务器返回数据到阿里云oss,阿里云oss再返回图片网址到前端,完成整个过程

