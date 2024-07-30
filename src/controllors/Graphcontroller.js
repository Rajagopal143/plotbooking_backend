import { dbGraph } from "../db/db.js";

export const createSceneGraph = async (data, ProjectType, spaceType, url, sceneId) => {
  const { nodes, edges } = data;
  let projectNode = await dbGraph.getNodeByProjectName(ProjectType);
 console.log("projectNode",projectNode)
 let spaceNode = await dbGraph.getProjectHasSpaceType(projectNode, spaceType);
 console.log("spaceNode", spaceNode);

  const sceneNode = await dbGraph.createSceneNode({
    img: url,
    id: sceneId,
    description: nodes[0].description,
    width: nodes[1]?.Width,
    depth: nodes[1]?.Depth,
    unit: nodes[1].Unit,
  });
  const spaceToScene = await dbGraph.relationship(
    spaceNode,
    sceneNode,
    "scene"
  );
  
  let index = 0;
  for (const value of nodes) {
    if (index >= 2) {
      const data = {
        label: value.id,
        description: value.description,
      };
      const mainnode = await dbGraph.createElementNode(data);
      await dbGraph.relationship(
        sceneNode,
        mainnode,
        value.type
      );
    }
    index++;
  }
};


