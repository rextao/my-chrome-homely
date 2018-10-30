const SettingGeneral = function(general, settings) {
  this.general = general;
  // 主要是使用genenral，但很多小部件需要其他settings的内容
  this.settings = settings;
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
  }
};