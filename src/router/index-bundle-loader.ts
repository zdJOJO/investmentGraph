/*
webpack(bundle-loader) + react-router 实现组件的动态加载
*/
  
/* https://doc.webpack-china.org/api/module-methods#import */ 

const getComponentLazily = (importor, name = 'default') => {
  return (location, cb) => {
    importor.then( module => {
      //如果是默认模块，则是 module.default
      cb(null, module[name]);
    })
      .catch((err) => {
        console.error(`动态路由加载失败：${err}`)
      });
  }
};

const routeConfig = [
  {
    path: "/",
    getComponent: getComponentLazily(import(/* webpackChunkName: "app" */ "../pages/app")),
    indexRoute: {
      getComponent: getComponentLazily(import(/* webpackChunkName: "graph" */ "../pages/graph"))
    }
  }
];

export default routeConfig;