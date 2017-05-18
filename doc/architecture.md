#Overview
整个项目用javascript完成，数据库用的是MongoDB，http服务器用的是Express，后端基于NodeJS，通信用的是socket.io。由于客户端是基于web的，所以支持包括移动端，PC端等常用设备，当然也支持安卓设备。
Demo服务器可以通过校内网访问http://10.131.251.231:3000 测试。
#Front-End Architecture

## 用户界面

前端用户界面部分采用HTML编写，可以通过浏览器访问，具体实现见index.html

通过jquery操作DOM实现消息显示，具体见client.js

## 与后端通信

通过socket.io-client模块，实现客户端与服务器的端到端通信，具体见client.js

## 模块打包

前端所需的JS模块通过webpack加载并打包成bundle.js供客户端浏览器使用。

## 加密解密

用NodeJS的crypto和node-rsa模块，与后端相同。

#Back-End Architecture
##数据库
由db.js提供访问接口。
server在启动时将数据库信息load到内存中。
server在关闭时将修改写会数据库。
##HTTP服务器
用NodeJS的Express模块，具体实现见server.js
##端到端通信
用NodeJS的socket.io模块，具体实现见server.js
通信协议的实现server端见server.js，client端见client_util.js
##加密解密
用NodeJS的crypto和node-rsa模块，具体实现见cipher.js和decipher.js
##Email
用NodeJS的emailjs模块，具体实现见email_util.js