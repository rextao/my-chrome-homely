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
      "enable": true,
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
      "fluid": true,
      "topbar": {
        "fix": true,
        "dark": true,
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
    },
    "stock":{
      // 默认只有上证指数
      url:'http://qt.gtimg.cn/q=sh000001',
      position:'',// 600118,600131,600462,000001,000651,002555,002907,300612,000725
      freshCheckBox:true,
      freshTimer:60
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
    var firstRun = $.isEmptyObject(store.links);
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
    /*******************点击time,显示股票信息--开始**************************/
    // 主要目的是，点击页面任何区域，都可以关闭股票面板
    $('html').on('click',function(e){
      if(e.target.id !== 'time' && $(e.target).parents('#stockWrapper').length === 0){
        $('#stockWrapper').hide();
      }
    });
    $('#time').on('click',function(){
      // 快捷书签隐藏时，不显示股票面板
      if($('#links').css('display') !== 'none'){
        stock.init();
        $('#stockWrapper').show();
        // 设置显示持仓的股票
        $('#stockPosition textarea').val(settings.stock.position);
        stock.getStockData();
      }
    });
    let stock = {
      timer:'',
      init(){
        this.bindEvent();
        const checked = settings.stock.freshCheckBox;
        const freshVal = settings.stock.freshTimer;
        // 设置check与输入框值
        $('#freshTimer').find('input[type=checkbox]').prop('checked',checked);
        $('#freshTimer').find('input[type=text]').val(freshVal);
        // html配置有几个股票
        $('#stockPosition .sum').text(settings.stock.position.split(',').length);
        if(checked){
          this.freshControl(freshVal);
        }else {
          clearTimeout(stock.timer);
          stock.timer = '';
        }
      },
      bindEvent(){
        $('#freshHand').on('click',function(){
          stock.getStockData();
        });
        $('#saveFreshParam').on('click',function(){
          settings.stock.freshCheckBox = $('#freshTimer').find('input[type=checkbox]').prop('checked');
          settings.stock.freshTimer = $('#freshTimer').find('input[type=text]').val();
          chrome.storage.local.set({"stock": settings.stock});
          location.reload();// 重新加载页面
        });
        $('#stockPosition button').on('click',function(){
          settings.stock.position = $('#stockPosition textarea').val();
          chrome.storage.local.set({"stock": settings.stock});
          location.reload();// 重新加载页面
        })
      },
      // 控制定时器，在大盘不开盘时不定时请求数据
      // 只有在每周一到周五上午时段9:30-11:30，下午时段13:00-15:00
      freshControl(freshVal){
        const date = new Date();
        const $stockInfo = $('#stockInfo');
        const week = date.getDay();// 返回星期几，0为周日
        const amStart = new Date(new Date().setHours(9)).setMinutes(30);
        const amEnd = new Date(new Date().setHours(11)).setMinutes(30);
        const pmStart = new Date(new Date().setHours(13)).setMinutes(0);
        const pmEnd = new Date(new Date().setHours(15)).setMinutes(0);
        let diff = 0;
        const time = date.getTime();
        $stockInfo.text('');
        if(week===0 || week ===6){
          console.log('今天是周末');
          return false;// 不定时请求数据
        }
        if((time >= amStart && time <= amEnd) || (time >= pmStart && time <= pmEnd)){
          $stockInfo.text(`stock数据${freshVal}s刷新`);
          stock.freshTimer(freshVal *1000);
          return true;
        }else if(time < amStart){// 时间未到9点半
          diff = amStart - time;
          console.log(`还有${diff/1000/60}分钟上午开盘`);
        }else if(time < pmStart){// 未到下午1点
          diff = pmStart - time;
          console.log(`还有${~~(diff/1000/60)}分钟下午开盘`);
        }
        // 如果未到开盘时间，定时等待开盘再发请求
        setTimeout(function () {
          stock.freshControl(freshVal);
        },diff);
        if(time > pmEnd){
          $stockInfo.text(`stock数据不刷新`);
          console.log(`收盘了~老铁`);
          return false
        }
      },
      // 根据data.postion构建url
      createStockPositionUrl(){
        const arr = settings.stock.position.split(',');
        let url='';
        arr.forEach((item)=>{
          url += `,${this.addStartsStock(item)}`;
        });
        return url;
      },
      // 根据股票代码，前面增加sz或sh等
      addStartsStock(item){
        // 先默认000001是上证指数
        if(item === '000001'){
          return `sh000001`
        }
        // 我国000或002开头的就是深证的，600开头的是上证的，300开头的是创业板 200开头的是深圳B股,900开头的是上海B股。
        if(item.startsWith('000') || item.startsWith('002') || item.startsWith('300')){
          return `sz${item}`;
        }else {
          return `sh${item}`;
        }
      },
      // 定时请求数据
      freshTimer(time){
        this.timer = setTimeout(()=>{
          this.getStockData();
          this.freshTimer(time)
        },time)
      },
      // 从服务器获取stock数据
      getStockData(){
        $.ajax({
          type : "GET",
          url : `${settings.stock.url}${stock.createStockPositionUrl()}`,
          cache : "false",
          timeout : 2000,
          success : function(data) {
            stock.createTable(data);
          },
          error : function() {
          }
        });
      },
      // data数据为字符串，每个stock数据会用一个;和换行符来分割
      createTable(data){
        const $table = $('#stockWrapper table');
        const detailSina = 'http://finance.sina.com.cn/realstock/company';
        const bigDetailSina = 'http://vip.stock.finance.sina.com.cn/quotes_service/view/cn_bill.php?symbol=';// 大单明细
        $table.empty();
        const stock = data.split(';\n');
        let html = '<tr class="title"><td>股票代码</td><td>股票名字</td><td>当前价格</td><td>涨跌幅</td><td>最高价</td><td>最低</td></tr>';
        stock.forEach((item,index) => {
          if(item !== ''){
            let temp = item.split('~');
            // 只获取一遍时间
            if(index ===0){
              let time = temp[30];
              time = `${time.substring(8,10)}:${time.substring(10,12)}:${time.substring(12)}`;
              $('#stockTime').text(time)
            }
            // 1:股票名字2: 股票代码3: 当前价格30: 时间32: 涨跌%33: 最高34: 最低
            html += `<tr>
                        <td><a href="${detailSina}/${this.addStartsStock(temp[2])}/nc.shtml?from=BaiduAladin" target="_blank" >${temp[2]}<span class="badge">实时数据</span></a></td>
                        <td><a href="${bigDetailSina}${this.addStartsStock(temp[2])}" target="_blank" >${temp[1]}<span class="badge">大单</span></a></td>`;
            // 增加涨点颜色配置
            if(temp[32] >=0){
              html += `<td style="font-weight:900;">👹 ${temp[3]}</td>
                       <td style="font-weight:900;">👹 ${temp[32]}%</td>`
            }else{
              html += `<td style="font-weight:900;">${temp[3]}</td>
                       <td style="font-weight:900;">${temp[32]}%</td>`
            }
            html += `<td>${temp[33]}</td>
                     <td>${temp[34]}</td>
                    </tr>`;
            // arr.push(temp[31]);// 31: 涨跌
          }
        });
        $table.append(html);
      }
    };

    /*******************点击time,显示股票信息--结束**************************/
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
