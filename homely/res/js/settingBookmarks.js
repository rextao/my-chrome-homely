/**
 * 设置-书签
 * @Author:RexTao
 * @Date: 2018/10/26
 */
const SettingBookmarks = function(bookmarks) {
  this.bookmarks = bookmarks;
};
SettingBookmarks.prototype = {

  populate(){
    // 书签
    // ------配置是否点击了启用按钮
    $("#settings-bookmarks-enable").prop("checked", this.bookmarks["enable"]);
    /**
     * chrome.permissions
     * 检测运行时权限，而非安装时权限
     */
    // 检查扩展是否有指定的权限
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
  },
  save(){
    this.bookmarks["enable"] = $("#settings-bookmarks-enable").prop("checked");
  }
};
