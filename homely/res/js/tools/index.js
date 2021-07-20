(function () {
    const $original = $('#original');
    const $const = $('#const');
    const $service = $('#service');
    const $pre = $('#pre');
    const $actionPre = $('#actionPre');
    // 默认值
    $pre.val('test');
    $actionPre.val('/v4/operation/');
    $('#btn').on('click', function () {
        create();
    });
    $('#clear').on('click', function () {
        clear();
    });
    function create() {
        const originalVal = $original.val();
        const originalArray = originalVal.split('\n');
        const pre = $pre.val(); // 前缀
        const actionPre = $actionPre.val();
        const num = actionPre.length;
        const action = [];
        const service = [];
        originalArray.forEach(item => {
            const url = item.replace(/[\u4e00-\u9fa5]/g, '').replace(/[\s，,]*/g, '');
            const last = item.lastIndexOf('/');
            const key = url.substr(last + 1);
            const str = url.substr(num)
                .replace(/\//g, '_')
                .toUpperCase();
            const upperKey = `${pre.toUpperCase()}_${str}`;
            service.push(`${key}: '${upperKey}'`);
            action.push(`${upperKey}: '${url}'`);
        });
        $const.val(action.join(',\n'));
        $service.val(service.join(',\n'));
    }
    function clear() {
        $const.val('');
        $service.val('');
    }
})();
