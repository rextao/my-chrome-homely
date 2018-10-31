# Fork Homely
1. github:https://github.com/OllieTerrance/Homely
2. chrome商店：https://chrome.google.com/webstore/detail/homely/fplghnonomhbnlhdnmjpipoomkjdpeim
3. ![app](https://github.com/rextao/my-chrome-homely/blob/master/img/appimg.png)
# json
1. homely.json为书签备份

# 注意
1. 新改写的文件用了es6语法，未做编译，需要在高版本chrome下运行chrome>=69.0
# 备注
1. 谷歌开发插件文档：https://developer.chrome.com/extensions/overview
1. 可以通过原作者notice与basket，看看怎么获取通知和购物车信息（此功能未测试）
1. 链接：
    - prompt的返回值为输入框输入的内容
1. 样式：
    - 如何获取chrome字体：chrome.fontSettings.getFontList
    - bootstrap利用radio实现的颜色面板选择器
    - jQuery利用prop控制复选框.prop("checked", true);
    - 自定义css，即是将css.val()后添加到style中，然后append到head
1. 通用：
    - chrome.runtime.getManifest()：返回文件manifest详细信息
    - 根据官网api控制扩展
    - 提供一个外网api，可以获取天气与ip，利用ajax请求数据
    - #settings-general-weather-celsius，切换符号，利用的三元表达式，实现一行代码切换文字
    - 快捷键插件mousetrap，6年不更新了。
1. 历史：
    - 直接使用input,type=range实现简单的控制条
1. 书签：
    - 注意toggleClass，有第二个参数，规定是移除还是添加样式
    - 提供访问chrome://extensions/的方式 ，用a标签不行，需要使用chrome.tabs.create或chrome.tabs.update