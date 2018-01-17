import { observable } from "mobx";

export default class Graph {

  baseModel: GraphModel

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

  @observable selectNode: GraphNode;

  @observable selectEdge: GraphLink;

  @observable newGraphName: string = "";

  // 检索信息
  @observable retrieveValue: string = "";

}