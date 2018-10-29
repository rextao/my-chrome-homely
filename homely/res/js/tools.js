const tools = {
  fa(icon, fw) {
    return $("<i/>").addClass("fa fa-" + icon).toggleClass("fa-fw", fw !== false);
  }
};
