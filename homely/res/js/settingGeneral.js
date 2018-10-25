const SettingGeneral = function(general) {
  this.general = general;
};

SettingGeneral.prototype = {
  init(){

  },
  // 打开设置面板时，初始化设置面板的一些值
  populate(){
    $("#settings-general-title").val(this.general["title"]);
    // 小部件
    // --------时钟
    $("#settings-general-clock-show").prop("checked", this.general["clock"].show);
    $("#settings-general-clock-twentyfour").prop("checked", this.general["clock"].twentyfour)
      .prop("disabled", !this.general["clock"].show)
      .parent().toggleClass("text-muted", !this.general["clock"].show);
    $("#settings-general-clock-seconds").prop("checked", this.general["clock"].seconds)
      .prop("disabled", !this.general["clock"].show)
      .parent().toggleClass("text-muted", !this.general["clock"].show);
  },

  // 设置面板，点击保存时
  save(){
    // 小部件
    // ----时钟
    this.general["clock"] = {
      show: $("#settings-general-clock-show").prop("checked"),
      twentyfour: $("#settings-general-clock-twentyfour").prop("checked"),
      seconds: $("#settings-general-clock-seconds").prop("checked")
    };
  },
  //  -------------设置title名字
  setTitleName(manifname){
    // manifname为manifest文件中的name值
    if (!$("#settings-general-title").val()) $("#settings-general-title").val(manifname);
    this.general["title"] = $("#settings-general-title").val();
  }

};