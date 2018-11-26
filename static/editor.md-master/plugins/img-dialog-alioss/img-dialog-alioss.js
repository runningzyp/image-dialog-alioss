/*!
 * Image (upload) dialog By Alioss plugin for Editor.md
 *
 * @file        image-dialog-alioss.js
 * @author      136688059@qq.com
 * @version     1.0
 * @updateTime  2018-11-26
 * {@link       http://test-oss.xiangcaihua.com/}
 * @license     MIT
 */

(function () {

    var factory = function (exports) {

        var pluginName = "image-dialog-alioss";

        exports.fn.imageDialogAli = function () {

            var _this = this;
            var cm = this.cm;
            var lang = this.lang;
            var editor = this.editor;
            var settings = this.settings;
            var cursor = cm.getCursor();
            var selection = cm.getSelection();
            var imageLang = lang.dialog.image;
            var classPrefix = this.classPrefix;
            var iframeName = classPrefix + "image-iframe";
            var dialogName = classPrefix + pluginName,
                dialog;
            var ajaxToken = {}; //向本地服务器请求阿里云的上传token

            cm.focus();

            var loading = function (show) {
                var _loading = dialog.find("." + classPrefix + "dialog-mask");
                _loading[(show) ? "show" : "hide"]();
            };

            if (editor.find("." + dialogName).length < 1) {
                var guid = (new Date).getTime();
                var action = settings.imageUploadURL + (settings.imageUploadURL.indexOf("?") >= 0 ? "&" : "?") + "guid=" + guid;

                if (settings.crossDomainUpload) {
                    action += "&callback=" + settings.uploadCallbackURL + "&dialog_id=editormd-image-dialog-" + guid;
                }

                var dialogContent = ((settings.imageUpload) ? "<form id=\"aliossUploadForm\" method=\"post\" enctype=\"multipart/form-data\" class=\"" + classPrefix + "form\" onsubmit=\"return false;\">" : "<div class=\"" + classPrefix + "form\">") +
                    "<label>" + imageLang.url + "</label>" +
                    "<input type=\"text\" data-url />" + (function () {
                        return (settings.imageUpload) ? "<div class=\"" + classPrefix + "file-input\">" +
                            "<input type=\"file\" name=\"file\" id = \"file\" accept=\"image/*\" />" +
                            "<input type=\"submit\" value=\"阿里oss上传\" click=\"alert('dd')\" />" +
                            "</div>" : "";
                    })() +
                    "<br/>" +
                    "<input name=\"token\" type=\"hidden\" value=\"" + ajaxToken + "\">" + //阿里云oss的上传token
                    "<label>" + imageLang.alt + "</label>" +
                    "<input type=\"text\" value=\"" + selection + "\" data-alt />" +
                    "<br/>" +
                    "<label>" + imageLang.link + "</label>" +
                    "<input type=\"text\" value=\"https://\" data-link />" +
                    "<br/>" +
                    ((settings.imageUpload) ? "</form>" : "</div>");

                dialog = this.createDialog({
                    title: imageLang.title,
                    width: (settings.imageUpload) ? 465 : 380,
                    height: 254,
                    name: dialogName,
                    content: dialogContent,
                    mask: settings.dialogShowMask,
                    drag: settings.dialogDraggable,
                    lockScreen: settings.dialogLockScreen,
                    maskStyle: {
                        opacity: settings.dialogMaskOpacity,
                        backgroundColor: settings.dialogMaskBgColor
                    },
                    buttons: {
                        enter: [lang.buttons.enter, function () {
                            var url = this.find("[data-url]").val();
                            var alt = this.find("[data-alt]").val();
                            var link = this.find("[data-link]").val();

                            if (url === "") {
                                alert(imageLang.imageURLEmpty);
                                return false;
                            }

                            var altAttr = (alt !== "") ? " \"" + alt + "\"" : "";

                            if (link === "" || link === "https://") {
                                cm.replaceSelection("![" + alt + "](" + url + altAttr + ")");
                            } else {
                                cm.replaceSelection("[![" + alt + "](" + url + altAttr + ")](" + link + altAttr + ")");
                            }

                            if (alt === "") {
                                cm.setCursor(cursor.line, cursor.ch + 2);
                            }

                            this.hide().lockScreen(false).hideMask();

                            return false;
                        }],

                        cancel: [lang.buttons.cancel, function () {
                            this.hide().lockScreen(false).hideMask();

                            return false;
                        }]
                    }
                });

                dialog.attr("id", classPrefix + "image-dialog-" + guid);

                if (!settings.imageUpload) {
                    return;
                }

                var fileInput = dialog.find("[name=\"file\"]");

                var file = document.getElementById("file");

                var submitHandler = function () {
                    $.ajax({
                        url: settings.aliyunTokenUrl,
                        type: "POST",
                        dataType: "json", //json 还是jsonp看情况
                        timeout: 2000,
                        async: true,
                        cache: false,
                        contentType: "false",
                        processData: false,
                        beforeSend: function () {
                            loading(true);
                        },
                        success: function (result) {
                            if (result) {
                                ajaxToken = result;

                                dialog.find("[name=\"token\"]").val(ajaxToken);

                                var current_time = Date.parse(new Date());//获取当前时间
                                current_time /= 1000; // gmt 时间精确到秒即可

                                var formData = new FormData();
                                formData.append('OSSAccessKeyId', ajaxToken['accessid']);
                                formData.append('policy', ajaxToken['policy']);
                                formData.append('Signature', ajaxToken['signature']);
                                formData.append('key', 'dir/' + '[' + current_time + ']' + file.files[0].name); //文件名保存为当前时间戳+文件名
                                formData.append('success_action_status', 200); // 指定返回的状态码
                                formData.append('callback', ajaxToken['callback']);
                                formData.append("file", file.files[0]); //file 必须是最后一个域
                                dialog.find("[name=\"token\"]").val(); //隐藏令牌
                                $.ajax({
                                    url: ajaxToken['host'],
                                    type: 'POST',
                                    data: formData,
                                    dataType: "json",
                                    beforeSend: function () {
                                        loading(true);
                                    },
                                    cache: false,
                                    processData: false, //不需要进行序列化处理
                                    async: true, //发送同步请求
                                    contentType: false,
                                    success: function (result) {
                                        dialog.find("[data-url]").val(result.url);
                                    },
                                    error: function () {
                                        alert("上传超时");
                                    },
                                    complete: function () {
                                        loading(false);
                                    }
                                });
                            }
                        }
                    });
                };

                dialog.find("[type=\"submit\"]").bind("click", submitHandler);

                fileInput.bind("change", function () {
                    var fileName = fileInput.val();
                    var isImage = new RegExp("(\\.(" + settings.imageFormats.join("|") + "))$"); // /(\.(webp|jpg|jpeg|gif|bmp|png))$/

                    if (fileName === "") {
                        alert(imageLang.uploadFileEmpty);

                        return false;
                    }

                    if (!isImage.test(fileName)) {
                        alert(imageLang.formatNotAllowed + settings.imageFormats.join(", "));
                        return false;
                    }

                    dialog.find("[type=\"submit\"]").trigger("click");
                });
            }

            dialog = editor.find("." + dialogName);
            dialog.find("[type=\"text\"]").val("");
            dialog.find("[type=\"file\"]").val("");
            dialog.find("[data-link]").val("https://");

            this.dialogShowMask(dialog);
            this.dialogLockScreen();
            dialog.show();

        };

    };

    // CommonJS/Node.js
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        module.exports = factory;
    } else if (typeof define === "function") // AMD/CMD/Sea.js
    {
        if (define.amd) { // for Require.js

            define(["editormd"], function (editormd) {
                factory(editormd);
            });

        } else { // for Sea.js
            define(function (require) {
                var editormd = require("./../../editormd");
                factory(editormd);
            });
        }
    } else {
        factory(window.editormd);
    }

})();