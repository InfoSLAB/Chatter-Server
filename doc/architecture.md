#Overview
整个项目用javascript完成，数据库用的是MongoDB，http服务器用的是Express，后段基于NodeJS，通信用的是socket.io。由于客户端是基于web的，所以支持包括移动端，PC端等常用设备，当然也支持安卓设备。
Demo服务器: 可以通过校内网访问http://10.131.251.231:3000 测试。
#Front-End Architecture
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