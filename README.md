# angular2club

本地部署方法：

一、部署mongodb:

  1.选择一个盘创建一个文件夹：/data/db;
  
  2.创建一个批处理文件:mongodb.bat,复制下面的内容:
  

    @echo off
    title mongo数据库
    echo 启动mongodb
    pause
    echo 进入根目录
    cd\
    echo 切换到e盘//此处换成你自己mongodb的安装盘
    e:
    echo 进入mongo文件夹
    cd \mongo\bin
    echo 执行mongo程序
    mongod.exe --dbpath e:\data\db
    pause
  
  保存，然后执行此批处理文件
  
  3.创建一个数据库:
  
    打开cmd命令窗口,执行下列命令
    $ cd x:\yourpath\mongo\bin
    $ mongo.exe//执行mongo客户端命令
    $ use admin //切换到admin库
    //创建的一个root用户
    $ db.createUser({
      user:'root',
      pwd:'your password',//填你自己的密码
      roles:['root','dbAdminAnyDatabase']
      })
    
    //创建数据库angular2club
    $ use angular2club
    $ db.createUser({
      user:'angular2club',
      pwd:'parox606',
      roles:['dbAdmin','readWrite']
      })
      
    完成后，关闭刚才的批处理文件窗口，再用文本编辑器打开，在启动mongodb的地方加上下面的参数：
    
      mongod.exe --dbpath e:\data\db --auth
    
    保存后，再次双击启动，现在操作数据库，就需要用权限了;
    
    
二、部署web服务器：
 
  1.安装依赖,打开一个cmd窗口，执行下面命令
  
    $ cd x:\yourpath\angular2club
    $ npm install
  
  2.启动服务器
    
    $ node server.js
    
