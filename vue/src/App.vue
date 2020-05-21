<template>
  <div id="app">
    <h1>快速生成service与const中的代码</h1>
    <create-service-form></create-service-form>
<!--    <h1>生成通用表单table</h1>-->
<!--    <create-general-table></create-general-table>-->
<!--    <h1>生成通用表单form</h1>-->
<!--    <create-general-form></create-general-form>-->
  </div>
</template>

<script>
import CreateServiceForm from './create-service-form';
// import CreateGeneralForm from './create-general-form';
// import CreateGeneralTable from './create-general-table';
export default {
  name: 'App',
  components: {
    CreateServiceForm,
    // CreateGeneralForm,
    // CreateGeneralTable,
  },
  data() {
    return {
      textarea: ''
    };
  },
}
</script>

<style>
  .textarea_width {
    width: 300px;
  }
</style>
