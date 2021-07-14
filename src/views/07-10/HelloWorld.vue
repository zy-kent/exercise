<template>
  <div>
    <div id="monaco">
    </div>
    <button @click="getFile">打开文件</button>
    <button @click="saveFile">保存</button>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'
export default {
  name: 'HelloWorld',
  data() {
    return {
      monacoEditor: {},
      monacoData: ''
    }
  },
  mounted() {
    this.initMonaco()
  },
  destroyed() {
    this.destroyEditor()
  },
  methods: {
    //初始化
    initMonaco() {
      this.monacoEditor=monaco.editor.create(document.getElementById("monaco"),{
        value:'',
        automaticLayout: true,
        language:"javascript"
      })
    },
    //保存文件
    async saveNewFileHandle() {
      const opts = {
        types: [{
          description: '',
          accept: {},
        }],
      };
      const file = await window.showSaveFilePicker(opts);
      const result = await file.createWritable();
      await result.write(this.monacoEditor.getValue());
      await result.close();
    },
    //读取本地文件,没做异常处理
    async getNewFileHandle() {
      const opts = {
        types: [{
          description: '',
          accept: {},
        }],
      };
      const files = await window.showOpenFilePicker(opts)
      const fileData = files[0];
      const file = await fileData.getFile();
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        this.monacoData = String(e.target.result);
        this.monacoEditor.setValue(this.monacoData)
      };
    },
    saveFile() {
      this.saveNewFileHandle()
    },
    getFile() {
      this.monacoEditor.setValue('')
      this.getNewFileHandle()
    },
    destroyEditor() {
      this.monacoEditor.dispose();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#monaco {
  height: 500px;
}
</style>
