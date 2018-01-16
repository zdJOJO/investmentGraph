/*
webpack(bundle-loader) + react-router 实现组件的动态加载
*/
  
// const lazyLoadComponent = (pageName) => (location, callback) => {
//   let pageBundle = require("bundle-loader?lazy!../pages/" + pageName);
//   return pageBundle( page => callback(null, page));
// };

// https://doc.webpack-china.org/api/module-methods#import

import MyGpraph from '../pages/graph';

const routeConfig = [
  {
    path: "/",
    getComponent: ()=>import(/* webpackChunkName: "app1" */ "../pages/app"),   //lazyLoadComponent("app"),
    indexRoute: {
      component: MyGpraph
    },
    childRoutes: [
      { 
        path: "graph", 
        getComponent: ()=>import(/* webpackChunkName: "graph" */ "../pages/graph") //lazyLoadComponent("graph"),
      }
    ]
  }
];

export default routeConfig;