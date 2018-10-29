/**
 * 设置-书签
 * @Author:RexTao
 * @Date: 2018/10/26
 */
const SettingBookmarks = function (bookmarks) {
  this.bookmarks = bookmarks;
};
SettingBookmarks.prototype = {
  init(style, ctrlDown) {
    var bookmarksCallbacks = [];
    const that = this;
    if (this.bookmarks["enable"]) {
      chrome.permissions.contains({
        permissions: ["bookmarks"]
      }, function (has) {
        if (!has) {
          that.bookmarks["enable"] = false;
          return;
        }
        // switch to bookmarks page
        $("#menu-bookmarks").click(function (e) {
          $(".navbar-right li").removeClass("active");
          $(this).addClass("active");
          $(".main").hide();
          $("#bookmarks").show();
        });
        // show split pane if enabled
        if (that.bookmarks["split"]) {
          $("#bookmarks-block").before($("<div/>").attr("id", "bookmarks-block-folders").addClass("panel-body"));
          $("#bookmarks-block").before($("<hr/>"));
        }
        // pre-process the bookmark tree to add parent references
        var processBookmarks = function processBookmarks(root) {
          for (var i in root.children) {
            root.children[i].parent = root;
            if (root.children[i].children) processBookmarks(root.children[i]);
          }
          return root;
        };
        // request tree from Bookmarks API
        chrome.bookmarks.getTree(function bookmarksCallback(tree) {
          var root = processBookmarks(tree[0]);
          root.title = "Bookmarks";
          const bookmarks = new Bookmarks(that.bookmarks,style, ctrlDown,root);
          const layout = that.bookmarks['layout'];
          switch (layout) {
            case 'folder':
              bookmarks.layoutFolder();
              break;
            case 'flatten':
              bookmarks.layoutFlatten();
              break;
            case 'dial':
              bookmarks.layoutDial(6);
              break;
          }
          if (that.bookmarks["merge"]) {
            $("#bookmarks").fadeIn();
          } else {
            $("#menu-bookmarks").show();
          }
          // bookmark search
          bookmarks.searchEventInit();
        });
        // return any pending callbacks
        for (var i in bookmarksCallbacks) {
          bookmarksCallbacks[i].call();
        }
      });
    }
  },
  populate() {
    // 书签
    // ------检查扩展是否有指定的权限
    chrome.permissions.contains({
      permissions: ['bookmarks']
    }, function (has) {
      if (has) {
        // 根据是否启用给此行不同颜色以标识
        $('.settings-perm-bookmarks').addClass('has-success');
      } else {
        $('.settings-perm-bookmarks').addClass('has-warning');
        $('#settings-bookmarks-enable').prop('checked', false);
      }
    });
    // ------配置是否点击了启用按钮
    $('#settings-bookmarks-enable').prop('checked', this.bookmarks['enable']);
    // ------布局方式
    $(`.settings-bookmarks-layout-hook input[value=${this.bookmarks['layout']}]`).prop('checked', true);

    //-----------------------文件式布局-----------------
    // 书签显示方式
    $('#settings-bookmarks-bookmarklets').prop('checked', this.bookmarks['bookmarklets']);
    // 文件夹，点击打开下面全部网页
    $('#settings-bookmarks-foldercontents').prop('checked', this.bookmarks['foldercontents']);

    $('#settings-bookmarks-split').prop('checked', this.bookmarks['split']);
    // ---------启用书签视图下方的联动
    $('#settings-bookmarks-bookmarklets, #settings-bookmarks-foldercontents, #settings-bookmarks-split, #settings-bookmarks-merge,.settings-bookmarks-layout-hook input')
      .prop('disabled', !this.bookmarks['enable']).parent().toggleClass('text-muted', !this.bookmarks['enable']);
    // 判断布局方式是否为folder
    const islayoutFloder = this.bookmarks['layout'] === 'folder';
    $('#settings-bookmarks-layout-folder ').toggleClass('hide', !islayoutFloder);
  },
  save() {
    this.bookmarks['enable'] = $('#settings-bookmarks-enable').prop('checked');
    this.bookmarks['layout'] = $('.settings-bookmarks-layout-hook input:checked').prop('value');
    this.bookmarks['bookmarklets'] = $('#settings-bookmarks-bookmarklets').prop('checked');
    this.bookmarks['foldercontents'] = $('#settings-bookmarks-foldercontents').prop('checked');
    this.bookmarks['split'] = $('#settings-bookmarks-split').prop('checked');

  },
  // setting面板，书签-启用书签视图的checkbox
  enableChangeHandler(e) {
    $('#settings-alerts').empty();
    // grant bookmarks permissions
    if (this.checked) {
      chrome.permissions.request({
        permissions: ['bookmarks']
      }, function (success) {
        // 启用书签功能后，下面的功能才能启用
        if (success) {
          $('.settings-perm-bookmarks').removeClass('has-warning').addClass('has-success');
          $('#settings-bookmarks-bookmarklets, #settings-bookmarks-foldercontents, #settings-bookmarks-split, '
            + '#settings-bookmarks-merge,.settings-bookmarks-layout-hook input')
            .prop('disabled', false).parent().removeClass('text-muted');
          $('#settings-bookmarks-above').prop('disabled', !$('#settings-bookmarks-merge').prop('checked'))
            .parent().toggleClass('text-muted', !$('#settings-bookmarks-merge').prop('checked'));
        } else {
          var text = 'Permission denied for bookmarks.';
          $('#settings-alerts').append($('<div/>').addClass('alert alert-danger').text(text));
          $(this).prop('checked', false);
        }
      });
    } else {
      $('#settings-bookmarks-bookmarklets, #settings-bookmarks-foldercontents, #settings-bookmarks-split, '
        + '#settings-bookmarks-merge, #settings-bookmarks-above,.settings-bookmarks-layout-hook input')
        .prop('disabled', true).parent().addClass('text-muted');
    }
  },
  // 点击setting-书签-布局方式
  layoutHookChangeHander(e) {
    const val = $(this).find('input').val();
    // 只要不是选folder，则禁用settings-bookmarks-layout-folder，即隐藏这部分选项
    $('#settings-bookmarks-layout-folder ').toggleClass('hide', !(val === 'folder'));

  }

};
