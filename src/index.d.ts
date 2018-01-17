
/**
 * 逻辑图接口定义
 * */ 
interface GraphNode {
  key: string | number
  text: string | number
  fill?: string
  size?: string
  loc?: string 
}

interface GraphLink {
  points: number[]
  from: number
  to: number
  fromPort?: string
  toPort?: string
}

interface GraphModel {
  nodeDataArray: GraphNode[]
  linkDataArray: GraphLink[]
}

interface Diagram {
  id: string | number
  name: string
  model: GraphModel
}