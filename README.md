# Ioniclub App

[![Join the chat at https://gitter.im/IonicChina/ioniclub](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/IonicChina/ioniclub?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> [http://ionichina.com](http://ionichina.com) Ionichina社区客户端，采用Ionic Framework开发

[![Download on the app store](https://devimages.apple.com.edgekey.net/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg)](https://itunes.apple.com/cn/app/id996999423)

## 快速开始

### 1. 首先安装ionic
    $ sudo npm install -g cordova ionic

### 2. 项目Clone到本地
    $ git clone https://github.com/IonicChina/ioniclub.git

### 3. 添加 android 或 ios 平台
注： 真机调试，浏览器可以跳过此步骤；  
 ios 开发只能在 mac 下进行。
    
    $ cd ioniclub
    $ ionic platform add ios
    $ ionic platform add android

### 4. 添加所有用到的插件

    bower install moment --save
    bower install ngCordova
    bower install angular-moment --save
    bower install angular-resource --save
    cordova plugin add https://github.com/danwilson/google-analytics-plugin.git
    cordova plugin add https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git
    cordova plugin add cordova-plugin-inappbrowser
    cordova plugin add https://github.com/katzer/cordova-plugin-email-composer.git
    cordova plugin add https://github.com/whiteoctober/cordova-plugin-app-version.git
    cordova plugin add cordova-plugin-network-information
    cordova plugin add https://github.com/wildabeast/BarcodeScanner.git
    cordova plugin add https://github.com/VersoSolutions/CordovaClipboard.git

jpush 插件安装参考：[https://github.com/jpush/jpush-phonegap-plugin](https://github.com/jpush/jpush-phonegap-plugin

  注：在添加了BarcodeScanner插件后android 打包会遇到个蛋疼error，解决方案是在platforms/android/build.gradle文件里 `android {}` 结点（243行）添加
  ```lintOptions {
    abortOnError false
}```
[#详情](http://forum.ionicframework.com/t/error-when-running-cordova-build-release-android/25136/4)
### 5. 运行
#### 浏览器
    $  ionic serve
#### ios
    $  ionic build ios
    $  ionic run ios
#### android
    $  ionic build android
    $  ionic run android


## 贡献
[贡献者列表](https://github.com/IonicChina/ioniclub/graphs/contributors)

有任何意见或建议都欢迎提 issue，或者直接在社区 [http://ionichina.com](http://ionichina.com) 提给 [@DongHongfei](http://ionichina.com/user/DongHongfei)

## License
[MIT](LICENSE)
