const SettingStyle = function (style) {
  this.style = style;

};
/**
 * init方法：页面启动运行加载
 * pupulate方法：主要是打开设置面板时，初始化设置面板的一些值
 * save方法：为setting面板打开后，点击保存时调用
 */
SettingStyle.prototype = {

  init(){
    // 初始化字体
    this.fontInit();
  },
  populate(){
    this.fontPopulate();
  },
  save(){
    this.fontSave();
  },
  // 字体处理：settings.style["font"]
  fontInit(){
    // 字体获取没有再打开setting设置面板时获取，避免获取太慢
    const that = this;
    chrome.fontSettings.getFontList(function fontsCallback(fonts) {
      for (var i in fonts) {
        $("#settings-style-font").append($("<option/>").text(fonts[i].displayName));
      }
      $("#settings-style-font").val(that.style["font"]);
    });
  },
  fontSave(){
    this.style["font"] = $("#settings-style-font").val();
  },
  fontPopulate(){
    $("#settings-style-font").val(this.style["font"]);
  }
};
