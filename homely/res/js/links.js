/**
 * 主要负责渲染链接页面，编辑模块后弹出模态框，以及模态相关点击事件
 * @Author:RexTao
 * @Date: 2018/10/31
 */
const Links = function (links, settings, settingLinks) {
  this.links = links;
  this.settings = settings;
  this.settingLinks = settingLinks
};
Links.prototype = {
  // 生成links新增的编辑模态框generate editor modal
  init(){
    const that = this;
    $("#links-editor").on("show.bs.modal", function (e) {
      var i = $(this).data("block");
      // working copy
      var linkBlk = $.extend(true, {}, that.links["content"][i]);
      $("#links-editor-title").val(linkBlk.title);
      // 渲染的主要函数，关键是组织links.content的数据结构
      // 主要是根据links.content.buttons进行渲染，
      var populateLinkEditor = function populateLinkEditor(noscroll) {
        // remember scroll position
        var scroll = noscroll ? 0 : document.body.scrollTop;
        $("#links-editor-body").empty();
        if (!linkBlk.buttons.length) {
          $("#links-editor-body").append($("<div/>").addClass("alert alert-info").text("还没有任何内容！"));
        }
        // loop through buttons in block
        $(linkBlk.buttons).each(function (j, linkBtn) {
          var blk = $("<div/>").addClass("well well-sm");
          var group = $("<div/>").addClass("input-group form-control-pad-bottom");
          // left menu
          var btnRootLeft = $("<span/>").addClass("input-group-btn");
          var optsBtn = $("<button/>").addClass("btn btn-default dropdown-toggle").attr("data-toggle", "dropdown").append($("<b/>").addClass("caret"));
          btnRootLeft.append(optsBtn);
          // 渲染弹窗的下拉选项
          var optsMenu = $("<ul/>").addClass("dropdown-menu");
          if (j > 0) {
            optsMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-double-up")).append(" Move to top").click(function (e) {
              for (var x = j; x > 0; x--) {
                linkBlk.buttons[x] = linkBlk.buttons[x - 1];
              }
              linkBlk.buttons[0] = linkBtn;
              populateLinkEditor();
            })));
            optsMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-up")).append(" Move up").click(function (e) {
              linkBlk.buttons[j] = linkBlk.buttons[j - 1];
              linkBlk.buttons[j - 1] = linkBtn;
              populateLinkEditor();
            })));
          }
          var max = linkBlk.buttons.length - 1;
          if (j < max) {
            optsMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-down")).append(" 下移").click(function (e) {
              linkBlk.buttons[j] = linkBlk.buttons[j + 1];
              linkBlk.buttons[j + 1] = linkBtn;
              populateLinkEditor();
            })));
            optsMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-double-down")).append(" 移动到最后").click(function (e) {
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
            optsMenu.append($("<li/>").append($("<a/>").append(tools.fa("level-up")).append(" 转为链接").click(function (e) {
              linkBtn.title = linkBtn.menu[0].title;
              linkBtn.url = linkBtn.menu[0].url;
              delete linkBtn.menu;
              populateLinkEditor();
            })));
            optsMenu.append($("<li/>").addClass("divider"));
          } else if (!linkBtn.menu) {
            optsMenu.append($("<li/>").append($("<a/>").append(tools.fa("level-down")).append(" 转为菜单").click(function (e) {
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
          optsMenu.append($("<li/>").append($("<a/>").append(tools.fa("trash-o")).append(" 删除").click(function (e) {
            if (confirm("确定要删除" + (linkBtn.title ? linkBtn.title : "吗") + "?")) {
              linkBlk.buttons.splice(j, 1);
              populateLinkEditor();
            }
          })));
          btnRootLeft.append(optsMenu);
          group.append(btnRootLeft);
          group.append($("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Button label").val(linkBtn.title).change(function (e) {
            linkBtn.title = $(this).val();
          }));
          // 配置颜色
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
            var cls = prompt("为button输入一个类名\n\n在设置-个性化-样式-自定义样式中可以自定义样式", "");
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
          // 添加链接或 部分（section）按钮
          if (linkBtn.menu) {
            var tbody = $("<tbody/>");
            $(linkBtn.menu).each(function (k, linkItem) {
              var tr = $("<tr/>");
              var menuOptsRoot = $("<div/>").addClass("btn-group btn-block");
              menuOptsRoot.append($("<button/>").addClass("btn btn-block btn-default dropdown-toggle").attr("data-toggle", "dropdown").append($("<b/>").addClass("caret")));
              var menuOptsMenu = $("<ul/>").addClass("dropdown-menu");
              if (k > 0) {
                menuOptsMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-double-up")).append(" 移到顶部").click(function (e) {
                  for (var x = k; x > 0; x--) {
                    linkBtn.menu[x] = linkBtn.menu[x - 1];
                  }
                  linkBtn.menu[0] = linkItem;
                  populateLinkEditor();
                })));
                menuOptsMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-up")).append(" 上移").click(function (e) {
                  linkBtn.menu[k] = linkBtn.menu[k - 1];
                  linkBtn.menu[k - 1] = linkItem;
                  populateLinkEditor();
                })));
              }
              var max = linkBtn.menu.length - 1;
              if (k < max) {
                menuOptsMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-down")).append(" 下移").click(function (e) {
                  linkBtn.menu[k] = linkBtn.menu[k + 1];
                  linkBtn.menu[k + 1] = linkItem;
                  populateLinkEditor();
                })));
                menuOptsMenu.append($("<li/>").append($("<a/>").append(tools.fa("angle-double-down")).append(" 移到底部").click(function (e) {
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
              menuOptsMenu.append($("<li/>").append($("<a/>").append(tools.fa("trash-o")).append(" 删除此条").click(function (e) {
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
                var title = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "title").val(linkItem.title).change(function (e) {
                  linkItem.title = $(this).val();
                });
                tr.append($("<td/>").append(title));
                var linkGroup = $("<div/>").addClass("input-group");
                var url = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "url").val(linkItem.url).change(function (e) {
                  linkItem.url = $(this).val();
                })
                linkGroup.append(url);
                var linkItemRootRight = $("<span/>").addClass("input-group-btn");
                var check = $("<button/>").addClass("btn btn-default dropdown-toggle").attr("data-toggle", "dropdown");
                if (linkItem.external) {
                  check.append(tools.fa("external-link")).append(" 新标签打开");
                } else {
                  check.append(tools.fa("sign-in")).append(" 当前标签打开");
                }
                check.click(function (e) {
                  linkItem.external = !linkItem.external;
                  check.empty();
                  if (linkItem.external) {
                    check.append(tools.fa("external-link")).append(" 新标签打开");
                  } else {
                    check.append(tools.fa("sign-in")).append(" 当前标签打开");
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
            menuBtnsRoot.append($("<button/>").addClass("btn btn-default").append(tools.fa("globe")).append(" 添加链接").click(function (e) {
              linkBtn.menu.push({
                title: "",
                url: ""
              });
              populateLinkEditor();
            }));
            menuBtnsRoot.append($("<button/>").addClass("btn btn-default").append(tools.fa("indent")).append(" 添加seciton").click(function (e) {
              linkBtn.menu.push("");
              populateLinkEditor();
            }));
            blk.append(menuBtnsRoot);
          } else {
            var linkGroup = $("<div/>").addClass("input-group");
            var url = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "url").val(linkBtn.url).change(function (e) {
              linkBtn.url = $(this).val();
            })
            linkGroup.append(url);
            var linkBtnRootRight = $("<span/>").addClass("input-group-btn");
            var check = $("<button/>").addClass("btn btn-default dropdown-toggle").attr("data-toggle", "dropdown");
            if (linkBtn.external) {
              check.append(tools.fa("external-link")).append(" 新标签打开");
            } else {
              check.append(tools.fa("sign-in")).append(" 当前标签打开");
            }
            check.click(function (e) {
              linkBtn.external = !linkBtn.external;
              check.empty();
              if (linkBtn.external) {
                check.append(tools.fa("external-link")).append(" 新标签打开");
              } else {
                check.append(tools.fa("sign-in")).append(" 当前标签打开");
              }
            });
            linkBtnRootRight.append(check);
            linkGroup.append(linkBtnRootRight);
            blk.append(linkGroup);
          }
          $("#links-editor-body").append(blk);
        });
        // 滚到顶部
        window.scrollTo(0, scroll);
      };
      // 新增链接，新增下拉框
      $("#links-editor-add-link").click(function (e) {
        linkBlk.buttons.push({
          title: "",
          url: "",
          style: "default"
        });
        populateLinkEditor();
      });
      $("#links-editor-add-menu").click(function (e) {
        linkBlk.buttons.push({
          title: "",
          menu: [],
          style: "default"
        });
        populateLinkEditor();
      });
      // 保存
      $("#links-editor-save").click(function (e) {
        linkBlk.title = $("#links-editor-title").val();
        that.links["content"][i] = linkBlk;
        $("#links-editor").modal("hide");
        that.settingLinks.initLinks();
        chrome.storage.local.set({"links": that.links});
      });
      // 删除
      $("#links-editor-delete").click(function (e) {
        if (confirm("确定要删除 " + (linkBlk.title ? linkBlk.title : "这个模块") + "?")) {
          that.links["content"].splice(i, 1);
          $("#links-editor").modal("hide");
          that.settingLinks.initLinks();
          chrome.storage.local.set({"links": that.links});
        }
      });
      populateLinkEditor(true);
    }).on("hide.bs.modal", function (e) {
      $("#links-editor-add-link, #links-editor-add-menu, #links-editor-save, #links-editor-delete").off("click");
    });
  }
};