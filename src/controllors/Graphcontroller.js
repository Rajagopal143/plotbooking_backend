import { dbGraph } from "../db/db.js";

export const createSceneGraph = async (data, ProjectType, spaceType, url, sceneId) => {
  console.log(ProjectType, spaceType, url, sceneId);
  const { nodes, edges } = data;

  let projectNode = await dbGraph.getNodeByProjectName(ProjectType);
 let spaceNode = await dbGraph.getProjectHasSpaceType(projectNode, spaceType);

  const sceneNode = await dbGraph.createSceneNode({
    img: url,
    sceneId: sceneId,
    description: nodes[0].description,
    width: nodes[1]?.Width,
    depth: nodes[1]?.Depth,
    unit: nodes[1].Unit,
  });
  console.log(sceneNode)
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
        type:value.type,
        description: value.description,
      };
      const mainnode = await dbGraph.createElementNode(data, sceneNode);
    }
    index++;
  }
  let i = 0;
  for (const value of edges) {
    if (index >= 2) {
      const { source, target,relationship } = value;
      await dbGraph.relationshipByLabel(source, target, relationship);
    }
    i++;
  }
};


export const getEmentsbysceneId = async(id) =>{
  
  const sceneNode = await dbGraph.queryNodeBysceneId(id)
  return s
}