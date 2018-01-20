
/**
 * 逻辑图接口定义
 * */ 
interface GraphNode {
  key: string | number
  text: string | number

  gourp?: string
  isGroup?: boolean
  fill?: string
  size?: string
  loc?: string 
  strokeDashArray?: number[] // 实线[0,0] | 虚线[4, 2]
  stroke?: string //边框颜色
  strokeWidth?: string  //边框粗细

  seq?:number //组件的唯一标识

  rules?: any[]
}

interface GraphLink {
  points: number[]
  from: number
  to: number
  
  text?: string
  fromPort?: string
  toPort?: string

  seq?:number //组件的唯一标识
}

interface GraphModel {
  nodeDataArray: GraphNode[]
  linkDataArray: GraphLink[]
}

interface Diagram {
  id: string | number
  seq: number // 图的唯一标识
  name: string
  model: GraphModel
}