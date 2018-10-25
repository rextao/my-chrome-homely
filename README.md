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
1. 样式：
    - 如何获取chrome字体：chrome.fontSettings.getFontList
    - bootstrap利用radio实现的颜色面板选择器
    - jQuery利用prop控制复选框.prop("checked", true);
    - 自定义css，即是将css.val()后添加到style中，然后append到head
1. 通用：
    - chrome.runtime.getManifest()：返回文件manifest详细信息