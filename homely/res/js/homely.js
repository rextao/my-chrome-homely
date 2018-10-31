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
      // 布局方式，，文件夹式folder，扁平化布局flatten
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
    // special link handling
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
    let weatherCallbacks = [];
    let proxyCallbacks = [];
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
    settingGeneral.initWeather(weatherCallbacks,ajaxPerms);
    settingGeneral.initProxy(proxyCallbacks,ajaxPerms);
    // 设置（样式）
    const settingStyle = new SettingStyle(settings.style);
    settingStyle.init();


    if (firstRun) {
      var alert = $("<div/>").addClass("alert alert-success alert-dismissable");
      alert.append($("<button/>").addClass("close").attr("data-dismiss", "alert").html("&times;").click(function (e) {
        chrome.storage.local.set(settings);
      }));
      alert.append("<span><strong>欢迎来到" + manif.name + "!</strong>");
      $("#alerts").append(alert);
    }
    // switch to links page
    $("#menu-links").click(function (e) {
      $(".navbar-right li").removeClass("active");
      $(this).addClass("active");
      $(".main").hide();
      $("#links").show();
    });

    // image初始化,根据配置的不同，显示不同信息
    switch (settings.style["background"].image) {
      case "":
        $("#settings-style-background-image").prop("placeholder", "(无图模式)");
        break;
      case "../img/bg.png":
        $("#settings-style-background-image").prop("placeholder", "(默认图片)");
        break;
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
    // 点击设置-关于
    $('#about').on("show.bs.modal", function (e) {
      $(".ext-name").text(manif.name);
      $(".ext-ver").text(manif.version);
    });
    /*******************setting 里面checkbox事件绑定**************************/
    settingBookmarks.initEvent();
    settingGeneral.initEvent();
    settingHistory.initEvent();
    settingStyle.initEvent();
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
      // write to local storage
      chrome.storage.local.set(settings, function () {
        if (chrome.runtime.lastError) {
          $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text("Unable to save: " + chrome.runtime.lastError.message));
          $("#settings-save").prop("disabled", false).empty().append(fa("check", false)).append(" Save and reload");
          return;
        }
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
    // import settings from file
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
            return window.alert(file.name + " doesn't seem to be a valid JSON file.");
          }
          if (toImport && confirm("Do you want to replace your current settings with those in " + file.name + "?")) {
            // merge with current, import takes priority
            settings = $.extend(true, {}, settings, toImport);
            // copy links code whole
            if (toImport["links"]) settings["links"] = toImport["links"];
            // write to local storage
            chrome.storage.local.set(settings, function () {
              if (chrome.runtime.lastError) window.alert("Unable to save: " + chrome.runtime.lastError.message);
              else location.reload();
            });
          }
        };
      }
    });
    // export settings to file
    $("#settings-export").click(function (e) {
      var toExport = $.extend(true, {}, settings);
      // converting image to URI takes too long, hangs browser
      delete toExport.style["background"].image;
      // link has a download="homely.json" tag to force download
      $(this).attr("href", "data:application/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(toExport)))
        .click().attr("href", "");
    });
    // links selection state
    var linksHotkeys = {
      curBlk: -1,
      curBtn: -1,
      blk: []
    };
    var mousetrapStop = Mousetrap.stopCallback;
    // setup keyboard shortcuts on tab change
    var setupHotkeys = function setupHotkeys(e) {
      // 关闭任何一个下拉框
      var closeDropdowns = function closeDropdowns() {
        $(".btn-group.open, .dropdown.open").removeClass("open");
        $("#links .panel-heading .btn").hide();
      };
      // number/cycle navigation for links
      var nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
      var off = "panel-" + settings.style["panel"];
      var on = "panel-" + (off === "panel-primary" ? "default" : "primary");
      var linksSelectBlk = function linksSelectBlk(i) {
        $("#links ." + on).removeClass(on).addClass(off);
        linksHotkeys.curBlk = i;
        $("#links :nth-child(" + (linksHotkeys.curBlk + 1) + ") .panel").removeClass(off).addClass(on);
        if (linksHotkeys.curBtn > -1) {
          $(linksHotkeys.blk[linksHotkeys.curBtn]).off("blur");
          $("i", linksHotkeys.blk[linksHotkeys.curBtn]).remove();
        }
        linksHotkeys.blk = $("#links :nth-child(" + (linksHotkeys.curBlk + 1) + ") .panel .panel-body .btn");
        linksSelectBtn(0);
      };
      var linksSelectBtn = function linksSelectBtn(i) {
        if (linksHotkeys.curBtn > -1) {
          $(linksHotkeys.blk[linksHotkeys.curBtn]).off("blur");
          $("i", linksHotkeys.blk[linksHotkeys.curBtn]).remove();
        }
        linksHotkeys.curBtn = i;
        $(linksHotkeys.blk[linksHotkeys.curBtn]).prepend(" ").prepend($("<i/>").addClass("fa fa-hand-o-right")).focus().blur(function (e) {
          $(this).off("blur");
          linksClearSel();
        });
      }
      var linksClearSel = function linksClearSel() {
        $("#links ." + on).removeClass(on).addClass(off);
        if (linksHotkeys.curBtn > -1) $("i", linksHotkeys.blk[linksHotkeys.curBtn]).remove();
        linksHotkeys = {
          curBlk: -1,
          curBtn: -1,
          blk: []
        };
      };
      // 清空mousetrap的全部绑定，主要用于不想刷新页面，切换页面后为绑定不同快捷键使用
      Mousetrap.reset();
      linksClearSel();
      // 如有打开的模态框，绑定一个esc，用于关闭模态框
      var modal = $(document.body).hasClass("modal-open");
      if (modal) {
        Mousetrap.bind("esc", function (e, key) {
          $(".modal.in").modal("hide");
        });
      }
      //
      if (settings.general["keyboard"]) {
        // 全局切换
        if (!modal) {
          if (settings.general["apps"]) {
            Mousetrap.bind("a", function (e, key) {
              if (!$("#apps-title").parent().hasClass("open")) closeDropdowns();
              $("#apps-title").click();
            }).bind("shift+a", function (e, key) {
              chrome.tabs.create({url: "chrome://extensions/"});
            })
          }
          if (settings.history["enable"]) {
            Mousetrap.bind("h", function (e, key) {
              if (!$("#history-title").parent().hasClass("open")) closeDropdowns();
              $("#history-title").click();
            });
          }
          Mousetrap.bind("s", function (e, key) {
            if (!$("#settings-title").parent().hasClass("open")) closeDropdowns();
            $("#settings-title").click();
          }).bind("s 1", function (e, key) {
            closeDropdowns();
            $("#settings-toggle").click();
          }).bind("s 2", function (e, key) {
            closeDropdowns();
            $("#settings-import").click();
          }).bind("s 3", function (e, key) {
            closeDropdowns();
            $("#settings-export").click();
          }).bind("s 4", function (e, key) {
            closeDropdowns();
            $("#about-toggle").click();
          }).bind("?", function (e, key) {
            $("#shortcuts").modal();
          }).bind("esc", function (e, key) {
            closeDropdowns();
          });
        }
        // 设置-个性化模态框打开
        if ($(e.target).attr("id") === "settings" && e.type === "show") {
          Mousetrap.bind("tab", function (e, key) {
            var sel = $("#settings-tabs li.active").index();
            sel = (sel + (key === "tab" ? 1 : -1)) % $("#settings-tabs li").length;
            if (sel < 0) sel += $("#settings-tabs li").length;
            $($("#settings-tabs a")[sel]).click();
            e.preventDefault();
          }).bind("ctrl+enter", function (e, key) {
            $("#settings-save").click();
          });
          // override stop callback to pause on button focus
          Mousetrap.stopCallback = function (e, element) {
            return element.tagName === "BUTTON" || mousetrapStop(e, element);
          }
          // 快捷键模态框可以使用shift+/关闭
        } else if ($(e.target).attr("id") === "shortcuts" && e.type === "show") {
          Mousetrap.bind("?", function (e, key) {
            $("#shortcuts").modal("hide");
          });
          // 其他，分别绑定链接、书签页面的快捷键
        } else {
          // restore stop callback
          Mousetrap.stopCallback = mousetrapStop;
          // if links page is active
          if ($("nav li.active").attr("id") === "menu-links" || settings.bookmarks["merge"]) {
            Mousetrap.bind(nums, function (e, key) {
              closeDropdowns();
              // select block by number
              linksSelectBlk(nums.indexOf(key));
            }).bind(["-", "="], function (e, key) {
              closeDropdowns();
              // previous/next block
              var i = (linksHotkeys.curBlk === -1 ? 0 : (linksHotkeys.curBlk + (key === "-" ? -1 : 1)) % $("#links .panel").length);
              if (i < 0) i += $("#links .panel").length;
              linksSelectBlk(i);
            }).bind(["[", "]"], function (e, key) {
              closeDropdowns();
              // previous/next button
              if (linksHotkeys.curBlk === -1) linksSelectBlk(0);
              var i = (linksHotkeys.curBtn === -1 ? 0 : (linksHotkeys.curBtn + (key === "[" ? -1 : 1)) % linksHotkeys.blk.length);
              if (i < 0) i += linksHotkeys.blk.length;
              linksSelectBtn(i);
            }).bind("enter", function (e, key) {
              // clear selection
              setTimeout(linksClearSel, 50);
            }).bind("backspace", function (e, key) {
              // clear selection and lose focus
              if (linksHotkeys.curBtn > -1) $(linksHotkeys.blk[linksHotkeys.curBtn]).blur();
            });
          }
          // if bookmarks page is active
          if ($("nav li.active").attr("id") === "menu-bookmarks" || settings.bookmarks["merge"]) {
            Mousetrap.bind("/", function (e, key) {
              $("#bookmarks-search").focus();
              e.preventDefault();
            });
          }
        }
      }
    };
    $("#menu-links").click(setupHotkeys);
    if (settings.style["topbar"].labels) {
      $(".menu-label").show();
    } else {
      $(".menu-label").each(function (i) {
        $(this).parent().attr("title", $(this).text());
      });
    }
    ;
    bookmarksCallbacks.push(function () {
      $("#menu-bookmarks").click(setupHotkeys);
      var label = $("#menu-bookmarks .menu-label");
      if (settings.style["topbar"].labels) {
        label.show();
      } else {
        label.parent().attr("title", label.text());
      }
    });
    weatherCallbacks.push(function () {
      if (settings.style["topbar"].labels) $("#menu-weather .menu-label").show();
    });
    proxyCallbacks.push(function () {
      var label = $("#menu-proxy .menu-label");
      if (settings.style["topbar"].labels) {
        label.show();
      } else {
        label.parent().attr("title", label.text());
      }
    });
    // manually adjust modal-open class as not available at event trigger
    $(".modal").on("show.bs.modal", function (e) {
      $(document.body).addClass("modal-open");
      setupHotkeys(e);
    }).on("hidden.bs.modal", function (e) {
      $(document.body).removeClass("modal-open");
      setupHotkeys(e);
    });
    if (settings.bookmarks["merge"]) {
      setupHotkeys({});
      // show both links and bookmarks, hide switch links
      $("#menu-links, #menu-bookmarks").hide();
      $(document.body).addClass("merge");
    } else {
      // open on links page
      $("#menu-links").click();
    }
    // show incognito state
    if (chrome.extension.inIncognitoContext) $(".incognito").removeClass("incognito");
    // fade in once all is loaded
    $(document.body).fadeIn();
  });
});
