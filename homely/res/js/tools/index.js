(function () {
    const $original = $('#original');
    const $const = $('#const');
    const $service = $('#service');
    const $serviceNew = $('#serviceNew');
    const $pre = $('#pre');
    const $actionPre = $('#actionPre');
    // 默认值
    $actionPre.val('/v4/operation/');
    $('#btn').on('click', function () {
        create();
    });
    $('#newBtn').on('click', function () {
        createNewService();
    });
    $('#clear').on('click', function () {
        clear();
    });
    /**
     * const.js常用配置是
     * TEST_CHANNEL_SLIDE_CREATE: '/v4/operation/channel/slide/create',
     * service 常用配置是
     * create: 'TEST_CHANNEL_SLIDE_CREATE',
     */
    function create() {
        const originalVal = $original.val();
        const originalArray = originalVal.split('\n');
        const pre = $pre.val(); // 前缀
        const actionPre = $actionPre.val();
        const num = actionPre.length;
        const action = [];
        const service = [];
        let newService = '';
        originalArray.forEach(item => {
            // 将文本多余字符串，尤其是删除注释
            const url = item.replace(/[\u4e00-\u9fa5].*/g, '').replace(/[\s，,]*/g, '');
            // 获取url最后一个单词，方便作为service的key
            const last = item.lastIndexOf('/');
            const key = url.substr(last + 1);
            // 获取除去开头的剩余字符串
            const str = url.substr(num)
                .replace(/\//g, '_');
            // 将str转为下划线形式（有些可能的驼峰的长单词），并全部大小
            const lineUrl = toLine(str).toUpperCase();
            // 如未提供开头的字符，则默认为空
            const preUrl = pre ? `${pre.toUpperCase()}_` : '';
            const upperKey = `${preUrl}${lineUrl}`;
            service.push(`${key}: '${upperKey}'`);
            action.push(`${upperKey}: '${url}'`);
            newService += getFunc(key, upperKey);
        });
        $const.val(action.join(',\n'));
        $service.val(service.join(',\n'));
        $serviceNew.val(newService);
    }
    // 主要是为了从旧service转为新的
    function createNewService() {
        const oldServiceVal = $service.val();
        const arr = oldServiceVal.split(',');
        let result = '';
        arr && arr.forEach(item => {
            const [key, val] = item.split(':');
            if (val) {
                result += getFunc(key, val)
            }
        });
        $serviceNew.val(result);
    }
    function getFunc(name, url) {
        const convertUrl = url.trim().replace(/'/g, '');
        return `${name}(payload) {
                    return $http.post(URL_API.${convertUrl}, payload);
                },\n`
    }
    function toLine(name) {
        return name.replace(/([A-Z])/g,"_$1").toLowerCase();
    }
    function clear() {
        $const.val('');
        $service.val('');
    }
})();
