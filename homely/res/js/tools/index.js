(function () {
    const isChinese = /[\u4e00-\u9fa5]/;
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
                },`
    }
    function toLine(name) {
        return name.replace(/([A-Z])/g,"_$1").toLowerCase();
    }
    function clear() {
        $const.val('');
        $service.val('');
    }
    // 生成通用表单table
    const $generalTable = $('#generalTable');
    const $cols = $generalTable.find('.cols');
    const $create = $generalTable.find('.create');
    const $createFilter = $generalTable.find('.createFilter');
    const $result = $generalTable.find('.result');
    const btnCols = ['dialogForm', 'buttonReq', 'href'];
    $create.on('click', function () {
        const cols = [];
        loopCols($cols, cols, (key, val, arr) => {
            const type = arr[2];
            const col = {
                key: arr[val],
                type: type || "text",
                props: null,
                rowName: arr[key],
            };
            if (btnCols.includes(type)) {
                col.items = [{
                    url: '',
                    openAllParams: false,
                    desc: '',
                }];
            }
            return col;
        });
        $result.val(JSON.stringify(cols));
    });
    $createFilter.on('click', function () {
        const filters = [];
        loopCols($cols, filters, (key, val, arr) => {
            const type = arr[2];
            return {
                keys: [arr[val]],
                type: type || "input",// filters默认
                props: null,
                dataType: null,
                unitName: arr[key],
            };
        });
        const obj = {
            filters,
        };
        $result.val(JSON.stringify(obj));

    });
    // 生成通用表单form
    const $generalForm = $('#generalForm');
    const $form = $generalForm.find('.form');
    const $formCreate = $generalForm.find('.create');
    const $formResult = $generalForm.find('.result');
    $formCreate.on('click', function () {
        const children = [];
        loopCols($form, children, (key, val, arr) => {
            const type = arr[2];
            return {
                "deps": [],
                "uuid": uuidv4(),
                "label": arr[key],
                props: getFormProps(type),
                "output": arr[val],
                "component": type
            };
        });
        $formResult.val(JSON.stringify(...children));
    });
    function getFormProps(type) {
        switch (type) {
            case 'select':
                return {
                    "hide": false,
                    "hint": "",
                    "options": [
                        {
                            "text": "xxxxxxxx",
                            "value": "1"
                        }
                    ],
                    "disabled": false,
                    "multiple": false,
                    "required": false,
                    "clearable": false,
                    "validator": null,
                    "allowCreate": false,
                    "placeholder": "",
                    "defaultValue": null,
                };
            case 'upload-single':
                return {
                    "hide": false,
                    "hint": "",
                    "accept": "image/*",
                    "action": "/v4/operation/xxxxxxxxxxxx",
                    "maxSize": 0,
                    "pickKey": "data.url",
                    "disabled": false,
                    "required": false,
                    "emptyValue": null,
                    "previewSrc": "",
                    "downloadSrc": "",
                    "imageSrcKey": "",
                    "fileFormDataKey": "file"
                };
            default:
                return {
                    "max": 0,
                    "min": 0,
                    "hide": false,
                    "hint": "",
                    "pattern": "",
                    "autosize": true,
                    "disabled": false,
                    "required": false,
                    "validator": null,
                    "placeholder": "",
                    "defaultValue": "",
                    "showWordLimit": false
                };
        }

    }
    // key是中文表述
    function loopCols($input, array, createCol) {
        $input.val().split('\n').forEach(item => {
            const arr = item.split(/[:：\s]/g);
            // 默认 arr顺序是[中文,英文,type]
            let key = 0;
            let val = 1;
            if (!new RegExp(isChinese, 'g').test(arr[0])){
                key = 1;
                val = 0;
            }
            array.push(createCol(key, val, arr));
        });
    }
})();
