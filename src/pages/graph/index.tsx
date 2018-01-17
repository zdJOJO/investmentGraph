import * as React from "react";
import { observer, inject } from "mobx-react";

import './drag.less';
import {init} from './graph';

@inject("graph", "actions") @observer
class MyGpraph extends React.Component<any, any>{
  
  componentDidMount() {
    const { graph } = this.props;
    init(graph.logicDiagrams[0].model);
  }

  getFile(event){
    if(!event.target.files[0]) return;
    const { actions } = this.props;
    actions.graphAction.importGraphes(event.target.files[0]);
  }
  
  render(){
    const { graph, actions } = this.props;
    return(                 
      <div className="testColor">
        {/* <div>
          <p>
            节点信息：{JSON.stringify(graph.selectNode)}
          </p>
          <p>
            边信息：{JSON.stringify(graph.selectEdge)}
          </p>
        </div> */}

        <div className="buttons">
          <p>数据导入:  <input type="file" ref="graphes" onChange={this.getFile.bind(this)}/></p>
          <p>
            <input
              placeholder="请填写新投资图谱的名字" 
              value={graph.newGraphName} 
              disabled={graph.retrieveValue}
              onChange={(event)=>{
                actions.graphAction.handleChangeValue("newGraphName",event);
              }} 
            />
            <button disabled={graph.retrieveValue} onClick={actions.graphAction.addNewGraph}>新增逻辑图</button>  
          </p>
          <p>
            <button onClick={actions.graphAction.saveData}>保存当前图谱</button>
            <button onClick={actions.graphAction.exportGraphes}>导出所有逻辑图</button>
          </p>
        </div>
        <div className="box">
          <div className="logicDiagrams">
            <div>
              <input placeholder="输入检索信息" value={graph.retrieveValue} 
                onChange={(event)=>{
                  actions.graphAction.handleChangeValue("retrieveValue", event);
                }} 
              />
              <button onClick={actions.graphAction.handleRetrieve}>检索</button>
            </div>
            <ul>
              { graph.logicDiagrams.length > 0 &&
                graph.logicDiagrams.map( (logicDiagram: Diagram, index:number) =>
                  <li 
                    key={logicDiagram.id} 
                    className={logicDiagram.id === graph.selectGraphId ? "active" : "" }
                  >
                    <a href="javascript:void(0)" 
                      onClick={(event)=>{
                        event.preventDefault();
                        actions.graphAction.chooseLogicDiagram(logicDiagram);
                      }}
                    >
                      {logicDiagram.name}
                    </a>
                    <a
                      href="javascript:void(0)" 
                      className="edit-button"
                      onClick={(event)=>{
                        event.stopPropagation();
                        event.preventDefault();
                        actions.graphAction.editGraphName(index);
                      }}
                    >编辑名称</a>
                    <a
                      href="javascript:void(0)" 
                      className="edit-button"
                      onClick={(event)=>{
                        event.stopPropagation();
                        event.preventDefault();
                        actions.graphAction.removeGraph(logicDiagram, index);
                      }}
                    >删除</a>
                  </li>
                )
              }
              {graph.logicDiagrams.length === 0 && <li>暂无逻辑图</li>}
            </ul>
          </div>
          <div id="myPaletteDiv" />
          <div id="myDiagramDiv" />

          <div className="editPanel">
            <div style={{display: "flex"}}>
              <button>规则</button>
              <button>属性</button>
              <button>数据源</button>
            </div>
          </div>
        </div>
      </div>  		
    );
  }
}

export default MyGpraph;
// module.exports = MyGpraph;