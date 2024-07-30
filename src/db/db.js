import  Neo4jgraph  from "./neo4jgraph.js";



export const dbGraph = new Neo4jgraph(
  "bolt://localhost:7687",
  "neo4j",
  "123456789",
  "Scene"
);



