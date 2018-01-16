/**
 * 
 * 只在Action中操作数据
 * 
*/
import mobxStates from '../store';

import GraphAction from './graphAction';

const actions = {
  graphAction: new GraphAction(mobxStates.graph)
};

export default actions;