<template>
  <div></div>
</template>

<script>
// @ is an alias to /src
import V1 from "./components/v1.js";
import NewsList from "./components/NewsList.js";

export default {
  name: "fishTemplate",
  data() {
    return {
      page: 1,
      count: 50,
    };
  },
  async mounted() {
    let newslist = {
      image: require('../../assets/logo.png'),
      info: {
        showImage: true,
        showDate: false,
        name: 'aaaa'
      }
    };
    const v1 = new V1().mounted(this.$el);
    v1.render(NewsList, { newslist });
  },
  methods: {
  },
};
</script>

<style lang="less">
</style>
