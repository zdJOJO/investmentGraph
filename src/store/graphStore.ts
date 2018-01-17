import { observable } from "mobx";

export default class Graph {

  token: string

  baseModel: GraphModel;

  @observable logicDiagrams = window.localStorage.getItem("InvestmentGraph") 
    ? JSON.parse(String(window.localStorage.getItem("InvestmentGraph")))
    : [
      {
        id: "",
        name: "",
        model: {}
      }
    ]

  logicDiagramsCopy = [...this.logicDiagrams];

  @observable selectGraphId: string | number = this.logicDiagrams[0].id;

  @observable selectNode: GraphNode = {
    key: "",
    text: "",
    fill: "",
    size: "",
    loc: ""
  }

  @observable selectEdge: GraphLink;

  @observable newGraphName: string = "";

  // 检索信息
  @observable retrieveValue: string = "";

  @observable tab: string = "attr" ; // rule | attr | source

  @observable news: any[] = [];

  @observable rules: any[] = [];

}