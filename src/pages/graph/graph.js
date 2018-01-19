import go from 'gojs';
import actions from '../../acitons';
import { Inspector } from './DataInspector';

let myDiagram;
let myPalette;

function init(model) {
  let $ = go.GraphObject.make;  // for conciseness in defining templates
  myDiagram =
    $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
      {
        grid: $(go.Panel, "Grid",
          $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
          $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
          $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
          $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
        ),
        allowDrop: true,  // must be true to accept drops from the Palette
        "draggingTool.dragsLink": true,
        "draggingTool.isGridSnapEnabled": true,
        "linkingTool.isUnconnectedLinkValid": true,
        "linkingTool.portGravity": 20,
        "relinkingTool.isUnconnectedLinkValid": true,
        "relinkingTool.portGravity": 20,
        "relinkingTool.fromHandleArchetype":
          $(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "tomato", stroke: "darkred" }),
        "relinkingTool.toHandleArchetype":
          $(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "darkred", stroke: "tomato" }),
        "linkReshapingTool.handleArchetype":
          $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
        rotatingTool: $(TopRotatingTool),  // defined below
        "rotatingTool.snapAngleMultiple": 15,
        "rotatingTool.snapAngleEpsilon": 15,
        "undoManager.isEnabled": true,
        // allow Ctrl-G to call groupSelection()
        "commandHandler.archetypeGroupData": { text: "Group", isGroup: true, color: "blue" }
      });
  // when the document is modified, add a "*" to the title and enable the "Save" button
  myDiagram.addDiagramListener("Modified", function(e) {
    var button = document.getElementById("SaveButton");
    if (button) button.disabled = !myDiagram.isModified;
    var idx = document.title.indexOf("*");
    if (myDiagram.isModified) {
      if (idx < 0) document.title += "*";
    } else {
      if (idx >= 0) document.title = document.title.substr(0, idx);
    }
  });
  // Define a function for creating a "port" that is normally transparent.
  // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
  // and where the port is positioned on the node, and the boolean "output" and "input" arguments
  // control whether the user can draw links from or to the port.
  function makePort(name, spot, output, input) {
    // the port is basically just a small transparent square
    return $(go.Shape, "Circle",
      {
        fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
        stroke: null,
        desiredSize: new go.Size(7, 7),
        alignment: spot,  // align the port on the main Shape
        alignmentFocus: spot,  // just inside the Shape
        portId: name,  // declare this object to be a "port"
        fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
        fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
        cursor: "pointer"  // show a different cursor to indicate potential link point
      });
  }
  var nodeSelectionAdornmentTemplate =
    $(go.Adornment, "Auto",
      $(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] }),
      $(go.Placeholder)
    );
  var nodeResizeAdornmentTemplate =
    $(go.Adornment, "Spot",
      { locationSpot: go.Spot.Right },
      $(go.Placeholder),
      $(go.Shape, { alignment: go.Spot.TopLeft, cursor: "nw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      $(go.Shape, { alignment: go.Spot.Top, cursor: "n-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      $(go.Shape, { alignment: go.Spot.TopRight, cursor: "ne-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      $(go.Shape, { alignment: go.Spot.Left, cursor: "w-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      $(go.Shape, { alignment: go.Spot.Right, cursor: "e-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      $(go.Shape, { alignment: go.Spot.BottomLeft, cursor: "se-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      $(go.Shape, { alignment: go.Spot.Bottom, cursor: "s-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
      $(go.Shape, { alignment: go.Spot.BottomRight, cursor: "sw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" })
    );
  var nodeRotateAdornmentTemplate =
    $(go.Adornment,
      { locationSpot: go.Spot.Center, background: "transparent", locationObjectName: "CIRCLE" },
      $(go.Shape, "BpmnActivityLoop", 
        { 
          name: "CIRCLE", 
          cursor: "pointer", 
          desiredSize: new go.Size(7, 7), 
          fill: "lightblue", 
          stroke: "deepskyblue" 
        }
      ),
      $(go.Shape, { geometryString: "M3.5 7 L3.5 30", isGeometryPositioned: true, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] })
    );

  myDiagram.nodeTemplate =
    $(go.Node, "Spot",
      { locationSpot: go.Spot.Center },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      { selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
      { resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
      { rotatable: true, rotateAdornmentTemplate: nodeRotateAdornmentTemplate },
      new go.Binding("angle").makeTwoWay(),
      // the main object is a Panel that surrounds a TextBlock with a Shape
      $(go.Panel, "Auto",
        { name: "PANEL" },
        new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        $(go.Shape, "Rectangle",  // default figure
          {
            portId: "", // the default port: if no spot on link data, use closest side
            fromLinkable: true, toLinkable: true, cursor: "pointer",
            fill: "white",  // default color
            strokeWidth: 1.5
          },
          new go.Binding("figure"),
          new go.Binding("fill", "背景色"),
          new go.Binding("stroke", "边框颜色"),
          new go.Binding("strokeWidth", "边框宽度"),
          new go.Binding("strokeDashArray", "边框类型")
        ),
        $(go.TextBlock,
          {
            font: "bold 13pt Helvetica, Arial, sans-serif",
            stroke: "#3d3d3d",
            margin: 8,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: true
          },
          new go.Binding("text").makeTwoWay(),
          new go.Binding("stroke", "文字颜色")
        ),
      ),
      // four small named ports, one on each side:
      makePort("T", go.Spot.Top, true, true),
      makePort("L", go.Spot.Left, true, true),
      makePort("R", go.Spot.Right, true, true),
      makePort("B", go.Spot.Bottom, true, true),

      { // handle mouse enter/leave events to show/hide the ports
        mouseEnter: function(e, node) { showSmallPorts(node, true) },
        mouseLeave: function(e, node) { showSmallPorts(node, false) }
      },
      { 
        click: function (e, node) { getNode(node) }
      }
    );
  function showSmallPorts(node, show) {
    node.ports.each(function(port) {
      if (port.portId !== "") {  // don't change the default port, which is the big shape
        port.fill = show ? "rgba(0,0,0,.3)" : null;
      }
    });
  }
  var linkSelectionAdornmentTemplate =
    $(go.Adornment, "Link",
      $(go.Shape,
        // isPanelMain declares that this Shape shares the Link.geometry
        { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 })  // use selection object's strokeWidth
    );
  myDiagram.linkTemplate =
    $(go.Link,  // the whole link panel
      { selectable: true, selectionAdornmentTemplate: linkSelectionAdornmentTemplate },
      { relinkableFrom: true, relinkableTo: true, reshapable: true },
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 5,
        toShortLength: 4
      },
      new go.Binding("points").makeTwoWay(),
      $(go.Shape,  // the link path shape
        new go.Binding("stroke", "color"),
        new go.Binding("strokeDashArray", "边类型"),
        new go.Binding("strokeWidth", "边宽"),
        { isPanelMain: true, strokeWidth: 2 }
      ),
      $(go.Shape,  // the arrowhead
        { toArrow: "Standard", stroke: null, strokeWidth: 6 },
        new go.Binding("fill", "color")
      ),
      $(go.Panel, "Auto",
        // new go.Binding("visible", "isSelected").ofObject(),
        $(go.Shape, "RoundedRectangle",  // the link shape
          { fill: "rgba(152, 152, 152, 0.2)", stroke: null }),
        $(go.TextBlock,
          {
            textAlign: "center",
            font: "12pt helvetica, arial, sans-serif",
            stroke: "brown",
            margin: 1,
            minSize: new go.Size(10, NaN),
            editable: true
          },
          new go.Binding("text").makeTwoWay(),
          new go.Binding("font", "文字样式"),
          new go.Binding("stroke", "文字颜色")
        )
      ),
      { 
        click: function (e, link) { getLink(link) }
      }
    );
  
  // Groups consist of a title in the color given by the group node data
  // above a translucent gray rectangle surrounding the member parts
  myDiagram.groupTemplate =
    $(go.Group, "Vertical",
      // { 
      //   selectionObjectName: "PANEL",  // selection handle goes around shape, not label
      //   ungroupable: true
      // },  // enable Ctrl-Shift-G to ungroup a selected Group

      $(go.TextBlock,
        {
          font: "bold 19px sans-serif",
          isMultiline: false,  // don't allow newlines in text
          editable: true  // allow in-place editing by user
        },
        new go.Binding("text", "text").makeTwoWay(),
        new go.Binding("stroke", "文字颜色")),
      $(go.Panel, "Auto",
        { 
          name: "PANEL",
          desiredSize: 200
        },
        $(go.Shape, "Rectangle",  // the rectangular shape around the members
          { 
            fill: "#fff", 
            stroke: "#000", 
            strokeWidth: 1,
            strokeDashArray: [2, 4]
          },
          new go.Binding("fill", "背景色"),
          new go.Binding("stroke", "边框颜色"),
          new go.Binding("strokeWidth", "边框宽度"),
          new go.Binding("strokeDashArray", "边框类型")
        ),
        $(go.Placeholder, { padding: 10 })  // represents where the members are
      )
    );
  
  load(model);  // load an initial diagram from some JSON text
  
  /**
   *  initialize the Palette that is on the left side of the page
   * */ 
  myPalette =
    $(go.Palette, "myPaletteDiv",  // must name or refer to the DIV HTML element
      {
        maxSelectionCount: 1,
        nodeTemplateMap: myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
        groupTemplateMap: myDiagram.groupTemplateMap,
        linkTemplate: // simplify the link template, just in this Palette
          $(go.Link,
            { // because the GridLayout.alignment is Location and the nodes have locationSpot == Spot.Center,
              // to line up the Link in the same manner we have to pretend the Link has the same location spot
              locationSpot: go.Spot.Center,
              selectionAdornmentTemplate:
                $(go.Adornment, "Link",
                  { locationSpot: go.Spot.Center },
                  $(go.Shape,
                    { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 }),
                  $(go.Shape,  // the arrowhead
                    { toArrow: "Standard", stroke: null })
                )
            },
            {
              routing: go.Link.AvoidsNodes,
              curve: go.Link.JumpOver,
              corner: 5,
              toShortLength: 4
            },
            new go.Binding("points"),
            $(go.Shape, { isPanelMain: true, strokeWidth: 2 }),  // the link path shape
            $(go.Shape, { toArrow: "Standard", stroke: null })  // the arrowhead
          ),
        model: new go.GraphLinksModel([  // specify the contents of the Palette
          { text: "Start", figure: "Circle", "背景色": "#00AD5F" },
          { text: "Step" },
          { text: "Group", "背景色": "#fff0", size: "100", isGroup: true },
          // { text: "DB", figure: "Database", fill: "lightgray" },
          { text: "判断", figure: "Diamond", "背景色": "lightskyblue" },
          { text: "Comment", figure: "RoundedRectangle", "背景色": "lightyellow" },
          { text: "Triangle", figure: "Triangle", "背景色": "#c3c3c3"},
          { text: "Ellipse", figure: "Ellipse"}
        ], [
          // the Palette also has a disconnected Link, which the user can drag-and-drop
          { points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(60, 40)]) }
        ])
      });




  /**
   *  图形 编辑器
   * */ 
  let inspector = new Inspector('myInspectorDiv', myDiagram, {
    includesOwnProperties: false,
    properties: {
      "text": { },
      "key": { readOnly: true, show: Inspector.showIfPresent },
      "isGroup": { readOnly: true, show: Inspector.showIfPresent },
      "choices": { show: false },  // must not be shown at all

      // node
      "背景色": { show: Inspector.showIfNode, type: 'color' },
      "边框颜色": { show: Inspector.showIfNode, type: 'color' },
      "边框宽度": { show: Inspector.showIfNode, type: "select", choices: [1,2,4,5,6] },
      "边框类型": { show: Inspector.showIfNode, type: "select", choices: [[0,0], [2,4]] },
      "文字样式": { show: Inspector.showIfNode, type: "select", choices: [
        `15px "Fira Sans", sans-serif`, 
        `20px "Fira Sans", sans-serif`,
        `25px "Fira Sans", sans-serif`
      ]},
      "文字颜色": { show: Inspector.showIfNode, type: 'color' },
      "group": { show: Inspector.showIfNode },
      
      //link
      "color": { show: Inspector.showIfLink, type: 'color' },
      "边类型": { show: Inspector.showIfLink, type: "select", choices: [[0,0], [2,4]] },
      "边宽": { show: Inspector.showIfLink, type: "select", choices: [1,2,4,5,6,12]},
      "文字样式": { show: Inspector.showIfLink, type: "select", choices: [
        `15px "Fira Sans", sans-serif`, 
        `20px "Fira Sans", sans-serif`,
        `25px "Fira Sans", sans-serif`
      ]},
      "文字颜色": { show: Inspector.showIfLink, type: 'color' }
    }
  })

}



function TopRotatingTool() {
  go.RotatingTool.call(this);
}
go.Diagram.inherit(TopRotatingTool, go.RotatingTool);
/** @override */
TopRotatingTool.prototype.updateAdornments = function(part) {
  go.RotatingTool.prototype.updateAdornments.call(this, part);
  var adornment = part.findAdornment("Rotating");
  if (adornment !== null) {
    adornment.location = part.rotateObject.getDocumentPoint(new go.Spot(0.5, 0, 0, -30));  // above middle top
  }
};
/** @override */
TopRotatingTool.prototype.rotate = function(newangle) {
  go.RotatingTool.prototype.rotate.call(this, newangle + 90);
};
// end of TopRotatingTool class
// Show the diagram's model in JSON format that the user may edit
function save() {
  saveDiagramProperties();  // do this first, before writing to JSON
  myDiagram.isModified = false;
  return Promise.resolve(myDiagram.model.toJson());
}

function load(model) {
  if( typeof model === "object"){
    model = JSON.stringify(model);
  }
  myDiagram.model = go.Model.fromJson(model);
  loadDiagramProperties();  // do this after the Model.modelData has been brought into memory
}

function saveDiagramProperties() {
  myDiagram.model.modelData.position = go.Point.stringify(myDiagram.position);
}

function loadDiagramProperties(e) {
  // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
  var pos = myDiagram.model.modelData.position;
  if (pos) myDiagram.initialPosition = go.Point.parse(pos);
}

/* 获取节点信息 */
function getNode(node) {
  actions.graphAction.setSelectNode(node.data);
}

/* 获取边信息 */
function getLink(link) {
  actions.graphAction.setSelectEdge(link.data);
}

export { init, load, save, getNode };