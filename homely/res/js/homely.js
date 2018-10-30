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
    /******************* 运行init函数，初始化页面开始需要的内容****************************/
    let bookmarksCallbacks = [];
    let weatherCallbacks = [];
    let proxyCallbacks = [];
    // 链接
    const settingLinks = new SettingLinks(settings.links, settings, fixLinkHandling);
    settingLinks.init();
    // 设置（书签）
    const settingBookmarks = new SettingBookmarks(settings, bookmarksCallbacks);
    settingBookmarks.init();
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


    // generate editor modal
    $("#links-editor").on("show.bs.modal", function (e) {
      var i = $(this).data("block");
      // working copy
      var linkBlk = $.extend(true, {}, settings.links["content"][i]);
      $("#links-editor-title").val(linkBlk.title);
      var populateLinkEditor = function populateLinkEditor(noscroll) {
        // remember scroll position
        var scroll = noscroll ? 0 : document.body.scrollTop;
        $("#links-editor-body").empty();
        if (!linkBlk.buttons.length) {
          $("#links-editor-body").append($("<div/>").addClass("alert alert-info").text("No buttons added yet."));
        }
        // loop through buttons in block
        $(linkBlk.buttons).each(function (j, linkBtn) {
          var blk = $("<div/>").addClass("well well-sm");
          var group = $("<div/>").addClass("input-group form-control-pad-bottom");
          // left menu
          var btnRootLeft = $("<span/>").addClass("input-group-btn");
          var optsBtn = $("<button/>").addClass("btn btn-default dropdown-toggle").attr("data-toggle", "dropdown").append($("<b/>").addClass("caret"));
          btnRootLeft.append(optsBtn);
          var optsMenu = $("<ul/>").addClass("dropdown-menu");
          if (j > 0) {
            optsMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-up")).append(" Move to top").click(function (e) {
              for (var x = j; x > 0; x--) {
                linkBlk.buttons[x] = linkBlk.buttons[x - 1];
              }
              linkBlk.buttons[0] = linkBtn;
              populateLinkEditor();
            })));
            optsMenu.append($("<li/>").append($("<a/>").append(fa("angle-up")).append(" Move up").click(function (e) {
              linkBlk.buttons[j] = linkBlk.buttons[j - 1];
              linkBlk.buttons[j - 1] = linkBtn;
              populateLinkEditor();
            })));
          }
          var max = linkBlk.buttons.length - 1;
          if (j < max) {
            optsMenu.append($("<li/>").append($("<a/>").append(fa("angle-down")).append(" Move down").click(function (e) {
              linkBlk.buttons[j] = linkBlk.buttons[j + 1];
              linkBlk.buttons[j + 1] = linkBtn;
              populateLinkEditor();
            })));
            optsMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-down")).append(" Move to bottom").click(function (e) {
              for (var x = j; x < max; x++) {
                linkBlk.buttons[x] = linkBlk.buttons[x + 1];
              }
              linkBlk.buttons[max] = linkBtn;
              populateLinkEditor();
            })));
          }
          if (j > 0 || j < max) {
            optsMenu.append($("<li/>").addClass("divider"));
          }
          if (linkBtn.menu && linkBtn.menu.length === 1) {
            optsMenu.append($("<li/>").append($("<a/>").append(fa("level-up")).append(" Convert to link").click(function (e) {
              linkBtn.title = linkBtn.menu[0].title;
              linkBtn.url = linkBtn.menu[0].url;
              delete linkBtn.menu;
              populateLinkEditor();
            })));
            optsMenu.append($("<li/>").addClass("divider"));
          } else if (!linkBtn.menu) {
            optsMenu.append($("<li/>").append($("<a/>").append(fa("level-down")).append(" Convert to menu").click(function (e) {
              linkBtn.menu = [
                {
                  title: linkBtn.title,
                  url: linkBtn.url
                }
              ];
              linkBtn.title = "";
              delete linkBtn.url;
              populateLinkEditor();
            })));
            optsMenu.append($("<li/>").addClass("divider"));
          }
          optsMenu.append($("<li/>").append($("<a/>").append(fa("trash-o")).append(" Delete button").click(function (e) {
            if (confirm("Are you sure you want to delete " + (linkBtn.title ? linkBtn.title : "this button") + "?")) {
              linkBlk.buttons.splice(j, 1);
              populateLinkEditor();
            }
          })));
          btnRootLeft.append(optsMenu);
          group.append(btnRootLeft);
          group.append($("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Button label").val(linkBtn.title).change(function (e) {
            linkBtn.title = $(this).val();
          }));
          // right menus
          var btnRootRight = $("<span/>").addClass("input-group-btn");
          if (!linkBtn.style) {
            linkBtn.style = "default";
          }
          var styles = ["default", "light", "dark", "primary", "info", "success", "warning", "danger"];
          var stylePreview = $("<button/>").addClass("btn btn-" + linkBtn.style).html("&nbsp");
          var styleOpts = [];
          stylePreview.click(function (e) {
            stylePreview.detach();
            btnRootRight.append(styleOpts);
          });
          $(styles).each(function (k, style) {
            styleOpts.push($("<button/>").addClass("btn btn-" + style).html("&nbsp;").click(function (e) {
              linkBtn.style = style;
              $(styleOpts).each(function (l, opt) {
                $(opt).detach();
              });
              // remove all button style classes
              stylePreview.removeClass(function (l, css) {
                return (css.match(/\bbtn-\S+/g) || []).join(" ");
              }).addClass("btn-" + styles[k]);
              btnRootRight.append(stylePreview);
            }));
          });
          styleOpts.push($("<button/>").addClass("btn btn-default").append($("<i/>").addClass("fa fa-magic")).click(function (e) {
            var cls = prompt("Enter a class name to apply to the button.\n\nUse the custom CSS box in Settings to add a button style for this name.", "");
            if (!cls) return;
            linkBtn.style = cls;
            if (styles.indexOf(cls) > -1) cls = "btn-" + cls;
            $(styleOpts).each(function (l, opt) {
              $(opt).detach();
            });
            // remove all button style classes
            stylePreview.removeClass(function (l, css) {
              return (css.match(/\bbtn-\S+/g) || []).join(" ");
            }).addClass(cls);
            btnRootRight.append(stylePreview);
          }));
          btnRootRight.append(stylePreview);
          group.append(btnRootRight);
          blk.append(group);
          // link/menu options
          if (linkBtn.menu) {
            var tbody = $("<tbody/>");
            $(linkBtn.menu).each(function (k, linkItem) {
              var tr = $("<tr/>");
              var menuOptsRoot = $("<div/>").addClass("btn-group btn-block");
              menuOptsRoot.append($("<button/>").addClass("btn btn-block btn-default dropdown-toggle").attr("data-toggle", "dropdown").append($("<b/>").addClass("caret")));
              var menuOptsMenu = $("<ul/>").addClass("dropdown-menu");
              if (k > 0) {
                menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-up")).append(" Move to top").click(function (e) {
                  for (var x = k; x > 0; x--) {
                    linkBtn.menu[x] = linkBtn.menu[x - 1];
                  }
                  linkBtn.menu[0] = linkItem;
                  populateLinkEditor();
                })));
                menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("angle-up")).append(" Move up").click(function (e) {
                  linkBtn.menu[k] = linkBtn.menu[k - 1];
                  linkBtn.menu[k - 1] = linkItem;
                  populateLinkEditor();
                })));
              }
              var max = linkBtn.menu.length - 1;
              if (k < max) {
                menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("angle-down")).append(" Move down").click(function (e) {
                  linkBtn.menu[k] = linkBtn.menu[k + 1];
                  linkBtn.menu[k + 1] = linkItem;
                  populateLinkEditor();
                })));
                menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-down")).append(" Move to bottom").click(function (e) {
                  for (var x = k; x < max; x++) {
                    linkBtn.menu[x] = linkBtn.menu[x + 1];
                  }
                  linkBtn.menu[max] = linkItem;
                  populateLinkEditor();
                })));
              }
              if (k > 0 || k < max) {
                menuOptsMenu.append($("<li/>").addClass("divider"));
              }
              menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("trash-o")).append(" Delete item").click(function (e) {
                linkBtn.menu.splice(k, 1);
                populateLinkEditor();
              })));
              menuOptsRoot.append(menuOptsMenu);
              tr.append($("<td/>").append(menuOptsRoot));
              if (typeof(linkItem) === "string") {
                var title = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Section header (leave blank for none)").val(linkItem).change(function (e) {
                  linkBtn.menu[k] = $(this).val();
                });
                tr.append($("<td/>").attr("colspan", 3).append(title));
              } else {
                var title = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Label").val(linkItem.title).change(function (e) {
                  linkItem.title = $(this).val();
                });
                tr.append($("<td/>").append(title));
                var linkGroup = $("<div/>").addClass("input-group");
                var url = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Link URL").val(linkItem.url).change(function (e) {
                  linkItem.url = $(this).val();
                })
                linkGroup.append(url);
                var linkItemRootRight = $("<span/>").addClass("input-group-btn");
                var check = $("<button/>").addClass("btn btn-default dropdown-toggle").attr("data-toggle", "dropdown");
                if (linkItem.external) {
                  check.append(fa("external-link")).append(" New tab");
                } else {
                  check.append(fa("sign-in")).append(" Same tab");
                }
                check.click(function (e) {
                  linkItem.external = !linkItem.external;
                  check.empty();
                  if (linkItem.external) {
                    check.append(fa("external-link")).append(" New tab");
                  } else {
                    check.append(fa("sign-in")).append(" Same tab");
                  }
                });
                linkItemRootRight.append(check);
                linkGroup.append(linkItemRootRight);
                tr.append($("<td/>").append(linkGroup));
              }
              tbody.append(tr);
            });
            blk.append($("<table/>").addClass("table table-bordered table-condensed").append(tbody));
            var menuBtnsRoot = $("<div/>").addClass("btn-group");
            menuBtnsRoot.append($("<button/>").addClass("btn btn-default").append(fa("globe")).append(" Add link").click(function (e) {
              linkBtn.menu.push({
                title: "",
                url: ""
              });
              populateLinkEditor();
            }));
            menuBtnsRoot.append($("<button/>").addClass("btn btn-default").append(fa("indent")).append(" Add section").click(function (e) {
              linkBtn.menu.push("");
              populateLinkEditor();
            }));
            blk.append(menuBtnsRoot);
          } else {
            var linkGroup = $("<div/>").addClass("input-group");
            var url = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Link URL").val(linkBtn.url).change(function (e) {
              linkBtn.url = $(this).val();
            })
            linkGroup.append(url);
            var linkBtnRootRight = $("<span/>").addClass("input-group-btn");
            var check = $("<button/>").addClass("btn btn-default dropdown-toggle").attr("data-toggle", "dropdown");
            if (linkBtn.external) {
              check.append(fa("external-link")).append(" New tab");
            } else {
              check.append(fa("sign-in")).append(" Same tab");
            }
            check.click(function (e) {
              linkBtn.external = !linkBtn.external;
              check.empty();
              if (linkBtn.external) {
                check.append(fa("external-link")).append(" New tab");
              } else {
                check.append(fa("sign-in")).append(" Same tab");
              }
            });
            linkBtnRootRight.append(check);
            linkGroup.append(linkBtnRootRight);
            blk.append(linkGroup);
          }
          $("#links-editor-body").append(blk);
        });
        // reset scroll position
        window.scrollTo(0, scroll);
      };
      // add buttons to block
      $("#links-editor-add-link").click(function (e) {
        linkBlk.buttons.push({
          title: "",
          url: "",
          style: "default"
        });
        populateLinkEditor();
      })
      $("#links-editor-add-menu").click(function (e) {
        linkBlk.buttons.push({
          title: "",
          menu: [],
          style: "default"
        });
        populateLinkEditor();
      })
      // save block
      $("#links-editor-save").click(function (e) {
        linkBlk.title = $("#links-editor-title").val();
        settings.links["content"][i] = linkBlk;
        $("#links-editor").modal("hide");
        populateLinks();
        chrome.storage.local.set({"links": settings.links});
      })
      // delete block
      $("#links-editor-delete").click(function (e) {
        if (confirm("Are you sure you want to delete " + (linkBlk.title ? linkBlk.title : "this block") + "?")) {
          settings.links["content"].splice(i, 1);
          $("#links-editor").modal("hide");
          populateLinks();
          chrome.storage.local.set({"links": settings.links});
        }
      })
      populateLinkEditor(true);
    }).on("hide.bs.modal", function (e) {
      $("#links-editor-add-link, #links-editor-add-menu, #links-editor-save, #links-editor-delete").off("click");
    });
    if (firstRun) {
      var alert = $("<div/>").addClass("alert alert-success alert-dismissable");
      alert.append($("<button/>").addClass("close").attr("data-dismiss", "alert").html("&times;").click(function (e) {
        chrome.storage.local.set(settings);
      }));
      alert.append("<span><strong>Welcome to " + manif.name + "!</strong>  To get you started, here are a few sample blocks for your new New Tab page.  "
        + "Feel free to change or add to them by hovering over the block headings for controls.  "
        + "Head into Settings for more advanced options, where you can add bookmarks, history, apps, widgets, keyboard shortcuts and more.</span>");
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
    $(".ext-name").text(manif.name);
    $(".ext-ver").text(manif.version);
    /*******************初始化设置面板默认信息**************************/
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
      $("#settings-general-keyboard").prop("checked", settings.general["keyboard"]);
      $($("#settings-tabs a")[0]).click();
    });
    /*******************初始化事件绑定**************************/
    settingBookmarks.initEvent();
    settingGeneral.initEvent();
    settingHistory.initEvent();
    settingStyle.initEvent();
    /*******************setting 点击保存按钮**************************/
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

      settings.general["keyboard"] = $("#settings-general-keyboard").prop("checked");

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
      // close any open dropdown menus
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
      // clear current state
      Mousetrap.reset();
      linksClearSel();
      // restore escape to close modal if open
      var modal = $(document.body).hasClass("modal-open");
      if (modal) {
        Mousetrap.bind("esc", function (e, key) {
          $(".modal.in").modal("hide");
        });
      }
      // enable all keyboard shortcuts
      if (settings.general["keyboard"]) {
        // global page switch keys
        if (!modal) {
          if (settings.bookmarks["enable"] && !settings.bookmarks["merge"]) {
            Mousetrap.bind(["l", "q"], function (e, key) {
              closeDropdowns();
              $("#menu-links").click();
            }).bind(["b", "w"], function (e, key) {
              closeDropdowns();
              $("#menu-bookmarks").click();
            });
          }
          if (settings.general["apps"]) {
            Mousetrap.bind(["a", "e"], function (e, key) {
              if (!$("#apps-title").parent().hasClass("open")) closeDropdowns();
              $("#apps-title").click();
            }).bind("shift+a", function (e, key) {
              chrome.tabs.update({url: "chrome://apps"});
            }).bind("shift+alt+a", function (e, key) {
              location.href = "https://chrome.google.com/webstore";
            });
          }
          if (settings.history["enable"]) {
            Mousetrap.bind(["h", "r"], function (e, key) {
              if (!$("#history-title").parent().hasClass("open")) closeDropdowns();
              $("#history-title").click();
            });
          }
          Mousetrap.bind(["s", "u"], function (e, key) {
            if (!$("#settings-title").parent().hasClass("open")) closeDropdowns();
            $("#settings-title").click();
          }).bind(["shift+s", "shift+y"], function (e, key) {
            closeDropdowns();
            $("#settings-toggle").click();
          }).bind("?", function (e, key) {
            $("#shortcuts").modal();
          }).bind("esc", function (e, key) {
            closeDropdowns();
          });
        }
        // if settings modal is open
        if ($(e.target).attr("id") === "settings" && e.type === "show") {
          Mousetrap.bind(["tab", "shift+tab"], function (e, key) {
            var sel = $("#settings-tabs li.active").index();
            sel = (sel + (key === "tab" ? 1 : -1)) % $("#settings-tabs li").length;
            if (sel < 0) sel += $("#settings-tabs li").length;
            $($("#settings-tabs a")[sel]).click();
            e.preventDefault();
          }).bind("enter", function (e, key) {
            $($("#settings .tab-pane.active input")[0]).focus();
          }).bind("ctrl+enter", function (e, key) {
            $("#settings-save").click();
          });
          // override stop callback to pause on button focus
          Mousetrap.stopCallback = function (e, element) {
            return element.tagName === "BUTTON" || mousetrapStop(e, element);
          }
          // if shortcuts modal is open
        } else if ($(e.target).attr("id") === "shortcuts" && e.type === "show") {
          Mousetrap.bind("?", function (e, key) {
            $("#shortcuts").modal("hide");
          });
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
