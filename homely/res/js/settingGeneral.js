/**
 * setting-通用
 * 注意：settings-perm这个类名，是一些需要外网访问权限的操作，比如weather，
 * @User: rextao
 * @Date: 2018/10/30
 */
const SettingGeneral = function(general, settings, ajaxPerms) {
  this.general = general;
  // 主要是使用genenral，但很多小部件需要其他settings的内容
  this.settings = settings;
  // 异步访问的权限
  this.ajaxPerms = ajaxPerms;
};

SettingGeneral.prototype = {
  init(){
    // 初始化时钟
    this.initClock();
    this.initClockEvent();
    // 计时器
    this.initStopWatch();
    // 记事本
    this.initNotePad();
    // 天气
    this.initWeather();
    // 代理
    this.initProxy();
  },
  // 打开设置面板时，初始化设置面板的一些值
  populate(){
    const that = this;
    $("#settings-general-title").val(this.general["title"]);
    // 快捷键
    $("#settings-general-keyboard").prop("checked", this.general["keyboard"]);
    // 小部件
    // --------时钟
    $("#settings-general-clock-show").prop("checked", this.general["clock"].show);
    $("#settings-general-clock-twentyfour").prop("checked", this.general["clock"].twentyfour)
      .prop("disabled", !this.general["clock"].show)
      .parent().toggleClass("text-muted", !this.general["clock"].show);
    $("#settings-general-clock-seconds").prop("checked", this.general["clock"].seconds)
      .prop("disabled", !this.general["clock"].show)
      .parent().toggleClass("text-muted", !this.general["clock"].show);
    // --------定时器
    $("#settings-general-timer-stopwatch").prop("checked", this.general["timer"].stopwatch);
    $("#settings-general-timer-countdown").prop("checked", this.general["timer"].countdown);
    $("#settings-general-timer-beep").prop("checked", this.general["timer"].beep)
      .prop("disabled", !this.general["timer"].countdown)
      .parent().toggleClass("text-muted", !this.general["timer"].countdown);
    // --------记事本
    $("#settings-general-notepad-show").prop("checked", this.general["notepad"].show);
    // --------扩展
    $("#settings-general-apps").prop("checked", this.general["apps"]);
    // --------扩展（根据权限，对文字颜色进行控制）
    chrome.permissions.contains({
      permissions: ["management"]
    }, function (has) {
      if (has) {
        $(".settings-perm-management").addClass("has-success");
      } else {
        $(".settings-perm-management").addClass("has-warning");
        $("#settings-general-apps").prop("checked", false);
      }
    });
    // --------天气
    $("#settings-general-weather-show").prop("checked", this.general["weather"].show);
    // --------天气（地点）
    $("#settings-general-weather-location").val(this.general["weather"].location)
      .prop("disabled", !this.general["weather"].show)
      .parent().toggleClass("text-muted", !this.general["weather"].show);
    // --------天气(天气单位)
    $("#settings-general-weather-celsius").html("&deg;" + (this.general["weather"].celsius ? "C" : "F"))
      .prop("disabled", !this.general["weather"].show);
    // --------代理
    $("#settings-general-proxy").prop("checked", this.general["proxy"]);
    $(".settings-perm").each(function (i, group) {
      var key = $(group).data("key");
      chrome.permissions.contains({
        origins: that.ajaxPerms[key]
      }, function (has) {
        if (has) {
          $(group).addClass("has-success");
        } else {
          $(group).addClass("has-warning");
          $("input[type=checkbox]", group).prop("checked", false);
        }
      })
    });
  },

  // 设置面板，点击保存时
  save(manifname){
    const that = this;
    // 标识是否删除权限失败
    let revokeError = false;
    this.setTitleName(manifname);
    // 快捷键
    this.general["keyboard"] = $("#settings-general-keyboard").prop("checked");
    // 小部件
    // ----时钟
    this.general["clock"] = {
      show: $("#settings-general-clock-show").prop("checked"),
      twentyfour: $("#settings-general-clock-twentyfour").prop("checked"),
      seconds: $("#settings-general-clock-seconds").prop("checked")
    };
    this.general["timer"] = {
      stopwatch: $("#settings-general-timer-stopwatch").prop("checked"),
      countdown: $("#settings-general-timer-countdown").prop("checked"),
      beep: $("#settings-general-timer-beep").prop("checked")
    };
    this.general["notepad"].show = $("#settings-general-notepad-show").prop("checked");
    this.general["apps"] = $("#settings-general-apps").prop("checked");
    this.general["weather"] = {
      show: $("#settings-general-weather-show").prop("checked"),
      location: $("#settings-general-weather-location").val(),
      celsius: $("#settings-general-weather-celsius").text()[1] === "C"
    };
    if (!this.general["weather"].location) this.general["weather"].show = false;
    this.general["proxy"] = $("#settings-general-proxy").prop("checked");
    // 删除权限
    if (!this.general["apps"]) {
      // 注意permissions里面的权限是不可remove的，只有options.permissions可以删除
      // 官网介绍，删除权限后，再利用permissions.request() 添加权限不会弹出prompt窗口
      chrome.permissions.remove({
        permissions: ["management"]
      }, function (success) {
        if (!success) revokeError = true;
      });
    }
    if (!this.general["weather"].show) revoke("weather");
    if (!this.general["proxy"]) revoke("proxy");
    function revoke(key) {
      chrome.permissions.remove({
        origins: that.ajaxPerms[key]
      }, function (success) {
        if (!success) revokeError = true;
      });
    }
    return revokeError;
  },
  // 初始化setting面板的一些响应事件
  initEvent(){
    const that = this;
    $("#settings-general-timer-countdown").change(function (e) {
      $("#settings-general-timer-beep").prop("disabled", !this.checked)
        .parent().toggleClass("text-muted", !this.checked);
    });

    // 查询manifest.json的optional_permissions是否具有这个权限
    // 主要是增加weather、proxy的change事件，
    $(".settings-perm input[type=checkbox]").change(function (e) {
      $("#settings-alerts").empty();
      // grant requried permissions for provider
      var id = this.id;
      var perms = that.ajaxPerms[$("#" + id).closest(".settings-perm").data("key")];
      if (this.checked) {
        // https://developer.chrome.com/apps/permissions#method-request
        chrome.permissions.request({
          origins: perms
        }, function (success) {
          var check = $("#" + id);
          if (success) {
            check.closest(".settings-perm").removeClass("has-warning").addClass("has-success");
          } else {
            var text = "Permission denied for " + perms.join(", ") + ".";
            $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text(text));
            check.prop("checked", false).change();
          }
        });
      }
    });

    $("#settings-general-apps").change(function (e) {
      $("#settings-alerts").empty();
      // grant history permissions
      if (this.checked) {
        chrome.permissions.request({
          permissions: ["management"]
        }, function (success) {
          if (success) {
            $(".settings-perm-management").removeClass("has-warning").addClass("has-success");
            $("#settings-general-apps").prop("disabled", false).parent().removeClass("text-muted");
          } else {
            var text = "Permission denied for management.";
            $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text(text));
            $(this).prop("checked", false);
          }
        });
      }
    });
    $("#settings-general-weather-show").change(function (e) {
      $("#settings-general-weather-location, #settings-general-weather-celsius").prop("disabled", !this.checked);
      if (this.checked) $("#settings-general-weather-location").focus();
    });
    $("#settings-general-weather-celsius").click(function (e) {
      $(this).html("&deg;" + ($(this).text()[1] === "C" ? "F" : "C"));
    });
  },

  //  -------------设置title名字
  setTitleName(manifname){
    // manifname为manifest文件中的name值
    if (!$("#settings-general-title").val()) $("#settings-general-title").val(manifname);
    this.general["title"] = $("#settings-general-title").val();
  },

  // 初始化快捷键
  initHotKeys(e){
    const that = this;
    var mousetrapStop = Mousetrap.stopCallback;
    // links selection state
    var linksHotkeys = {
      curBlk: -1,
      curBtn: -1,
      blk: []
    };
    // 关闭任何一个下拉框
    var closeDropdowns = function closeDropdowns() {
      $(".btn-group.open, .dropdown.open").removeClass("open");
      $("#links .panel-heading .btn").hide();
    };
    // number/cycle navigation for links
    var nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    var off = "panel-" + that.settings.style["panel"];
    var on = "panel-" + (off === "panel-primary" ? "default" : "primary");
    // 选中某个模块
    var selectBlk = function selectBlk(i, id) {
      // 先为panel增加一个选中样式
      $(`#${id} .${on}`).removeClass(on).addClass(off);
      linksHotkeys.curBlk = i;
      $(`#${id} .panel`).eq(i).removeClass(off).addClass(on);
      if (linksHotkeys.curBtn > -1) {
        $(linksHotkeys.blk[linksHotkeys.curBtn]).off("blur");
        $("i", linksHotkeys.blk[linksHotkeys.curBtn]).remove();
      }
      linksHotkeys.blk = $(`#${id} .panel`).eq(i).find(' .panel-body .btn');
      selectBtn(0);
    };
    var selectBtn = function selectBtn(i) {
      if (linksHotkeys.curBtn > -1) {
        $(linksHotkeys.blk[linksHotkeys.curBtn]).off("blur");
        $("i", linksHotkeys.blk[linksHotkeys.curBtn]).remove();
      }
      linksHotkeys.curBtn = i;
      $(linksHotkeys.blk[linksHotkeys.curBtn]).prepend(" ").prepend($("<i/>").addClass("fa fa-hand-o-right")).focus().blur(function (e) {
        $(this).off("blur");
        clearSel();
      });
    };
    // 清楚选择
    var clearSel = function clearSel() {
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
    clearSel();
    // 如有打开的模态框，绑定一个esc，用于关闭模态框
    var modal = $(document.body).hasClass("modal-open");
    if (modal) {
      Mousetrap.bind("esc", function (e, key) {
        $(".modal.in").modal("hide");
      });
    }
    // 快捷键
    if (that.settings.general["keyboard"]) {
      // 全局快捷键
      if (!modal) {
        if (that.settings.general["apps"]) {
          Mousetrap.bind("a", function (e, key) {
            if (!$("#apps-title").parent().hasClass("open")) closeDropdowns();
            $("#apps-title").click();
          }).bind("shift+a", function (e, key) {
            chrome.tabs.create({url: "chrome://extensions/"});
          })
        }
        if (that.settings.history["enable"]) {
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
        // 链接与书签页面样式一致，使用相同快捷键
        const menuId = $("nav li.active").attr("id");
        // 如果是拨号布局
        if(menuId === "menu-bookmarks" && $('#bookmarks .dial').length !== 0) {
          Mousetrap.bind(nums, function (e, key) {
            closeDropdowns();
            $('.dial div').removeClass('on');
            $('.dial div').eq(nums.indexOf(key)).addClass('on');
          }).bind("tab", function (e, key) {
            var sel = $(".dial .on").index();
            $('.dial div').removeClass('on');
            sel = sel + 1;
            $('.dial div').eq(sel).addClass('on');
            e.preventDefault();
          }).bind('enter',function () {
            if($(".dial .on")){
              $(".dial .on").find('a')[0].click();
            }
          }).bind('`',function () {
            if($(".dial .on")){
              $(".dial .on").find('a')[0].click();
            }
          });
        }
        // 链接与书签（扁平化布局）的快捷键
        if (menuId === "menu-links" || menuId === "menu-bookmarks" || that.settings.bookmarks["merge"]) {
          const panelId = menuId.split('-')[1];
          Mousetrap.bind(nums, function (e, key) {
            closeDropdowns();
            selectBlk(nums.indexOf(key), panelId);
          }).bind('`', function (e, key) {
            closeDropdowns();
            if (linksHotkeys.curBlk === -1) selectBlk(0, panelId);
            var i = (linksHotkeys.curBtn === -1 ? 0 : (linksHotkeys.curBtn + (key === "[" ? -1 : 1)) % linksHotkeys.blk.length);
            if (i < 0) i += linksHotkeys.blk.length;
            selectBtn(i);
          }).bind("enter", function (e, key) {
            // clear selection
            setTimeout(clearSel, 50);
          }).bind("backspace", function (e, key) {
            // clear selection and lose focus
            if (linksHotkeys.curBtn > -1) $(linksHotkeys.blk[linksHotkeys.curBtn]).blur();
          }).bind("/", function(e, key) {
            $("#bookmarks-search").focus();
            e.preventDefault();
          });
        }
      }
    }
  },
  // 时钟，用定时器，时间不太准
  initClock(){
    // 显示时钟
    if (this.general["clock"].show) {
      const that = this;
      const time = $("<div/>").attr("id", "time").addClass("navbar-brand");
      $(".navbar-header").append(time);
      const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
      let tick = function tick() {
        const now = new Date();
        let hours = now.getHours();
        let pm = "";
        if (that.general["clock"].twentyfour) {
          hours = tools.pad(hours);
        } else {
          pm = " AM";
          if (hours === 0 || hours > 12) {
            hours = (hours + 12) % 24;
            pm = " PM";
          }
        }
        const date =  now.getFullYear()  + "-" + months[now.getMonth()] + "-" + now.getDate() + days[now.getDay()];
        time.text(date + "  " + hours + ":" + tools.pad(now.getMinutes()) + (that.general["clock"].seconds ? ":" + tools.pad(now.getSeconds()) : "") + pm)
          .attr("title",date);
      };
      tick();
      setInterval(tick, 1000);
    }
  },
  initClockEvent(){
    $("#settings-general-clock-show").change(function (e) {
      $("#settings-general-clock-twentyfour, #settings-general-clock-seconds").prop("disabled", !this.checked)
        .parent().toggleClass("text-muted", !this.checked);
    });
  },
  // 计时器
  initStopWatch(){
    const that = this;
    if (this.general["timer"].stopwatch || this.general["timer"].countdown) {
      var tmRoot = $("<li/>").addClass("dropdown");
      var tmLink = $("<a/>").addClass("dropdown-toggle").attr("data-toggle", "dropdown");
      tmRoot.append(tmLink);
      var tmMenu = $("<ul/>").addClass("dropdown-menu");
      tmRoot.append(tmMenu);
      var reset = function reset() {
        tmLink.empty().append(tools.fa("clock-o", false)).append(tools.label("无定时器", that.settings)).append($("<b/>").addClass("caret"));
        if (!that.settings.style["topbar"].labels) {
          tmLink.prop("title", "无计时器");
        }
        ;
        tmMenu.empty();
        var interval = 0;
        if (that.general["timer"].stopwatch) {
          tmMenu.append($("<li/>").append($("<a/>").append("开始计时器").click(function (e) {
            var time = 0;
            var stopwatch = function stopwatch() {
              time++;
              if (time) {
                var text = tools.pad(Math.floor(time / (60 * 60))) + ":" + tools.pad(Math.floor((time / 60) % 60)) + ":" + tools.pad(time % 60);
                $($("span", tmLink)[0]).text(text);
                document.title = text;
              } else {
                clearInterval(interval);
                document.title = that.general["title"];
                reset();
              }
            };
            // stopwatch menu
            tmMenu.empty().append($("<li/>").append($("<a/>").data("paused", false).append(tools.fa("pause")).append(" 暂停").click(function (e) {
              if ($(this).data("paused")) {
                interval = setInterval(stopwatch, 1000);
                $("i", tmLink).addClass("fa-spin");
                $(this).data("paused", false).empty().append(tools.fa("pause")).append(" 暂停");
              } else {
                clearInterval(interval);
                $("i", tmLink).removeClass("fa-spin");
                $(this).data("paused", true).empty().append(tools.fa("play")).append(" 恢复");
              }
            }))).append($("<li/>").append($("<a/>").append(tools.fa("stop")).append(" 结束").click(function (e) {
              clearInterval(interval);
              document.title = that.general["title"];
              reset();
            })));
            // show timer
            var text = tools.pad(Math.floor(time / (60 * 60))) + ":" + tools.pad(Math.floor((time / 60) % 60)) + ":" + tools.pad(time % 60);
            tmLink.empty().prop("title", "").append(tools.fa("spinner fa-spin", false)).append(" ").append($("<span/>").text(text)).append(" ").append($("<b/>").addClass("caret"));
            document.title = text;
            interval = setInterval(stopwatch, 1000);
          })));
        }
        if (that.general["timer"].countdown) {
          tmMenu.append($("<li/>").append($("<a/>").append("开始倒计时").click(function (e) {
            // select time
            var time = prompt("输入倒计时的一个时间(如 45s, 2m30s)", "5m");
            if (!time) return;
            var parts = time.replace(/[^0-9hms]/g, "").match(/([0-9]+[hms])/g);
            var time = 0;
            for (var i in parts) {
              var part = parts[i];
              var params = [parseInt(part.substr(0, part.length - 1)), part.charAt(part.length - 1)];
              switch (params[1]) {
                case "h":
                  time += params[0] * 60 * 60;
                  break;
                case "m":
                  time += params[0] * 60;
                  break;
                case "s":
                  time += params[0];
                  break;
              }
            }
            var countdown = function countdown() {
              if (time) {
                time--;
                var text = tools.pad(Math.floor(time / (60 * 60))) + ":" + tools.pad(Math.floor((time / 60) % 60)) + ":" + tools.pad(time % 60);
                $($("span", tmLink)[0]).text(text);
                document.title = text;
              } else {
                if (that.general["timer"].beep) {
                  new Audio("../mp3/alarm.mp3").play();
                }
                clearInterval(interval);
                document.title = that.general["title"];
                reset();
              }
            };
            // countdown menu
            tmMenu.empty().append($("<li/>").append($("<a/>").data("paused", false).append(tools.fa("pause")).append(" Pause").click(function (e) {
              if ($(this).data("paused")) {
                interval = setInterval(countdown, 1000);
                $("i", tmLink).addClass("fa-spin");
                $(this).data("paused", false).empty().append(tools.fa("pause")).append(" Pause");
              } else {
                clearInterval(interval);
                $("i", tmLink).removeClass("fa-spin");
                $(this).data("paused", true).empty().append(tools.fa("play")).append(" Resume");
              }
            }))).append($("<li/>").append($("<a/>").append(tools.fa("stop")).append(" Cancel").click(function (e) {
              clearInterval(interval);
              document.title = that.general["title"];
              reset();
            })));
            // show timer
            var text = tools.pad(Math.floor(time / (60 * 60))) + ":" + tools.pad(Math.floor((time / 60) % 60)) + ":" + tools.pad(time % 60);
            tmLink.empty().prop("title", "").append(tools.fa("spinner fa-spin", false)).append(" ").append($("<span/>").text(text)).append(" ").append($("<b/>").addClass("caret"));
            document.title = text;
            interval = setInterval(countdown, 1000);
          })));
        }
      };
      reset();
      $("#menu-left").append(tmRoot);
    }
  },
  // 记事本
  // 主要是将内容存储在 chrome.storage.local
  initNotePad(){
    if (this.general["notepad"].show) {
      const that = this;
      var npRoot = $("<li/>").addClass("dropdown");
      var npLink = $("<a/>").addClass("dropdown-toggle").attr("data-toggle", "dropdown")
        .append(tools.fa("edit", false)).append(tools.label("记事本", this.settings)).append(" ").append($("<b/>").addClass("caret"));
      npRoot.append(npLink);
      var npMenu = $("<ul/>").addClass("dropdown-menu");
      var notepad = $("<textarea/>").attr("id", "notepad").attr("rows", 10).addClass("form-control notepad-saved");
      var timeout = 0;
      // 利用input事件，实现类似输入完保存的效果，定时器往localstorage存储
      notepad.val(that.general["notepad"].content).on("input", function (e) {
        notepad.removeClass("notepad-saved");
        if (timeout) clearTimeout(timeout);
        var content = notepad.val();
        // 页面加载时，会自动从storage中读取settings，写的内容保存在settings中
        timeout = setTimeout(function () {
          that.general["notepad"].content = content;
          chrome.storage.local.set({general: that.general});
          notepad.addClass("notepad-saved");
        }, 500);
      }).click(function (e) {
        e.stopPropagation();
      });
      npMenu.append($("<li/>").append(notepad));
      npRoot.append(npMenu);
      $("#menu-left").append(npRoot);
    }
  },
  // 显示扩展
  // fixLinkHandling为一个处理chrome://extensions/这样的连接，可以用ctrl+左键在新标签点开
  initExtensions(fixLinkHandling){
    /**
     * settings-general-apps，改为获取扩展，app使用的不多
     * chrome.extension.inIncognitoContext：true表示，content脚本运行在隐藏模式下，
     */
    if (this.general["apps"] && !chrome.extension.inIncognitoContext) {
      chrome.permissions.contains({
        permissions: ["management"]
      }, function (has) {
        if (!has) {
          settings.general["apps"] = false;
          return;
        }
        // 获取全部插件
        chrome.management.getAll(function (apps) {
          let html = '';
          // 循环显示当前扩展
          $.each(apps, function (i, app) {
            const fa = app.enabled ? 'fa-check' : 'fa-close';
            const textColor  = app.enabled ? 'text-success' : 'text-danger';
            html += `<li>
                        <a id="${app.id}" href="" >
                            <span class="fa ${fa} ${textColor}"></span>
                            <span class="${textColor}">${app.name}</span>
                        </a>
                     </li>`;
          });
          $("#apps-list").append(html);
          // 扩展的点击事件
          $("#apps-list a").on('click', function (e) {
            e.preventDefault();
            const id = $(this).attr('id');
            chrome.management.get(id, function(item){
              // 扩展当前状态
              const enabled = item.enabled;
              // 启用或禁用插件,!enabled为点击之后的状态
              chrome.management.setEnabled(id, !enabled,function () {
                // alert为了警醒一下
                alert(`${item.name}已经${(!enabled ? '启用':'禁用')}`);
                $('#'+id).find('span').toggleClass('text-success', !enabled).toggleClass('text-danger', enabled);
                $('#'+id).find('.fa').toggleClass('fa-check', !enabled).toggleClass('fa-close', enabled);
              });
            })
          });
          var all = $("<a/>").attr("href", "chrome://extensions").addClass("link-chrome").append(tools.fa("th")).append(" 显示全部扩展");
          var allCont = $("<li/>").append(all);
          fixLinkHandling(allCont);
          var store = $("<a/>").attr("href", "https://chrome.google.com/webstore");
          $("#apps-list").append($("<li/>").addClass("divider"))
            .append(allCont)
            .append($("<li/>").append(store.append(tools.fa("shopping-cart")).append(" 谷歌商城")));
          $("#menu-apps").show();
        });
      });
    }
  },
  // 天气
  initWeather(){
    const that = this;
    const weatherCallbacks = [];
    weatherCallbacks.push(function () {
      // 函数在异步ajax中调用
      if (that.settings.style["topbar"].labels) $("#menu-weather .menu-label").show();
    });
    if (this.general["weather"].show && !chrome.extension.inIncognitoContext) {
      chrome.permissions.contains({
        origins: that.ajaxPerms["weather"]
      }, function (has) {
        if (!has || !that.general["weather"].location) {
          that.general["weather"].show = false;
          return;
        }
        // 判断离线还是在线
        if (navigator.onLine) {
          // 把字符串作为 URI 组件进行编码
          var loc = encodeURIComponent(that.general["weather"].location);
          var unit = (that.general["weather"].celsius ? "metric" : "imperial");
          $.ajax({
            url: "http://api.openweathermap.org/data/2.5/weather?APPID=833b8b2bb6161e0c2b43dab37d0c93a7&q=" + loc + "&units=" + unit,
            success: function success(resp, stat, xhr) {
              var conds = [];
              $.each(resp.weather, function (i, item) {
                conds.push(item.description);
              });
              var temp = Math.round(resp.main.temp);
              var title = resp.name + ": " + tools.cap((that.settings.style["topbar"].labels ? "" : temp + " degrees, ") + conds.join(", "));
              var link = $("<a/>").attr("id", "menu-weather").attr("href", "http://www.openweathermap.org/city/" + resp.id)
                .attr("title", title).hide();
              link.append(tools.fa("cloud", false)).append(tools.label(temp + "&deg;" + (unit === "metric" ? "C" : "F"), that.settings));
              // always show before proxy link if that loads first
              if ($("#menu-proxy").length) {
                $("#menu-proxy").before($("<li/>").append(link));
              } else {
                $("#menu-left").append($("<li/>").append(link));
              }
              link.fadeIn();
              // return any pending callbacks
              for (var i in weatherCallbacks) {
                weatherCallbacks[i].call();
              }
            }
          });
        }
      });
    }
  },
  // 代理
  initProxy(){
    const that = this;
    // 当回调完成后，再进行判断
    const proxyCallbacks = [];
    proxyCallbacks.push(function () {
      var label = $("#menu-proxy .menu-label");
      if (that.settings.style["topbar"].labels) {
        label.show();
      } else {
        label.parent().attr("title", label.text());
      }
    });
    if (that.general["proxy"]) {
      chrome.permissions.contains({
        origins: that.ajaxPerms["proxy"]
      }, function (has) {
        if (!has) {
          that.general["proxy"] = false;
          return;
        }
        var link = $("<a/>").attr("id", "menu-proxy");
        if (navigator.onLine) {
          $.ajax({
            url: "http://www.whatismyproxy.com",
            success: function success(resp, stat, xhr) {
              var params = $(".h1", resp).text().split("IP address: ");
              link.attr("href", "http://www.whatismyproxy.com").hide();
              link.append(tools.fa(params[0] === "No proxies were detected." ? "desktop" : "exchange", false)).append(tools.label(params[1], settings));
              $("#menu-left").append($("<li/>").attr("id", "menu-proxy").append(link));
              link.fadeIn();
            },
            error: function (xhr, stat, err) {
              link.append(tools.fa("power-off", false)).append(tools.label("No connection", that.settings)).hide();
              $("#menu-left").append($("<li/>").attr("id", "menu-proxy").append(link));
              link.fadeIn();
            },
            complete: function (xhr, stat) {
              // return any pending callbacks
              for (var i in proxyCallbacks) {
                proxyCallbacks[i].call();
              }
            }
          });
        } else {
          link.append(fa("power-off", false)).append(label("No connection", settings)).hide();
          $("#menu-left").append($("<li/>").append(link));
          link.fadeIn();
          // return any pending callbacks
          for (var i in proxyCallbacks) {
            proxyCallbacks[i].call();
          }
        }
      });
    }
  }
};