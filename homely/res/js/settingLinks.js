/**
 * 
 * @User: rextao
 * @Date: 2018/10/30
 */
const SettingLinks = function (links, settings, fixLinkHandling) {
  this.links = links;
  this.settings = settings;
  this.fixLinkHandling = fixLinkHandling;
};
SettingLinks.prototype = {
  init(){
    const that = this;
    this.initLinks();
    // 如没有链接页面没有任何链接模块
    if (!this.links["content"].length) {
      var text = $("<span><strong>还未添加任何自定义链接模块</strong>  点击此 <a>新增一个链接模块</a>.</span>");
      $("a", text).click(function (e) {
        that.links["content"].push({
          title: "",
          buttons: []
        });
        $("#links-editor").data("block", that.links["content"].length - 1).modal("show");
        that.initLinks();
        chrome.storage.local.set({"links": that.links});
      });
      $("#alerts").append($("<div/>").addClass("alert alert-info").append(text));
    }
  },
  populate(){
    $("#settings-links-edit-menu").prop("checked", this.links["edit"].menu);
    $("#settings-links-edit-dragdrop").prop("checked", this.links["edit"].dragdrop);
    $("#settings-links-behaviour-dropdownmiddle").prop("checked", this.links["behaviour"].dropdownmiddle);
  },
  save(){
    this.links["edit"] = {
      menu: $("#settings-links-edit-menu").prop("checked"),
      dragdrop: $("#settings-links-edit-dragdrop").prop("checked")
    };
    this.links["behaviour"].dropdownmiddle = $("#settings-links-behaviour-dropdownmiddle").prop("checked");


  },
  // 渲染链接主页面
  // 复杂的渲染，包含了挪动，添加内容，通过递归
  initLinks(){
    const that = this;
    $("#alerts, #links").empty();
    if (this.links["edit"].dragdrop) $("#links").off("sortupdate");
    // loop through blocks
    $(this.links["content"]).each(function (i, linkBlk) {
      if (!linkBlk.title) linkBlk.title = "";
      if (!linkBlk.buttons) linkBlk.buttons = [];
      const blk = $('<div/>').addClass('panel panel-' + that.settings.style['panel'] + ' sortable').data('pos', i);
      const head = $('<div/>').addClass('panel-heading').text(linkBlk.title).dblclick(function (e) {
        $('#links-editor').data('block', i).modal('show');
      });
      if (!linkBlk.title) head.html("&nbsp;");
      // edit controls dropdown on header
      if (that.links["edit"].menu) {
        const editRoot = $('<div/>').addClass('btn-group pull-right');
        const editBtn = $('<button/>').addClass('btn btn-xs btn-default dropdown-toggle').attr('data-toggle', 'dropdown').append($('<b/>').addClass('caret')).hide();
        editRoot.append(editBtn);
        const editMenu = $('<ul/>').addClass('dropdown-menu');
        // 根据i值，所有大于0的都有左移，移动到开始
        // 小于Max，都有右移，移动到末尾
        // i > 0 || i < max:全部模块
        if (i > 0) {
          editMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-double-left")).append(" 移动到开始").click(function (e) {
            for (var x = i; x > 0; x--) {
              that.links["content"][x] = that.links["content"][x - 1];
            }
            that.links["content"][0] = linkBlk;
            that.initLinks();
            chrome.storage.local.set({"links": that.links});
          })));
          editMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-left")).append(" 左移").click(function (e) {
            that.links["content"][i] = that.links["content"][i - 1];
            that.links["content"][i - 1] = linkBlk;
            that.initLinks();
            chrome.storage.local.set({"links": that.links});
          })));
        }
        const max = that.links['content'].length - 1;
        if (i < max) {
          editMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-right")).append(" 右移").click(function (e) {
            that.links["content"][i] = that.links["content"][i + 1];
            that.links["content"][i + 1] = linkBlk;
            that.initLinks();
            chrome.storage.local.set({"links": that.links});
          })));
          editMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-double-right")).append(" 移动到最后").click(function (e) {
            for (let x = i; x < max; x++) {
              that.links["content"][x] = that.links["content"][x + 1];
            }
            that.links["content"][max] = linkBlk;
            that.initLinks();
            chrome.storage.local.set({"links": that.links});
          })));
        }
        if (i > 0 || i < max) {
          editMenu.append($("<li/>").append($("<a/>").append(tools.fa("arrows")).append(" 移动到指定位置").click(function (e) {
            let x;
            let pos = prompt('输入模块新位置：', i);
            if (typeof(pos) === "string") {
              pos = parseInt(pos);
              if (!isNaN(pos)) {
                if (pos < 0) pos = 0;
                if (pos > max) pos = max;
                if (pos < i) {
                  for (x = i; x > pos; x--) {
                    that.links["content"][x] = that.links["content"][x - 1];
                  }
                } else if (pos > i) {
                  for (x = i; x < pos; x++) {
                    that.links["content"][x] = that.links["content"][x + 1];
                  }
                }
                that.links["content"][pos] = linkBlk;
                that.initLinks();
                chrome.storage.local.set({"links": that.links});
              }
            }
          })));
          editMenu.append($("<li/>").addClass("divider"));
        }
        editMenu.append($("<li/>").append($("<a/>").append(tools.fa("step-backward")).append(" 前面添加模块").click(function (e) {
          that.links["content"].splice(i, 0, {
            title: "",
            buttons: []
          });
          $("#links-editor").data("block", i).modal("show");
          that.initLinks();
          chrome.storage.local.set({"links": that.links});
        })));
        editMenu.append($("<li/>").append($("<a/>").append(tools.fa("step-forward")).append(" 后面添加模块").click(function (e) {
          that.links["content"].splice(i + 1, 0, {
            title: "",
            buttons: []
          });
          $("#links-editor").data("block", i + 1).modal("show");
          that.initLinks();
          chrome.storage.local.set({"links": that.links});
        })));
        editMenu.append($("<li/>").append($("<a/>").append(tools.fa("files-o")).append(" 复制模块").click(function (e) {
          that.links["content"].splice(i + 1, 0, $.extend(true, {}, linkBlk));
          that.initLinks();
          chrome.storage.local.set({"links": that.links});
        })));
        editMenu.append($("<li/>").addClass("divider"));
        editMenu.append($("<li/>").append($("<a/>").append(tools.fa("pencil")).append(" 编辑模块").click(function (e) {
          $("#links-editor").data("block", i).modal("show");
        })));
        editMenu.append($("<li/>").append($("<a/>").append(tools.fa("tag")).append(" 重命名模块").click(function (e) {
          var name = prompt("输入模块的新名：", linkBlk.title);
          if (typeof(name) === "string") {
            linkBlk.title = name;
            that.initLinks();
            chrome.storage.local.set({"links": that.links});
          }
        })));
        editMenu.append($("<li/>").append($("<a/>").append(tools.fa("trash-o")).append(" 删除模块").click(function (e) {
          if (confirm("你确定要删除 " + (linkBlk.title ? linkBlk.title : "这个模块吗") + "?")) {
            that.links["content"].splice(i, 1);
            that.initLinks();
            chrome.storage.local.set({"links": that.links});
          }
        })));
        editRoot.append(editMenu);
        head.append(editRoot);
        head.mouseenter(function (e) {
          editBtn.show();
        }).mouseleave(function (e) {
          editBtn.hide();
          if (editRoot.hasClass("open")) {
            editBtn.dropdown("toggle");
          }
        });
      }
      blk.append(head);
      const body = $('<div/>').addClass('panel-body');
      // loop through buttons
      $.each(linkBlk.buttons, function (j, linkBtn) {
        let prefix;
        if (!linkBtn.title) linkBtn.title = "";
        if (!linkBtn.style) linkBtn.style = "default";
        let btn;
        if (linkBtn.menu) {
          btn = $("<div/>").addClass("btn-group btn-block");
          btn.append($("<button/>").addClass("btn btn-block btn-" + linkBtn.style + " dropdown-toggle").attr("data-toggle", "dropdown")
            .text(linkBtn.title + " ").append($("<b/>").addClass("caret")));
          const menu = $('<ul/>').addClass('dropdown-menu');
          // loop through menu items
          const urls = [];
          for (const k in linkBtn.menu) {
            const linkItem = linkBtn.menu[k];
            if (typeof(linkItem) === "string") {
              if (k > 0) menu.append($("<li/>").addClass("divider"));
              if (linkItem) menu.append($("<li/>").addClass("dropdown-header").text(linkItem));
            } else {
              if (!linkItem.title) linkItem.title = "";
              const item = $('<a/>').attr('href', linkItem.url).text(linkItem.title);
              // workaround for accessing Chrome and file URLs
              for (prefix of ["chrome", "chrome-extension", "file"]) {
                if (linkItem.url.substring(0, prefix.length + 3) === prefix + "://") {
                  item.addClass("link-chrome");
                  break;
                }
              }
              // always open in new tab
              if (linkItem.external) item.addClass("link-external");
              menu.append($("<li/>").append(item));
              urls.push(linkItem.url);
            }
          }
          // middle-click to open all
          if (that.links["behaviour"].dropdownmiddle) {
            let active = false;
            btn.mousedown(function (e) {
              active = true;
            }).mouseup(function (e) {
              if (e.which === 1 && active && e.ctrlKey) {
                e.preventDefault();
                for (const i in urls) chrome.tabs.create({url: urls[i], active: false});
                active = false;
              }
            });
          }
          btn.append(menu);
        } else {
          btn = $("<a/>").addClass("btn btn-block btn-" + linkBtn.style).attr("href", linkBtn.url).text(linkBtn.title);
          if (!linkBtn.title) btn.html("&nbsp;");
          // workaround for accessing Chrome and file URLs
          for (prefix of ["chrome", "chrome-extension", "file"]) {
            if (linkBtn.url.substring(0, prefix.length + 3) === prefix + "://") {
              btn.addClass("link-chrome");
              break;
            }
          }
          // always open in new tab
          if (linkBtn.external) btn.addClass("link-external");
        }
        body.append(btn);
      });
      blk.append(body);
      $("#links").append($("<div/>").addClass("col-lg-2 col-md-3 col-sm-4 col-xs-6").append(blk));
    });
    // drag block headings to reorder
    if (this.links["edit"].dragdrop) {
      $("#links").sortable({handle: ".panel-heading"}).on("sortupdate", function (e) {
        const old = that.links['content'];
        that.links["content"] = [];
        $(".panel", this).each(function (i, blk) {
          that.links["content"].push(old[$(blk).data("pos")]);
        });
        that.initLinks();
        chrome.storage.local.set({"links": that.links});
      });
    }
    that.fixLinkHandling();
  }
};

