import { action } from "mobx";
import Cookies from 'js-cookie';
import { load, save } from '../pages/graph/graph';
import Graph from '../store/graphStore';

export default class GraphAction {

  state: Graph

  constructor( state ){
    this.state = state;
  }

  // 添加新图谱名字
  @action handleChangeValue=(property:string, event)=>{
    this.state[property] = event.target.value;
  }

  // 新增 图谱
  @action addNewGraph=()=>{
    if(!this.state.newGraphName.trim()) return;
    let id = new Date().getTime();
    load(this.state.baseModel);
    this.state.logicDiagrams.push({
      id: id,
      name: this.state.newGraphName.trim(),
      model: [{...this.state.baseModel}]
    });
    this.state.logicDiagramsCopy.push({
      id: id,
      name: this.state.newGraphName.trim(),
      model: [{...this.state.baseModel}]
    });
    this.state.selectGraphId = id;
    this.state.newGraphName = "";
  }

  @action chooseLogicDiagram=(data: Diagram)=>{
    this.state.selectGraphId = data.id;
    load(data.model);
  }

  /* 保存 */
  @action saveData=()=>{
    save().then( res => {
      this.state.logicDiagrams.forEach( (graph, index) => {
        if(graph.id === this.state.selectGraphId){
          this.state.logicDiagrams[index].model = {
            nodeDataArray: JSON.parse(res).nodeDataArray,
            linkDataArray: JSON.parse(res).linkDataArray
          };
        }
      });

      this.state.logicDiagramsCopy.forEach( (graph, index) => {
        if(graph.id === this.state.selectGraphId){
          this.state.logicDiagramsCopy[index].model = {
            nodeDataArray: JSON.parse(res).nodeDataArray,
            linkDataArray: JSON.parse(res).linkDataArray
          };
          window.localStorage.setItem("InvestmentGraph", JSON.stringify(this.state.logicDiagramsCopy));
          alert("保存成功");
        }
      });
    });
  }

  @action setSelectNode = (node: GraphNode) => {
    this.state.selectNode = node ;
  }

  @action setSelectEdge = (edge: GraphLink) => {
    this.state.selectEdge = edge ;
  }

  /* 删除某一张逻辑图 */
  @action removeGraph = (logicDiagram:Diagram , index:number) => {
    this.state.logicDiagramsCopy.forEach( (graph, index2) => {
      if(graph.id === logicDiagram.id){
        this.state.logicDiagrams.splice(index, 1);
        this.state.logicDiagramsCopy.splice(index2, 1);
        window.localStorage.setItem("InvestmentGraph", JSON.stringify(this.state.logicDiagramsCopy));
        alert("删除成功");
      }
    });
  }

  /* 编辑图 名称 */
  @action editGraphName = (index:number) => {
    let name = window.prompt("请输入名字：") || this.state.logicDiagrams[index].name;
    this.state.logicDiagrams[index].name = name;
  }

  /* 导入 所有逻辑图 */
  importGraphes=(file)=>{

    const _thisAction = this;

    function handFile(file){
      const reader = new FileReader();
      reader.onload = function(e){
        _thisAction.state.logicDiagrams = JSON.parse(e.target["result"]);
        _thisAction.state.logicDiagramsCopy = JSON.parse(e.target["result"]);
        window.localStorage.setItem("InvestmentGraph", e.target["result"]);
      };
      reader.readAsText(file);
    }
    handFile(file);
  };

  /* 导出 所有逻辑图 */
  exportGraphes=()=>{
    var text = JSON.stringify(this.state.logicDiagrams);
    var MIME_TYPE = 'text/plain';

    var downloadFile = function() {
      window.URL = window["webkitURL"] || window.URL;

      var bb = new Blob([text], {type: MIME_TYPE});

      var a = document.createElement('a');
      a.download = `${new Date().getTime()}-投资逻辑图.txt`;
      a.href = window.URL.createObjectURL(bb);
      a.textContent = 'Download ready';
      a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
      a.click();
    };

    downloadFile();
  }

  /* 检索 */
  @action handleRetrieve=()=>{
    if(!this.state.retrieveValue){
      this.state.logicDiagrams = [...this.state.logicDiagramsCopy];
      return;
    }

    let temp: Diagram[] = [];
    this.state.logicDiagramsCopy.map( graph => {
      if(graph.name.indexOf(this.state.retrieveValue) >=0 ){
        temp.push(graph);
      }else{
        graph.model.nodeDataArray.map( node => {
          if(node.text.indexOf(this.state.retrieveValue) >= 0){
            temp.push(graph);
          }
        });
      }
    });
    this.state.logicDiagrams = temp;
  }

  /* 先登录 */
  login=()=>{
    return fetch("/reason/auth/login?username=zhangding&password=111111", {credentials: "include"})
      .then( res => {
        return res.json();
      })
      .then( json => {
        Cookies.set("operator", "zhangding");
        return Promise.resolve(json.response.token)
      })
      .catch( e => {
        console.log(e);
      })
  }

  /* 获取新闻 */ // /reason/reasonerrule/queryPage?&status=&start=1&limit=20
  @action getNewsAndRules=(token)=>{
    let urls = ["reasonerrule", "news"]
    Promise.all(
      urls.map( url => {
        return fetch(`/reason/${url}/queryPage?limit=30&start=1`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": token
          },
          credentials: "include"
        })
          .then( res => {
            return res.json();
          })
          .then( json => {
            return Promise.resolve(json.response.rows)
          })
      })
    )
      .then( values => {
        console.log(values)
        this.state.rules = values[0];
        this.state.news = values[1];
      })
      .catch( e => {
        console.log(e);
      })
      
  }

  /* 切换 */
  @action chooseTab=(tabName: string)=>{
    this.state.tab = tabName
  }

};
