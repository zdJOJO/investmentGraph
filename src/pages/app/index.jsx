import React, { Component } from "react";
import { Link } from "react-router";

class App extends Component{
  render(){
    return(                 
      <div className="testColor">
        {/* <ul>
          <li><Link to="/graph">Graph</Link></li>
        </ul> */}
        <section>
          {this.props.children}
        </section>
      </div>  		
    );
  }
}

//export default App;
module.exports = App;