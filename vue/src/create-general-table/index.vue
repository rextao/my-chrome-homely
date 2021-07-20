<template>
    <div>
        <div class="form-wrapper">
            <div>
                <el-input
                        v-for="(item, index) in textData"
                        :key="index"
                        type="textarea"
                        class="textarea_width"
                        :rows="15"
                        :cols="10"
                        :placeholder="item.placeholder"
                        v-model="textData[index].data"
                >
                </el-input>
            </div>
            <div>
                <el-button type="warning" @click="handleCreateClick">生成Cols</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { DEFAULT_TEXT_DATA, OPTIONS } from './const';
import { REGEXP } from './../common/const';
export default {
    name: "create-service-form",
    data() {
        return {
            textData: DEFAULT_TEXT_DATA,
            actionPre: '/v4/operation/',
            pre: '',
            list: [],
        };
    },
    created() {
        this.OPTIONS = OPTIONS;
    },
    methods: {
        handleCreateClick() {
            this.setActionPreDefault();
            this.generatorData();
            this.addItemToList();
        },
        addItemToList() {
            const { pre, actionPre } = this;
            const isFind = this.list.find(item => item.pre === pre && item.actionPre === actionPre);
            if (!isFind) {
                this.list.push({
                    actionPre,
                    pre,
                });
            }
        },
        handleDelete(index) {
            this.list.splice(index,1);
        },
        handleAdd(item) {
            const { actionPre, pre } = item;
            Object.assign(this, {
                actionPre,
                pre,
            })
        },
        handleSaveList() {
        },
        generatorData() {
            const [ origin, constData, serviceData ] = this.textData;
            const arrayData = this.getArray(origin.data);
            const num = this.actionPre.length;
            let action = '';
            let newService = '';
            arrayData.forEach(item => {
                if (item === '') {
                    return;
                }
                const { transformUrl, originUrl, chinese } = this.parseOriginItem(item);
                // 获取url最后一个单词，方便作为service的key
                const last = transformUrl.lastIndexOf('/');
                const serviceKey = transformUrl.substr(last + 1);
                // 获取除去开头的剩余字符串
                const str = transformUrl.substr(num)
                    .replace(/\//g, '_');
                // 将str转为下划线形式（有些可能的驼峰的长单词），并全部大小
                const lineUrl = this.toLine(str).toUpperCase();
                // 如未提供开头的字符，则默认为空
                const preUrl = this.pre ? `${this.pre.toUpperCase()}_` : '';
                const upperKey = `${preUrl}${lineUrl}`;
                action += `${upperKey}: '${originUrl}', \n`;
                newService += this.getFunc(serviceKey, upperKey, chinese);
            });
            serviceData.data = newService;
            constData.data = action;
        },
        // 如末尾不是/ 会生成 __TV 类似格式
        setActionPreDefault() {
            const actionPre = this.actionPre;
            if (this.actionPre[actionPre.length - 1] !== '/') {
                this.actionPre = `${actionPre}/`
            }
        },
        parseOriginItem(item) {
            const chinesReg = new RegExp(`${REGEXP.CHINESE}.*`, 'g');
            // 注释
            const chinese = item.match(chinesReg);
            // 将文本多余字符串，尤其是删除注释, 原始接口
            const originUrl = item.replace(chinesReg, '').replace(/[\s，,]*/g, '');
            // 处理url中的 - 字符
            const transformUrl = originUrl.replace(/-/g, '_');
            return {
                originUrl,
                transformUrl,
                chinese: chinese && chinese[0] || ''
            };
        },
        getFunc(name, url, chinese) {
            const convertUrl = url.trim().replace(/'/g, '');
            const chineseLine = chinese ? `// ${chinese}\n` : '';
            return `    ${chineseLine}${name}(payload) {
                    return $http.post(URL_API.${convertUrl}, payload);
                },\n`
        },
        getArray(str) {
            return str.split('\n');
        },
        toLine(name) {
            return name.replace(/([A-Z])/g,"_$1").toLowerCase();
        }
    },
}

</script>

<style scoped>
    .form-wrapper {
        display: flex;
    }
    .textarea_width {
        width: 400px;
        margin-right: 10px;
    }
    .tag_wrapper {
        display: inline-block;
        padding: 5px 10px;
        margin: 5px 10px;
    }
    .el-icon-circle-close {
        cursor: pointer;
        margin-right: 10px;
        font-size: 20px;
    }
    .el-icon-circle-plus-outline {
        cursor: pointer;
        font-size: 20px;
    }
</style>
