import Vnode from "./vnode.js";

export default class Engine {
  constructor() {
    this.nodes = new Map();
  }

  render(template, data) {
    const re1 = /<(\w+)\s*([^>]*)>([^<]*)<\/\1>/gm; //匹配<div class="a">XXX</div>
    const re2 = /<(\w+)\s*([^(/>)]*)\/>/gm; //匹配<img src="a"/>
    template = template.replace(/\n/gm, "");
    while (re1.test(template) || re2.test(template)) {
      //<div class="a">XXX</div>类型
      template = template.replace(re1, (s0, s1, s2, s3) => {
        let attr = this.parseAttribute(s2);
        let node = new Vnode(s1, attr, [], null, s3);
        this.nodes.set(node.uuid, node);
        return `(${node.uuid})`;
      });
      //<img src="a"/>类型
      template = template.replace(re2, (s0, s1, s2) => {
        let attr = this.parseAttribute(s2);
        let node = new Vnode(s1, attr, [], null, "");
        this.nodes.set(node.uuid, node);
        return `(${node.uuid})`;
      });
    }
    let rootNode = this.parseToNode(template);
    let dom = this.parseNodeToDom(rootNode, data);
    return dom;
  }

  parseToNode(template) {
    let re = /\((.*?)\)/g;
    let stack = [];
    let parent = new Vnode("root", {}, [], null, template, null);
    stack.push(parent);
    //转成成node节点
    while (stack.length > 0) {
      let pnode = stack.pop();
      let nodestr = pnode.childrenTemplate.trim();
      re.lastIndex = 0;
      [...nodestr.matchAll(re)].forEach((item) => {
        let n = this.nodes.get(item[1]);
        let newn = new Vnode(
          n.tag,
          n.attr,
          [],
          pnode,
          n.childrenTemplate,
          null
        );
        pnode.children.push(newn);
        stack.push(newn);
      });
    }
    return parent.children[0];
  }

  parseNodeToDom(root, data) {
    let fragment = document.createDocumentFragment();
    let stack = [[root, fragment, data]];
    //转成成node节点
    while (stack.length > 0) {
      let [pnode, pdom, scope] = stack.shift();
      let attr = pnode.attr.get('if') && pnode.attr.get('if').split('.')[1]
      if (!pnode.attr.get("if") || scope.newslist.info[attr]) {
        let html = this.scopehtmlParse(pnode, data, scope);
        let ele = this.createElement(pnode, html);
        this.scopeAtrrParse(ele, pnode, data, scope);
        pdom.appendChild(ele);
        pnode.children.forEach((item) => {
          stack.push([item, ele, scope]);
        });
      }
    }
    return fragment;
  }

  scopehtmlParse(node, globalScope, curentScope) {
    return node.childrenTemplate.replace(/\{\{(.*?)\}\}/g, (s0, s1) => {
      let props = s1.split(".");
      let val = curentScope.newslist.info;
      props.slice(1).forEach((item) => {
        val = val[item];
      });
      return val;
    });
  }

  scopeAtrrParse(ele, node, globalScope, curentScope) {
    for (let [key, value] of node.attr) {
      let result = /\{\{(.*?)\}\}/.exec(value);
      if (result && result.length > 0) {
        let props = result[1].split(".");
        let val = curentScope.newslist;
        props.slice(0).forEach((item) => {
          val = val[item];
        });
        ele.setAttribute(key, val);
      }
    }
  }

  createElement(node, html) {
    let dom = document.createElement(node.tag);
    for (let [key, val] of node.attr) {
      dom.setAttribute(key, val);
    }
    if (node.children.length === 0) {
      dom.innerHTML = html;
    }
    return dom;
  }

  parseAttribute(str) {
    let attr = new Map();
    str = str.trim();
    str.replace(/(\w+)\s*=['"](.*?)['"]/gm, (s0, s1, s2) => {
      attr.set(s1, s2);
      return s0;
    });
    return attr;
  }

  parseChildren(str) {
    str.replace(/\{\{(.*?)\}\}/gm, () => {});
  }
}
