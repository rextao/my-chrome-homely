<template>
    <div>
        <div class="form-wrapper">
            <el-input
                    type="textarea"
                    class="textarea_width"
                    :rows="5"
                    :cols="10"
                    v-model="formData"
                    @blur="getHumpValue"
            >
            </el-input>
            <el-input
                    type="textarea"
                    class="textarea_width"
                    :rows="5"
                    :cols="10"
                    v-model="humpValue"
                    placeholder="- 转驼峰（用于components）"
            >
            </el-input>
            <el-input
                    type="textarea"
                    class="textarea_width"
                    :rows="5"
                    :cols="10"
                    v-model="humpValue2"
                    placeholder="path转驼峰（用于components）"
            >
            </el-input>
        </div>
    </div>
</template>
<script>
    export default {
        name: "index",
        data() {
            return {
                formData: '',
                humpValue: '',
            };
        },
        methods: {
             toHump(name) {
                return name.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
            },
            getHumpValue() {
                 this.humpValue = this.formData.replace(/^[a-z]/, (l) => l.toUpperCase()).replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
                 this.humpValue2 = this.formData.replace(/\/(\w)/g, (all, letter) => letter.toUpperCase());
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
</style>