/**
 * 设置-书签
 * @Author:RexTao
 * @Date: 2018/10/26
 */
const SettingBookmarks = function(bookmarks) {
  this.bookmarks = bookmarks;
};
SettingBookmarks.prototype = {
  init(){
  },
  // 书签-布局方式-扁平化布局
  layoutFlatten(root){
    $('#bookmarks').empty();
    if (!root.children.length) {
      $("#bookmarks-block").show().append($("<div/>").addClass("alert alert-info").append("<span>Nothing in this folder.</span>"));
      $("#bookmarks-block-folders").hide();
    }
    const firstMark = root.children[0];
    render(firstMark);
    $('#bookmarks').addClass('row').removeClass('panel panel-default');
  },
  populate(){
    // 书签
    // ------检查扩展是否有指定的权限
    chrome.permissions.contains({
      permissions: ["bookmarks"]
    }, function (has) {
      if (has) {
        // 根据是否启用给此行不同颜色以标识
        $(".settings-perm-bookmarks").addClass("has-success");
      } else {
        $(".settings-perm-bookmarks").addClass("has-warning");
        $("#settings-bookmarks-enable").prop("checked", false);
      }
    });
    // ------配置是否点击了启用按钮
    $("#settings-bookmarks-enable").prop("checked", this.bookmarks["enable"]);
    // ------布局方式
    $(`#settings-bookmarks-layout input[value=${this.bookmarks["layout"]}]`).prop('checked',true);
    /**
     * chrome.permissions
     * 检测运行时权限，而非安装时权限
     */



    // ---------启用书签视图下方的联动
    $("#settings-bookmarks-bookmarklets, #settings-bookmarks-foldercontents, #settings-bookmarks-split, #settings-bookmarks-merge,#settings-bookmarks-layout input")
      .prop("disabled", !this.bookmarks["enable"]).parent().toggleClass("text-muted", !this.bookmarks["enable"]);
  },
  save(){
    this.bookmarks["enable"] = $("#settings-bookmarks-enable").prop("checked");
    this.bookmarks["layout"] = $("#settings-bookmarks-layout input:checked").prop('value');

  },
  enableChangeHandler(e){
    $("#settings-alerts").empty();
    // grant bookmarks permissions
    if (this.checked) {
      chrome.permissions.request({
        permissions: ["bookmarks"]
      }, function (success) {
        // 启用书签功能后，下面的功能才能启用
        if (success) {
          $(".settings-perm-bookmarks").removeClass("has-warning").addClass("has-success");
          $("#settings-bookmarks-bookmarklets, #settings-bookmarks-foldercontents, #settings-bookmarks-split, "
            + "#settings-bookmarks-merge,#settings-bookmarks-layout input")
            .prop("disabled", false).parent().removeClass("text-muted");
          $("#settings-bookmarks-above").prop("disabled", !$("#settings-bookmarks-merge").prop("checked"))
            .parent().toggleClass("text-muted", !$("#settings-bookmarks-merge").prop("checked"));
        } else {
          var text = "Permission denied for bookmarks.";
          $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text(text));
          $(this).prop("checked", false);
        }
      });
    } else {
      $("#settings-bookmarks-bookmarklets, #settings-bookmarks-foldercontents, #settings-bookmarks-split, "
        + "#settings-bookmarks-merge, #settings-bookmarks-above,#settings-bookmarks-layout input")
        .prop("disabled", true).parent().addClass("text-muted");
    }
  }
};
