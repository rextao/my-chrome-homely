$(document).ready(function () {
  // helper methods
  var fa = function fa(icon, fw) {
    return $("<i/>").addClass("fa fa-" + icon).toggleClass("fa-fw", fw !== false);
  }
  var manif = chrome.runtime.getManifest();
  // 默认设置
  var settings = {
    // 链接
    "links": {
      // 模块控制
      "edit": {
        "menu": true,
        "dragdrop": true
      },
      // 行为
      "behaviour": {
        "dropdownmiddle": false
      },
      // 默认页面内容
      "content": [
        {
          "title": "Chrome",
          "buttons": [
            {
              "title": "Web Store",
              "url": "https://chrome.google.com/webstore",
              "style": "primary"
            },
            {
              "title": "Settings",
              "menu": [
                {
                  "title": "Settings",
                  "url": "chrome://settings"
                },
                {
                  "title": "Extensions",
                  "url": "chrome://extensions"
                },
                {
                  "title": "Flags",
                  "url": "chrome://flags"
                }
              ],
              "style": "light"
            },
            {
              "title": "Content",
              "menu": [
                {
                  "title": "Apps",
                  "url": "chrome://apps"
                },
                {
                  "title": "Bookmarks",
                  "url": "chrome://bookmarks"
                },
                {
                  "title": "Downloads",
                  "url": "chrome://downloads"
                },
                {
                  "title": "History",
                  "url": "chrome://history"
                }
              ],
              "style": "default"
            }
          ]
        },
        {
          "title": "Storage",
          "buttons": [
            {
              "title": "Dropbox",
              "url": "https://www.dropbox.com",
              "style": "info"
            },
            {
              "title": "Google Drive",
              "url": "https://drive.google.com",
              "style": "warning"
            },
            {
              "title": "OneDrive",
              "url": "https://onedrive.live.com",
              "style": "primary"
            }
          ]
        },
        {
          "title": "Social",
          "buttons": [
            {
              "title": "Facebook",
              "url": "https://www.facebook.com",
              "style": "primary"
            },
            {
              "title": "Twitter",
              "menu": [
                {
                  "title": "Twitter",
                  "url": "https://twitter.com"
                },
                {
                  "title": "TweetDeck",
                  "url": "https://tweetdeck.twitter.com"
                }
              ],
              "style": "info"
            },
            {
              "title": "Google+",
              "url": "https://plus.google.com",
              "style": "danger"
            }
          ]
        },
        {
          "title": "Tips",
          "buttons": [
            {
              "title": "Lifehacker",
              "url": "http://lifehacker.com",
              "style": "success"
            },
            {
              "title": "AddictiveTips",
              "url": "http://www.addictivetips.com",
              "style": "primary"
            },
            {
              "title": "How-To Geek",
              "url": "http://www.howtogeek.com",
              "style": "dark"
            }
          ]
        }
      ]
    },
    "bookmarks": {
      "enable": false,
      // 双书签模式，dial与扁平化书签都显示
      "double":true,
      // 布局方式，，文件夹式folder，扁平化布局flatten，拨号式dial
      "layout":"flatten",
      "bookmarklets": true,
      "foldercontents": true,
      "split": false,
      "merge": false,
      "above": false
    },
    "history": {
      "enable": false,
      "limit": 10
    },
    "general": {
      "title": manif.name,
      "keyboard": false,
      "clock": {
        "show": true,
        "twentyfour": true,
        "seconds": true
      },
      "timer": {
        "stopwatch": false,
        "countdown": false,
        "beep": true
      },
      "notepad": {
        "show": false,
        "content": ""
      },
      "apps": false,
      "weather": {
        "show": true,
        "location": "Beijing",
        "celsius": true
      },
      "proxy": false
    },
    "style": {
      "font": "Segoe UI",
      "fluid": false,
      "topbar": {
        "fix": false,
        "dark": false,
        "labels": true
      },
      "panel": "default",
      // setting-style-background下拉框重置默认，需要在#settings-style-background-default的点击事件中更改
      // 因为如下值会因为页面选择而改变
      "background": {
        "image": "../img/bg.png",
        "repeat": false,
        "centre": true,
        "fixed": false,
        "stretch": true
      },
      "customcss": {
        "enable": false,
        "content": ""
      }
    }
  };
  // required permissions
  var ajaxPerms = {
    "ticktick": ["https://ticktick.com/"],
    "weather": ["http://api.openweathermap.org/"],
    "proxy": ["http://www.whatismyproxy.com/"]
  };
  // load settings
  chrome.storage.local.get(function (store) {
    var firstRun = $.isEmptyObject(store);
    // load links first
    if (!firstRun) settings.links.content = store.links.content;
    // merge settings with defaults
    settings = $.extend(true, {}, settings, store);
    // apply custom styles
    document.title = settings.general["title"];
    // 监控ctrl以及，可以使chrome://开头链接正常打开
    var ctrlDown = false;
    $(window).keydown(function (e) {
      if (e.keyCode === 17) ctrlDown = true;
    }).keyup(function (e) {
      if (e.keyCode === 17) ctrlDown = false;
    });
    // 处理链接是chrome://这样的
    var fixLinkHandling = function fixLinkHandling(context) {
      // open Chrome links via Tabs API
      $(".link-chrome", context).off("click").click(function (e) {
        // normal click, not external
        if (e.which === 1 && !ctrlDown && !$(this).hasClass("link-external")) {
          chrome.tabs.update({url: this.href});
          e.preventDefault();
          // middle click, Ctrl+click, or set as external
        } else if (e.which <= 2) {
          chrome.tabs.create({url: this.href, active: $(this).hasClass("link-external")});
          e.preventDefault();
        }
      });
      // always open external links in a new tab
      $(".link-external", context).off("click").click(function (e) {
        if (!$(this).hasClass("link-chrome")) {
          chrome.tabs.create({url: this.href, active: true});
          e.preventDefault();
        }
      });
    };
    /***********************setting 初始化*********************************/
    /******************* 运行init函数，初始化页面开始需要的内容**************/
    /******************有些功能需要根据setting里配置的值来确定如何初始化******/
    let bookmarksCallbacks = [];
    // 链接
    const settingLinks = new SettingLinks(settings.links, settings, fixLinkHandling);
    settingLinks.init();
    // links中编辑完模块，需要重新渲染页面即需要调用settingLinks.initLink
    const links = new Links(settings.links, settings, settingLinks);
    links.init();
    // 设置（书签）
    const settingBookmarks = new SettingBookmarks(settings, bookmarksCallbacks);
    settingBookmarks.init(settings.links);
    // 设置（历史）
    const settingHistory = new SettingHistory(settings.history);
    settingHistory.init(fixLinkHandling);
    // 设置（通用）
    const settingGeneral = new SettingGeneral(settings.general, settings, ajaxPerms);
    settingGeneral.init();
    settingGeneral.initExtensions(fixLinkHandling);
    // 设置（样式）
    const settingStyle = new SettingStyle(settings.style);
    settingStyle.init();
    /***********************第一次运行*********************************/
    if (firstRun) {
      var alert = $("<div/>").addClass("alert alert-success alert-dismissable");
      alert.append($("<button/>").addClass("close").attr("data-dismiss", "alert").html("&times;").click(function (e) {
        chrome.storage.local.set(settings);
      }));
      alert.append("<span><strong>欢迎来到" + manif.name + "!</strong>");
      $("#alerts").append(alert);
    }
    /*******************点击-设置-下拉框，个性化、关于等按钮事件*******************/
    /*******************show.bs.modal打开模态框后，配置一些信息**************************/
    // 点击设置-个性化，进行填充设置
    $("#settings").on("show.bs.modal", function (e) {
      $("#settings-alerts").empty();
      $(".form-group", "#settings-tab-links").removeClass("has-success has-error");
      $("#settings-style-panel label.active").removeClass("active");
      settingLinks.populate();
      settingBookmarks.populate();
      settingHistory.populate();
      settingGeneral.populate();
      settingStyle.populate();
      // 默认显示在第一个（链接）
      $($("#settings-tabs a")[0]).click();
    });
    // 导入
    $("#settings-import").click(function (e) {
      $("#settings-import-file").click();
    });
    $("#settings-import-file").change(function (e) {
      // if a file is selected
      if (this.files.length) {
        var file = this.files.item(0);
        var reader = new FileReader;
        reader.readAsText(file);
        reader.onload = function readerLoaded() {
          $("#settings-import-file").val("");
          var toImport;
          try {
            toImport = JSON.parse(reader.result);
          } catch (e) {
            return window.alert(file.name + " 好像不是一个json文件");
          }
          if (toImport && confirm("你是否想用" + file.name + "代替当前配置?")) {
            // merge with current, import takes priority
            settings = $.extend(true, {}, settings, toImport);
            // copy links code whole
            if (toImport["links"]) settings["links"] = toImport["links"];
            // write to local storage
            chrome.storage.local.set(settings, function () {
              if (chrome.runtime.lastError) window.alert("不能保存: " + chrome.runtime.lastError.message);
              else location.reload();
            });
          }
        };
      }
    });
    // 导出
    $("#settings-export").click(function (e) {
      var toExport = $.extend(true, {}, settings);
      // 转换图片为uri浪费时间
      delete toExport.style["background"].image;
      // link has a download="homely.json" tag to force download
      $(this).attr("href", "data:application/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(toExport)))
        .click().attr("href", "");
    });
    // 点击设置-关于
    $('#about').on("show.bs.modal", function (e) {
      $(".ext-name").text(manif.name);
      $(".ext-ver").text(manif.version);
    });
    /*******************setting 模态框点击-保存-按钮**************************/
    $("#settings-save").click(function (e) {
      // 标识是否删除权限失败
      let revokeError = false;
      $("#settings-alerts").empty();
      // 点击按钮显示保存中。。
      $("#settings-save").prop("disabled", true).empty().append(fa("spinner fa-spin", false)).append(" 保存中...");
      // setting链接
      settingLinks.save();
      // setting书签
      revokeError = settingBookmarks.save();
      // setting历史
      revokeError = settingHistory.save();
      // setting通用
      revokeError = settingGeneral.save(manif.name);
      // setting样式
      settingStyle.save();
      $("#settings").on("hide.bs.modal", function (e) {
        e.preventDefault();
      });
      // 写入local storage
      chrome.storage.local.set(settings, function () {
        // 保存错误
        if (chrome.runtime.lastError) {
          $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text("Unable to save: " + chrome.runtime.lastError.message));
          $("#settings-save").prop("disabled", false).empty().append(fa("check", false)).append(" Save and reload");
          return;
        }
        // 存在权限错误
        if (revokeError) {
          $("#settings-alerts").append($("<div/>").addClass("alert alert-warning").text("Failed to revoke permissions: " + chrome.runtime.lastError.message));
        }
        $("#settings-save").empty().append(fa("check", false)).append(" Saved!");
        // reload page
        $("#settings").off("hide.bs.modal").off("hidden.bs.modal").on("hidden.bs.modal", function (e) {
          location.reload();
        });
        setTimeout(function () {
          $("#settings").modal("hide");
        }, 250);
      });
    });

    /*******************setting 里面checkbox事件绑定**************************/
    settingBookmarks.initEvent();
    settingGeneral.initEvent();
    settingHistory.initEvent();
    settingStyle.initEvent();

    /*******************自定义链接、书签的点击事件**************************/
    $("#menu-links").click(function (e) {
      $(".navbar-right li").removeClass("active");
      $(this).addClass("active");
      $(".main").hide();
      $("#links").show();
      settingGeneral.initHotKeys(e);
    });
    bookmarksCallbacks.push(function (bookmarks) {
      $("#menu-bookmarks").click(function (e) {
        settingGeneral.initHotKeys(e);
      });
      var label = $("#menu-bookmarks .menu-label");
      if (settings.style["topbar"].labels) {
        label.show();
      } else {
        label.parent().attr("title", label.text());
      }
      // 增加一个双书签模式，即根据选项覆盖links内容（效率低下）
      if(settings.bookmarks["double"]){
        bookmarks.layoutDial(6,'links');
        $('#menu-links span').text('快捷书签');
      }
    });

    // 打开模态窗，触发快捷键绑定
    $(".modal").on("show.bs.modal", function (e) {
      $(document.body).addClass("modal-open");
      settingGeneral.initHotKeys(e);
    }).on("hidden.bs.modal", function (e) {
      $(document.body).removeClass("modal-open");
      settingGeneral.initHotKeys(e);
    });
    // 检测chrome隐身状态
    if (chrome.extension.inIncognitoContext) $(".incognito").removeClass("incognito");

    if (settings.bookmarks["merge"]) {
      settingGeneral.initHotKeys({});
      // show both links and bookmarks, hide switch links
      $("#menu-links, #menu-bookmarks").hide();
      $(document.body).addClass("merge");
    } else {
      // open on links page
      $("#menu-links").click();
    }
    // body动画效果
    $(document.body).fadeIn();

  });
});
