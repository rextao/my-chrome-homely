/**
 * 
 * @Author:RexTao
 * @Date: 2018/10/30
 */
const SettingHistory = function (history) {
  this.history = history;
};
SettingHistory.prototype = {
  init(fixLinkHandling){
    this.enableHistory(fixLinkHandling);
  },
  populate(){
    $("#settings-history-enable").prop("checked", this.history["enable"]);

    $("#settings-history-limit").val(this.history["limit"])
      .prop("disabled", !this.history["enable"])
      .parent().toggleClass("text-muted", !this.history["enable"]);
    $("#settings-history-limit-value").text(this.history["limit"])
      .parent().toggleClass("text-muted", !this.history["enable"]);
  },
  save(){},
  // 在启用并且非隐藏模式使用
  // 历史只有这一个函数，故直接传递参数
  enableHistory(fixLinkHandling){
    const that = this;
    if (that.history["enable"] && !chrome.extension.inIncognitoContext) {
      chrome.permissions.contains({
        permissions: ["history"]
      }, function (has) {
        if (!has) {
          that.history["enable"] = false;
          return;
        }
        if (that.history["limit"] === 0) that.history["limit"] = 10;
        var block = true;
        $("#history-title").click(function (e) {
          // delay opening list until loaded
          if (block && !$(this).hasClass("active")) {
            e.stopPropagation();
            // request items from History API
            chrome.history.search({text: "", maxResults: that.history["limit"]}, function historyCallback(results) {
              $("#history-list").empty();
              // loop through history items
              for (var i in results) {
                var res = results[i];
                var link = $("<a/>").attr("href", res.url).text(tools.trim(res.title ? res.title : res.url, 50));
                // workaround for accessing Chrome and file URLs
                for (var prefix of ["chrome", "chrome-extension", "file"]) {
                  if (res.url.substring(0, prefix.length + 3) === prefix + "://") {
                    link.click(function (e) {
                      // normal click, not external
                      if (e.which === 1 && !e.ctrlKey && !$(this).hasClass("link-external")) {
                        chrome.tabs.update({url: this.href});
                        e.preventDefault();
                        // middle click, Ctrl+click, or set as external
                      } else if (e.which <= 2) {
                        chrome.tabs.create({url: this.href, active: $(this).hasClass("link-external")});
                        e.preventDefault();
                      }
                    });
                    break;
                  }
                }
                // add to dropdown
                $("#history-list").append($("<li/>").append(link));
              }
              $("#history-list").append($("<li/>").addClass("divider"));
              $("#history-list").append($("<li/>").append($("<a/>").addClass("link-chrome").append(tools.fa("search")).append(" 查看全部历史").attr("href", "chrome://history")));
              fixLinkHandling("#history-list");
              block = false;
              $("#history-title").click();
            });
            // reset block
          } else {
            block = true;
          }
        });
        $("#menu-history").show();
      });
    }
  },
};

