const Bookmarks = function (bookmarks, ctrlDown, root) {
  this.bookmarks = bookmarks;
  this.ctrlDown = ctrlDown;
  this.root = root;
};
Bookmarks.prototype = {
  // 书签-布局方式
  // -----------------扁平化布局--------------------------/
  layoutFlatten() {
    const $bookmarks = $('#bookmarks');
    $bookmarks.empty();
    if (!this.root.children.length) {
      $("#bookmarks-block").show().append($("<div/>").addClass("alert alert-info").append("<span>文件夹内无内容</span>"));
      $("#bookmarks-block-folders").hide();
    }
    const firstMark = this.root.children[0];
    render(firstMark);
    $bookmarks.prepend(`
        <div class="row">
            <div class="col-sm-10 col-sm-offset-1">
              <input id="bookmarks-search" type="search" class="form-control input-sm" placeholder="搜索书签...">
              <div id="bookmarks-block-search"></div>
            </div>
        </div>`);
    $bookmarks.addClass('row').removeClass('panel panel-default');

    /*****内部函数，用于拼接dom*********/
    function render(firstMark) {
      const html = `<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6" >
                        <div class="panel panel-default sortable">`;
      const bm = [];
      $(firstMark.children).each(function (i, item) {
        let panel = `<div class="panel-heading">${item.title}</div>`;
        if (item.url) {
          bm.push(item);
        } else {
          panel += `<div class="panel-body">
                            ${renderPanelBody(item.children)}
                        </div>`;
          panel = `${html}${panel}</div></div>`;
          $('#bookmarks').append(panel);
        }
      });
      const bmHtml = `${html}
                            <div class="panel-heading">${firstMark.title}</div>
                            <div class="panel-body">
                                ${renderPanelBody(bm)}
                            </div>
                          </div></div>`;
      $('#bookmarks').prepend(bmHtml);
    }
    function renderPanelBody(node, awrapper) {
      let html = '';
      node.forEach(function (item, i) {
        // 循环书签栏
        if (item.url) {
          // 页面每条多余12个字不好看
          let title = item.title.slice(0, 12);
          // 避免无名字的标签，用一个font图标表示
          const fonts = ['trophy', 'tree', 'tint', 'sign-language', 'globe', 'gift'];
          if (!title) {
            title = `<i class="fa fa-${fonts[i % 6]}"></i>`;
          }
          if (awrapper) {
            html += `<li><a href="${item.url}" >${title}</a></li>`;
          } else {
            html += `<a class="btn btn-block btn-default" href="${item.url}" >${title}</a>`
          }

        } else {
          html += `<div class="btn-group btn-block">
                           <button class="btn btn-block btn-default dropdown-toggle" data-toggle="dropdown">格式化 <b class="caret"></b></button>
                           <ul class="dropdown-menu">
                                ${renderPanelBody(item.children, true)}
                            </ul>
                        </div>`
        }
      });
      return html;
    }
  },
  // -----------------文件夹式布局------------------------/
  layoutFolder(root) {
    const that = this;
    if(!root){
      root = this.root;
    }
    // clear current list
    $("#bookmarks-title, #bookmarks-block, #bookmarks-block-folders").empty();
    if (!root.children.length) {
      $("#bookmarks-block").show().append($("<div/>").addClass("alert alert-info").append("<span>Nothing in this folder.</span>"));
      $("#bookmarks-block-folders").hide();
    }
    $("#bookmarks-block-search, hr.bookmarks-search").remove();
    $("#bookmarks-search").val("");
    // loop through folder children and add to pane
    $(root.children).each(function (i, node) {
      var link = that.renderBookmark(node);
      var container = $("#bookmarks-block" + (that.bookmarks["split"] && link.hasClass("btn-warning") ? "-folders" : ""));
      container.append(link);
    });
    $("#bookmarks-block, #bookmarks-block-folders").each(function (i, blk) {
      $(blk).toggle(!$(blk).is(":empty"));
    });
    $("#bookmarks hr").toggle(!$("#bookmarks-block, #bookmarks-block-folders").is(":empty"));
    // open Chrome links via Tabs API
    $(".link-chrome", "#bookmarks-block").click(function (e) {
      // normal click, not external
      if (e.which === 1 && !that.ctrlDown && !$(this).hasClass("link-external")) {
        chrome.tabs.update({url: this.href});
        e.preventDefault();
        // middle click, Ctrl+click, or set as external
      } else if (e.which <= 2) {
        chrome.tabs.create({url: this.href, active: $(this).hasClass("link-external")});
        e.preventDefault();
      }
    });
    // breadcrumb navigation
    var current = root;
    var path = [root];
    while (current.parent) {
      current = current.parent;
      path.unshift(current);
    }
    $(path).each(function (i, node) {
      if (i > 0) $("#bookmarks-title").append($("<span/>").addClass("caret-right"));
      $("#bookmarks-title").append($("<button/>").addClass("btn btn-sm btn-default").text(node.title).click(function (e) {
        that.layoutFolder(node);
      }));
    });
  },
  // -----------------文件夹式布局-用于拼接dom,返回的为结尾元素
  renderBookmark(node) {
    const that = this;
    // bookmark
    if (node.url) {
      // bookmarklet
      if (node.url.substring(0, "javascript:".length) === "javascript:") {
        // 书签以javascript:开头的显示方式
        if (that.bookmarks["bookmarklets"]) {
          return $("<button/>").addClass("btn btn-info disabled").append(tools.fa("code")).append(" " + node.title);
        }
      } else {
        var link = $("<a/>").addClass("btn btn-primary").attr("href", node.url).append(tools.fa("file")).append(" " + node.title);
        // workaround for accessing Chrome and URLs
        for (var prefix of ["chrome", "chrome-extension", "file"]) {
          if (node.url.substring(0, prefix.length + 3) === prefix + "://") {
            link.addClass("link-chrome");
            break;
          }
        }
        return link;
      }
      // folder
    } else if (node.children) {
      return $("<button/>").addClass("btn btn-warning").append(tools.fa("folder" + (node.children.length ? "" : "-o"))).append(" " + node.title).click(function (e) {
        // normal click
        if (e.which === 1 && (!e.ctrlKey || !that.bookmarks["foldercontents"])) {
          that.layoutFolder(node);
          // 	鼠标左键或中间键middle click or Ctrl+click, if enabled
        } else if (e.which <= 2 && that.bookmarks["foldercontents"]) {
          $(node.children).each(function (i, child) {
            if (child.url && child.url.substring(0, "javascript:".length) !== "javascript:") chrome.tabs.create({
              url: child.url,
              active: false
            });
          });
        }
      });
    }
  },
  // -----------------dial拨号式布局
  /**
   * 书签搜索功能初始化
   * 搜索input为：bookmarks-search
   * 搜索内容放在：bookmarks-block-search，如页面中无此id会自动创建一个
   * 搜索结果为文件式布局样式
   */
  searchEventInit(){
    let timeout = 0;
    const that = this;
    $("#bookmarks-search").on("input", function (e) {
      const text = $(this).val().toLowerCase();
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(function () {
        if (!text) {
          $("#bookmarks-block-search, hr.bookmarks-search").remove();
          return;
        }
        const results = [];
        const search = function search(node) {
          // bookmark matching search
          if (node.title && node.title.toLowerCase().indexOf(text) > -1) {
            results.push(node);
          }
          // folder
          if (node.children) {
            $.each(node.children, function (i, child) {
              search(child);
            });
          }
        };
        search(that.root);
        let block = $("#bookmarks-block-search");
        if (block.length) {
          $("#bookmarks-block-search").empty();
        } else {
          block = $("<div/>").attr("id", "bookmarks-block-search").addClass("panel-body");
          $("#bookmarks .panel-heading").after($("<hr/>").addClass("bookmarks-search")).after(block);
        }
        if (results.length) {
          $.each(results, function (i, node) {
            $("#bookmarks-block-search").append(that.renderBookmark(node));
          });
          // open Chrome links via Tabs API
          $(".link-chrome", "#bookmarks-block-search").click(function (e) {
            // normal click, not external
            if (e.which === 1 && !that.ctrlDown && !$(this).hasClass("link-external")) {
              chrome.tabs.update({url: this.href});
              e.preventDefault();
              // middle click, Ctrl+click, or set as external
            } else if (e.which <= 2) {
              chrome.tabs.create({url: this.href, active: $(this).hasClass("link-external")});
              e.preventDefault();
            }
          });
        } else {
          $("#bookmarks-block-search").append($("<div/>").addClass("alert alert-info").text("No results."));
        }
      }, 200);
    });
  }
};