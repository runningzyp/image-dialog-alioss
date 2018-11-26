# image-dialog-alioss

为editor.md编辑器添加上传图片插件,可以上传图片到阿里云的对象存储空间oss

## 创作动机

editor.md 是一款支持markdown的WEB编辑器，用户可以在自己的网站上使用其进行内容编辑,由于其自带的图片组件只适用于上传图片到本地服务器,由于带宽限制和不方便管理等原因,不如上传到第三方云存储,本插件采用了阿里云的对象存储oss,通过BGP网络或者CDN加速的方式，提供用户就近访问，有效降低云服务器负载，提升用户体验

## 怎么使用

首先初始化editor.md编辑器,并且引入本项目插件文
```javascript
<script src="../editor.md-master/plugins/img-dialog-alioss/img-dialog-alioss.js"></script>
```
```javascript
<script>
    var uploadtEditor;
    $SCRIPT_ROOT = "http://127.0.0.1:5000"; //你的本地服务器根地址
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


