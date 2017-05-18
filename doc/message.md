#通讯协议
##前提和说明
1. C = E(K, P)表示用K加密明文P得到密文C
2. P = D(K, C)表示用K解密密文C的到明文P
3. H = HASH(O)表示O的哈希值存到H中
4. 报文中若包含hash字段，接收方则会自动进行报文完整性验证
5. 报文中若包含timestamp字段，接收方则会自动进行时间戳验证，具体方法如下：
	初始化时间戳为0
	每受到一个报文，则比较该报文时间戳是否大于当前时间戳
	更新当前时间戳为报文中的时间戳
3. 通讯中packet变量表示通讯对方发过来的消息报文
4. client本地存储server的证书信息，并且client默认信任改证书
##Login
###消息类型
1. client login请求消息
2. server login回复消息
3. client login-ack请求消息
4. server login-ack回复消息
###消息格式和通讯过程
1. client login请求消息:
```json
username: <username>
challenge: E(PU(server), <challenge>)
timestamp: <NOW>
hash: HASH(this)
```
client 产生一个随机数<challenge>，并用server的公钥加密。为了保证通讯性能整个消息不加密。
2. server login回复消息:
<username> = packet.username
CH = packet.challenge()
```json
username: <username>
key: E(PU(clientA), <session-key>)
challenge_response: E(<session-key>, D(PR(server), CH)+1)
challenge: E(PU(clientA), <challenge>)
timestamp: <NOW>
hash: HASH(this)
```
server收到client的登陆请求后，先用自己的私钥解密client的challenge，并生成相应的回应。server生成一个随机的会话密钥，通过存在数据库中的client公钥加密。server产生一个challenge用client的公钥加密，这一步多余。为了保证通讯性能整个消息不加密。
3. client login-ack请求消息
key = packet.key
challenge_response = packet.challenge_response
CH = packet.challenge
<session-key> = D(PR(clientA), key)
```json
username: <username>
challenge_response: E(<session-key>, D(<session-key>, CH)+1)
timestamp: <NOW>
hash: HASH(this)
```
client首先检测server是否通过challenge，如果不通过直接结束此次通讯。
此后client会记录下此次通讯的会话密钥，并回复server的challenge
4. server login-ack回复消息
server用对应client的会话密钥解密challenge，认证client身份。
##Register
由于register过程需要将用户的公开身份与聊天服务器中的身份进行绑定。鉴于用户公开身份是邮箱地址形式提供，server会在收到用户注册请求的时候向用户提供的邮箱发送包含验证码的邮件，用户需要提供正确的验证码才能完成注册，验证码具有时效性，并且在一次错误尝试后失效。
###消息类型
1. register请求消息
2. register-ack请求和回复消息
###消息格式和通讯过程
1. register请求消息
```json
email: <foo@bar.com>
username: <username>
pubkey: <pubkey>
timestamp: <NOW>
hash: HASH(this)
```
消息用server的公钥加密。
server收到注册请求后，会先在数据库中查找是否用户名冲突，如果冲突，则回复失败消息。否则，server回向用户提供的邮箱发送验证码。
2. register-ack请求和回复消息
<vcode>从邮箱中获取
```json
email: <email>
vcode: <vcode>
timestamp: <NOW>
hash: HASH(this)
```
消息用server的公钥加密。
server收到register-ack消息后，检查vcode是否正确。
##Friend
###消息类型
1. friend请求和回复消息
###消息格式
```json
# 请求消息
sender: <sender>
receiver: <receiver>
type: <type>  # (q)uery, (a)ccept, (d)eny, (l)ist
timestamp: <NOW>
hash: HASH(this)
```
消息用会话密钥加密。
```json
# 回复消息：回复消息将会发送给请求消息中指定的接收方
sender: <sender>
receiver: <receiver>
type: <type>  # (q)uery, (a)ccept, (d)eny, (l)ist
timestamp: <NOW>
hash: HASH(this)
```
消息用会话密钥加密。
###通讯过程
server接收到client的好友请求时，会先判断sender字段和receiver字段的合法性。
query类型：sender和receiver必须是不同client主体，并且sender和receiver不能已经是好友
accept：sender和receiver必须是不同client主体，并且在receiver对应的会话中有发给sender的query历史消息
deny：sender和receiver必须是不同client主体
list类型：sender和receiver必须都是当前会话client
接着server将解密后的报文用receiver的会话密钥加密并发给receiver
##Chat
###消息类型
1. chat请求消息
###消息格式
```json
sender: <sender>
receiver: <receiver>
content: <content>
timestamp: <NOW>
hash: HASH(this)
```
消息用会话密钥加密。
###通讯过程
client将chat消息发送给server，server根据receiver字段找到接收方，并将解密后的消息用接收方会话密钥加密，发送给接收方。接收方收到消息。
##File
###消息类型
###消息格式
```json
sender: <sender>
receiver: <receiver>
filename: <filename>
data: <data>
signature: <signature>
timestamp: <NOW>
hash: HASH(this)
```
消息用会话密钥加密。
###通讯过程
类似于chat消息，server负责解密并转发