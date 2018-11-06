/**
 * 主要是设置-样式的操作（无事件绑定）
 * @User: rextao
 * @Date: 2018/10/26
 */
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
    // 字体获取没有再打开setting设置面板时获取，避免获取太慢
    const that = this;
    chrome.fontSettings.getFontList(function fontsCallback(fonts) {
      for (var i in fonts) {
        $("#settings-style-font").append($("<option/>").text(fonts[i].displayName));
      }
      $("#settings-style-font").val(that.style["font"]);
    });
    $("body").addClass(this.style["fluid"] ? "container-fluid" : "container");
    if (this.style["topbar"].fix) {
      $("body").addClass("topbar-fix");
      $("nav").addClass("navbar-fixed-top");
      $("#menu-collapse").addClass("collapse navbar-collapse");
      $("#menu-collapse-toggle").show();
    }
    if (this.style["topbar"].dark) {
      $("nav").removeClass("navbar-default").addClass("navbar-inverse");
    }
    // 为页面添加样式，在head中添加style样式
    this.appendStyleToHead();
    // 是否显示topbar右边的文字
    if (this.style["topbar"].labels) {
      $(".menu-label").show();
    } else {
      $(".menu-label").each(function (i) {
        $(this).parent().attr("title", $(this).text());
      });
    }

  },
  // 打开设置面板时，初始化设置面板的一些值
  populate(){
    // 字体
    $("#settings-style-font").val(this.style["font"]);
    // 布局
    // -----流式布局
    $("#settings-style-fluid").prop("checked", this.style["fluid"]);
    $("#settings-style-topbar-fix").prop("checked", this.style["topbar"].fix);
    $("#settings-style-topbar-dark").prop("checked", this.style["topbar"].dark);
    // -----控制顶部导航文字是否显示
    $("#settings-style-topbar-labels").prop("checked", this.style["topbar"].labels);
    // 面板样式
    // -----配色方案
    $("#settings-style-panel label.btn-" + this.style["panel"]).click();
    // 背景
    // 保存时，会使用这个值
    $("#settings-style-background-image").data("val", this.style["background"].image);
    // image初始化,根据配置的不同，显示不同信息
    switch (this.style["background"].image) {
      case "":
        $("#settings-style-background-image").prop("placeholder", "(无图模式)");
        break;
      case "../img/bg.png":
        $("#settings-style-background-image").prop("placeholder", "(默认图片)");
        break;
      default:
        // 使用this.style["background"].image会有卡顿
        $("#settings-style-background-image").prop("placeholder", 'data:image/jpeg;base64....');
    }
    $("#settings-style-background-repeat").prop("checked", this.style["background"].repeat);
    $("#settings-style-background-centre").prop("checked", this.style["background"].centre);
    $("#settings-style-background-fixed").prop("checked", this.style["background"].fixed);
    $("#settings-style-background-stretch").prop("checked", this.style["background"].stretch);
    // -----检查input输入框的img是否符合规则
    $(".settings-style-background-check").prop("disabled", !this.style["background"].image)
      .next().toggleClass("text-muted", !this.style["background"].image);
    // 自定义css
    $("#settings-style-customcss-enable").prop("checked", this.style["customcss"].enable);
    $("#settings-style-customcss-content").prop("disabled", !this.style["customcss"].enable).val(this.style["customcss"].content);
  },
  // 设置面板，点击保存时
  save(){
    this.style["font"] = $("#settings-style-font").val();
    // fluid与topbar，主要利用bootstrap，增加样式，改变布局的特性
    this.style["fluid"] = $("#settings-style-fluid").prop("checked");
    this.style["topbar"] = {
      fix: $("#settings-style-topbar-fix").prop("checked"),
      dark: $("#settings-style-topbar-dark").prop("checked"),
      labels: $("#settings-style-topbar-labels").prop("checked")
    };

    this.style["panel"] = $("#settings-style-panel label.active input").val();
    this.style["background"] = {
      image: $("#settings-style-background-image").val() ? $("#settings-style-background-image").val() : $("#settings-style-background-image").data("val"),
      repeat: $("#settings-style-background-repeat").prop("checked"),
      centre: $("#settings-style-background-centre").prop("checked"),
      fixed: $("#settings-style-background-fixed").prop("checked"),
      stretch: $("#settings-style-background-stretch").prop("checked")
    };
    this.style["customcss"] = {
      enable: $("#settings-style-customcss-content").val() && $("#settings-style-customcss-enable").prop("checked"),
      content: $("#settings-style-customcss-content").val()
    };
  },
  initEvent(){
    // panel style group
    $("#settings-style-panel label").click(function (e) {
      $("input", this).prop("checked", true);
    });
    // background image selector
    $("#settings-style-background-image").on("input change", function (e) {
      // lose previous value on change
      $(this).data("val", "").prop("placeholder", "(none)");
      $(".settings-style-background-check").prop("disabled", !$(this).val()).next().toggleClass("text-muted", !$(this).val());
    });
    /***********************setting-style-background下拉框****************************************************************/
    $("#settings-style-background-choose").click(function (e) {
      // trigger hidden input field
      $("#settings-alerts").empty();
      $("#settings-style-background-file").click();
    });
    $("#settings-style-background-file").change(function (e) {
      // if a file is selected
      if (this.files.length) {
        var file = this.files.item(0);
        // if an image
        if (file.type.match(/^image\//)) {
          var reader = new FileReader;
          reader.readAsDataURL(file);
          reader.onload = function readerLoaded() {
            $("#settings-style-background-image").data("val", reader.result).prop("placeholder", file.name).val("");
            $("#settings-style-background-file").val("");
          };
        } else {
          $("#settings-alerts").empty().append($("<div/>").addClass("alert alert-danger")
            .text(file.name + " doesn't seem to be a valid image file."));
        }
      }
    });
    // clear image
    $("#settings-style-background-none").click(function (e) {
      $("#settings-style-background-image").data("val", "").prop("placeholder", "(none)").val("");
      $(".settings-style-background-check").prop("disabled", true).next().addClass("text-muted");
    });

    // reset to default stripes
    $("#settings-style-background-default").click(function (e) {
      $("#settings-style-background-image").data("val", "../img/bg.png").prop("placeholder", "(default)").val("");
      $("#settings-style-background-repeat").prop("checked", false);
      $("#settings-style-background-centre").prop("checked", true);
      $("#settings-style-background-fixed").prop("checked", false);
      $("#settings-style-background-stretch").prop("checked", true);
      $(".settings-style-background-check").prop("disabled", false).next().removeClass("text-muted");
    });
    // custom CSS editor
    $("#settings-style-customcss-enable").change(function (e) {
      $("#settings-style-customcss-content").prop("disabled", !$(this).prop("checked")).focus();
    });
  },
  // 为页面添加样式，在head中添加style样式
  appendStyleToHead(){
    const css = [];
    if (this.style["font"]) {
      css.push("* {\n"
        + "    font-family: '" + this.style["font"] + "';\n"
        + "}");
    }
    if (this.style["background"].image) {
      css.push("html {\n"
        + "    background-image: url(" + this.style["background"].image + ");\n"
        + "    background-repeat: " + (this.style["background"].repeat ? "" : "no-") + "repeat;\n"
        + "    background-position: " + (this.style["background"].centre ? "center" : "initial") + ";\n"
        + "    background-attachment: " + (this.style["background"].fixed ? "fixed" : "initial") + ";\n"
        + "    background-size: " + (this.style["background"].stretch ? "cover" : "auto") + ";\n"
        + "}");
    }
    if (css.length) {
      $(document.head).append($("<style/>").html(css.join("\n")));
    }
    // 自定义css
    if (this.style["customcss"].enable) {
      $(document.head).append($("<style/>").html(this.style["customcss"].content));
    }
  }
};
