const tools = {
  fa(icon, fw) {
    return $("<i/>").addClass("fa fa-" + icon).toggleClass("fa-fw", fw !== false);
  },
  pad(n) {
    return n < 10 ? "0" + n : n.toString();
  },
  label(text, settings) {
    return [" ", $("<span/>").addClass("menu-label").html(text)];
  }
};
