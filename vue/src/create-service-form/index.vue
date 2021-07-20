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
                <div>
                    <p>const的大写key前缀</p>
                    <p><el-input v-model="pre"></el-input></p>
                </div>
                <div>
                    <p>action前缀</p>
                    <p><el-input v-model="actionPre"></el-input></p>
                </div>
                <el-button type="warning" @click="handleCreateClick">生成</el-button>
            </div>
        </div>
        <div>
            <div class="tag_wrapper" v-for="(item,index) in list" :key="index">
                <el-tag type="success">{{item.actionPre}}</el-tag>：{{item.pre || '空'}}
                <i class="el-icon-circle-close" @click="handleDelete(index)"></i>
                <i class="el-icon-circle-plus-outline" @click="handleAdd(item)"></i>
            </div>
            <el-button type="warning" @click="handleSaveList">保存</el-button>
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
        window.chrome.storage.local.get("service-form-list", (store) => {
            this.list = store['service-form-list'] || [];
        });
        console.log('创建onMessage监听');
        const that = this;
        window.chrome.runtime.onMessage.addListener(function(request){
            that.getReceiveData(request);
        });
    },
    methods: {
        handleCreateClick() {
            this.setActionPreDefault();
            this.generatorData();
            this.addItemToList();
        },
        getReceiveData(request) {
            const { data } = request;
            console.log('接收到的数据：', request);
            const textData = this.textData[0].data; // 原输入框内容，避免每次都是清空
            let resultStr = '';
            try {
                const result = JSON.parse(data);
                console.log('解析数据： ', result);
                result.forEach(item => {
                    const { method, api, text } = item;
                    resultStr += `${method}@@${api} ${text}\n`;
                });
            } catch (e) {
                console.log(e);
            }
            this.textData[0].data = `${textData}\n${resultStr}`
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
            window.chrome.storage.local.set({"service-form-list": this.list});
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
                // 获取请求方法
                const methodArr = item.split('@@');
                let parseItem = item;
                let method = 'post';
                if (methodArr.length > 1) {
                    method = methodArr[0];
                    parseItem = methodArr[1];
                }
                const { transformUrl, originUrl, chinese } = this.parseOriginItem(parseItem);
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
                action += `// ${chinese}\n${upperKey}: '${originUrl}', \n`;
                newService += this.getFunc(serviceKey, upperKey, chinese, method);
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
        getFunc(name, url, chinese, method) {
            const convertUrl = url.trim().replace(/'/g, '');
            const chineseLine = chinese ? `// ${chinese}\n` : '';
            const lowerMethod = method.toLowerCase();
            if (lowerMethod === 'get') {
                return `${chineseLine} export function ${name}(payload) {
                    return http.${lowerMethod}(URL_API.${convertUrl}, {
                        params: payload
                    });
                }\n`;
            }
            return `${chineseLine} export function ${name}(payload) {
                    return http.${lowerMethod}(URL_API.${convertUrl}, payload);
                }\n`;
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
