import neo4j from "neo4j-driver";
export default class Neo4jgraph {
  constructor(url, username, password, dbName) {
    this.db = new neo4j.driver(url, neo4j.auth.basic(username, password));
    this.databaseName = dbName;
  }
  async query(query) {
    const session = this.db.session({ database: this.databaseName });
    try {
      const result = await session.run(query);
      return result;
    } catch (e) {
      return e;
    } finally {
      session.close();
    }
  }
  async queryNodesByLabel(label) {
    const query = `MATCH (p:${label}) RETURN p`;
    const result = await this.query(query);
    const properties = [];
    if (result?.records?.length != 0) {
      await result.records.forEach((element) => {
        properties.push({
          id: element.get(0).identity.low,
          properties: element.get(0).properties,
        });
      });
    }
    return properties;
  }
  async queryNodeBysceneId(id) {
    const result = await this.queryWithParams(
      `MATCH (n:Scene {sceneId: '${id}'})-[:Element]->(e)  RETURN e `
    );

    if (result.records.length === 0) {
      return null; // No room found
    }
    const data = [];
    await result.records.forEach((record) => {
      data.push({
        label: record.get("e")?.labels[0],
        description: record.get("e")?.properties?.description,
      });
    });

    return data;
  }
  async getRoomByName(roomName) {
    try {
      const result = await this.queryWithParams(
        "MATCH (room:room {name: $name}) RETURN room",
        { name: roomName }
      );

      if (result.records.length === 0) {
        return null; // No room found
      }

      // Assuming there is only one room with the given name
      const room = result?.records[0].get("room").identity?.low;
      return room;
    } catch (error) {
      console.error("Error querying room by name:", error);
      throw error;
    }
  }
  async queryWithPropValueOne(label, prop, value) {
    try {
      const result = await this.queryWithParams(
        `MATCH (n:${label} {${prop}: "${value}"}) RETURN n`
      );

      if (result.records.length === 0) {
        return null; // No room found
      }

      // Assuming there is only one room with the given name
      const room = result?.records[0].get("n").identity?.low;
      return room;
    } catch (error) {
      console.error("Error querying room by name:", error);
      throw error;
    }
  }
  async queryWithPropValueMultipel(label, prop, value) {
    try {
      const result = await this.queryWithParams(
        `MATCH (n:${label} {${prop}: "${value}"}) RETURN n`
      );

      if (result.records.length === 0) {
        return null; // No room found
      }
      const data = await result.records.forEach((record) => {
        data.push(record.get("n").properties);
      });

      // Assuming there is only one room with the given name
      return data;
    } catch (error) {
      console.error("Error querying room by name:", error);
      throw error;
    }
  }
  async allProducts() {
    const data = [];
    try {
      const query = "MATCH (p:Product) RETURN p";
      const result = await this.query(query);
      //console.log(result);
      await result.records.forEach((record) => {
        data.push(record.get("p").properties);
      });
      //console.log(data);
      return data;
    } catch (err) {
      return err;
    }
  }
  async getConnectedProducts(roomid) {
    const data = [];
    try {
      const query = `MATCH (r:room)-[:has_product]->(p:product)
      WHERE id(r) = ${roomid}
      RETURN r, collect(p) as products`;
      const result = await this.query(query);
      if (result.records.length === 0) {
        return null; // No room found
      }

      const record = result.records[0];
      const room = record.get("r").properties;
      console.log(room);
      const products = record
        .get("products")
        .map((product) => product.properties);

      //console.log(data);
      return products;
    } catch (err) {
      return err;
    }
  }

  async getProductByType() {
    const laminates = [];
    const tiles = [];
    const wallpaper = [];
    try {
      const onWallquery = `MATCH (p:Product)-[:has_catgorey]->(a:attributes)
WHERE a.value = 'laminates'
RETURN p`;
      let result = await this.query(onWallquery);
      console.log(result);
      await result.records.forEach((record) => {
        laminates.push(record.get("p").properties);
      });
      const onfloorquery = `MATCH (p:Product)-[:has_catgorey]->(a:attributes)
      WHERE a.value = 'tiles'
      RETURN p`;
      let result1 = await this.query(onfloorquery);
      await result1.records.forEach((record) => {
        tiles.push(record.get("p").properties);
      });
      const onwallpaperquery = `MATCH (p:Product)-[:has_catgorey]->(a:attributes)
      WHERE a.value = 'wallpaper'
      RETURN p`;
      let result2 = await this.query(onwallpaperquery);
      await result2.records.forEach((record) => {
        wallpaper.push(record.get("p").properties);
      });
      const data = { laminates: laminates, wallpaper: wallpaper, tiles: tiles };
      return data;
    } catch (err) {
      return err;
    }
  }
  async queryWithParams(query, params) {
    const session = this.db.session({ database: this.databaseName });
    try {
      const result = await session.run(query, params);
      return result;
    } finally {
      await session.close();
    }
  }
  async createNode(label, properties) {
    const session = this.db.session({ database: this.databaseName });
    let mainNode;
    try {
      // Check if main node with roomtype exists
      const query = `
            MATCH (n:${label})
            WHERE ${Object.keys(properties)
              .map((key) => `n.\`${key}\` = "${properties[key]}"`)
              .join(" AND ")}
            RETURN n
        `;
      const mainResult = await this.query(query, properties);

      if (mainResult?.records?.length === 0) {
        // Main node does not exist, create it
        const createMainResult = await this.queryWithParams(
          `CREATE (n:${label} {${Object.keys(properties)
            .map((key) => `\`${key}\` :"${properties[key]}"`)
            .join(" ,")}})
            RETURN n`,
          properties
        );

        mainNode = createMainResult;
      } else {
        // Main node already exists
        mainNode = mainResult;
      }

      return mainNode;
    } catch (e) {
      return e;
    } finally {
      await session.close();
    }
  }
  async createSceneNode(params) {
    const { img, description, width, depth, unit, sceneId } = params;
    try {
      let query = `MATCH (s:Scene {
  img: '${img}',
  description: '${description}',
  width: ${width},
  depth: ${depth},
  unit: '${unit}',
  sceneId:'${sceneId}'
}) RETURN s`;
      let result = await this.query(query);
      if (result?.records?.length == 0) {
        query = `CREATE (s:Scene {
    img: '${img}',
    description: '${description}',
    width: ${width},
    depth: ${depth},
    unit: '${unit}',
    sceneId:'${sceneId}'
    }) RETURN s`;
        result = await this.query(query);
      }
      console.log(result);

      return result?.records[0].get("s").identity?.low;
    } catch (err) {
      return err;
    }
  }
  async createElementNode(params, sceneNode) {
    const { label, description, type } = params;
    try {
      let query = `MATCH (s:${label} {
  description: '${description}',
  type: '${type}'
}) RETURN s`;
      let result = await this.query(query);
      if (result.records.length == 0) {
        query = `CREATE (s:${label} {
  description: '${description}',
    type: '${type}'
}) RETURN s`;
        result = await this.query(query);
      }
      const id = result?.records[0].get("s").identity?.low;
      
      if (type == 'Space') {
        let query = ` MATCH (a: { id: ${sceneNode} }), (b: { id: ${id} })
  MERGE (a)-[:space]->(b)
  RETURN a, b`;
        const run = await this.query(query);
     }

      return result?.records[0].get("s").identity?.low;
    } catch (err) {
      return err;
    }
  }
  async relationshipByLabel(start, end, relation) {
    const query = `
        MATCH (a:${start}),(b:${end})
        MERGE  (a)-[:${relation}]->(b)
        RETURN a, b
        `;
    let result = await this.query(query);
    return result;
  }
  async createRoom(label, properties) {
    const session = this.db.session({ database: this.databaseName });
    let mainNode;
    try {
      // Check if main node with roomtype exists
      const createMainResult = await this.queryWithParams(
        `CREATE (n:${label} {${Object.keys(properties)
          .map((key) => `\`${key}\` :"${properties[key]}"`)
          .join(" ,")}})
            RETURN n`,
        properties
      );

      mainNode = createMainResult?.records[0].get("n").identity?.low;

      console.log("hi", mainNode);

      if (properties.usagetype != "AHU") {
        const ahuRoom = await this.queryByRoomName(properties.ahuZone);
        await this.createMultipleRelation(ahuRoom, mainNode, "ahuzone");
      } else {
        const usagetypeNode = await this.createNode("usagetype", {
          usagetype: properties.usagetype,
        });
        await this.createMultipleRelation(usagetypeNode, mainNode, "type");
      }

      return mainNode;
    } catch (e) {
      return e;
    } finally {
      await session.close();
    }
  }
  async getNodeByProjectName(label) {
    try {
      let result = await this.query(`MATCH (r:${label}) RETURN r`);
      if (result?.records?.length === 0) {
        result = await this.query(`CREATE (r:${label}) RETURN r`);
      }

      // Assuming there is only one room with the given name
      const room = result?.records[0].get("r").identity?.low;
      return room;
    } catch (error) {
      return error;
    }
  }

  async getProjectHasSpaceType(Id, spacetype) {
    try {
      let query = `MATCH (s)
WHERE ID(s) = ${Id}
MATCH (s)-[:Space]->(n:${spacetype})
RETURN n`;
      let result = await this.query(query);
      if (result?.records?.length == 0) {
        query = `MATCH (s)
WHERE ID(s) = ${Id}
CREATE (s)-[:Space]->(n:${spacetype})
RETURN n`;
        result = await this.query(query);
      }

      console.log(result?.records[0].get("n").identity?.low);

      return result?.records[0].get("n").identity?.low;
    } catch (err) {
      return err;
    }
  }
  async createSpaceNode(SpaceName, ProjectName) {
    try {
      const query = `CREATE (r:${ProjectName})-[:_hasSpace]->(s:${SpaceName}) RETURN S`;
      const result = await this.query(query);

      return result?.records[0].get("S").identity?.low;
    } catch (err) {
      return err;
    }
  }
  async relationship(start, end, relationship) {
    try {
      var relation = null;
      relation = await this.query(`
        MATCH (a),(b)
        WHERE ID(a) = ${start} AND ID(b) = ${end}
        MERGE  (a)-[:${relationship}]->(b)
        RETURN a, b
        `);
      return relation;
    } catch (err) {
      console.log(err);
    }
  }
  async queryAHU() {
    try {
      const query = `MATCH (u:usagetype {usagetype:"AHU"})<-[:has_type]-(r:room)
      RETURN r`;
      const result = await this.query(query);
      // console.log(result.records.length)
      // if (result.records.length === 0) {
      //   return null; // No room found
      // }
      const ahulist = [];
      result.records.forEach((record) => {
        ahulist.push(record.get("r").properties["Space Name"]);
      });
      console.log(ahulist);
      return ahulist;
    } catch (err) {
      return err;
    }
  }
  async queryRoomsByAHUZone(name) {
    try {
      const query = `MATCH (n:room {name:"${name}"})<-[:has_ahuzone]-(r:room)
      RETURN r`;
      console.log(name);
      const result = await this.query(query);
      if (result.records.length === 0) {
        return null; // No room found
      }
      const ahulist = [];
      result.records.forEach((record) => ahulist.push(record.get("r")));
      //console.log(data);
      return ahulist;
    } catch (err) {
      return err;
    }
  }
  async deleteGraph() {
    try {
      const query = "MATCH (n) DETACH DELETE n";
      const result = await this.query(query);
      return result;
    } catch (err) {
      return err;
    }
  }
  async queryByRoomName(roomname) {
    try {
      const query = `MATCH (n:room {name:"${roomname}"}) RETURN n`;
      const result = await this.query(query);
      //  console.log(result)
      return result.records[0].get("n").identity.low;
    } catch (err) {
      return err;
    }
  }
  async queryProductbysize(size) {
    try {
      const query = `MATCH (n:Product)-[:has_TileSize]->(b)
WHERE b.value = '${size}'
MATCH (n)-[:has_Packing]-(p)
MATCH (n)-[:has_imgUrl]-(i)
RETURN n,p,i`;
      const result = await this.query(query);
      console.log(result);
      const data = [];
      result.records.forEach((record) => {
        const dumy = {};
        dumy["name"] = record.get("n").properties.name;
        dumy["packing"] = record.get("p").properties.value;
        dumy["url"] = record.get("i").properties.value;
        data.push(dumy);
      });
      return data;
    } catch (err) {
      return err;
    }
  }

  async createWall(label, properties) {
    try {
      const checkQuery = `
      MATCH (w:Wall)
      WHERE (w.id1 = $id1 AND w.id2 = $id2) OR (w.id1 = $id2 AND w.id2 = $id1)
      RETURN w
    `;

      const checkResult = await this.queryWithParams(checkQuery, {
        id1: properties.id1,
        id2: properties.id2,
      });

      if (checkResult.records.length > 0) {
        //console.log(checkResult.records[0].get(0).identity.low);
        return checkResult.records[0].get(0).identity.low;
      }

      // If no wall exists, create the new wall node
      const createQuery = `
      CREATE (w:${label} {
        id1: $id1,
        id2: $id2,
        startX: $startX,
        startY: $startY,
        endX: $endX,
        endY: $endY,
        wallType: $wallType,
        length: $lenght
      })
      RETURN w
    `;

      const result = await this.queryWithParams(createQuery, properties);
      const createdWall = result.records[0].get(0).identity.low;
      //console.log(createdWall);
      //console.log("hi");
      return createdWall;
    } catch (e) {
      //console.log(e);
    }
  }
  async queryNodeById(id) {
    try {
      const result = await this.query(`MATCH (n) WHERE n.id="${id}" RETURN n`);
      return result.records[0]?.get(0)?.identity.low;
    } catch (err) {
      //console.log(err);
    }
  }
  async queryNodeBySpaceNo(id) {
    try {
      const query = `MATCH (n) WHERE n.\`Space No.\` = "${id}" RETURN n`;

      const result = await this.query(query);
      console.log(result);
      return result.records[0]?.get(0)?.properties;
    } catch (err) {
      //console.log(err);
    }
  }

  async createMultipleRelation(endId, startId, type) {
    try {
      var relation = null;
      relation = await this.query(`
        MATCH (a),(b)
        WHERE ID(a) = ${startId} AND ID(b) = ${endId}
        MERGE  (a)-[:has_${type}]->(b)
        RETURN a, b
        `);
      //console.log(relation,id);

      return relation?.records[0]?.get(0).identity?.low;
    } catch (err) {
      console.log(err);
    }
  }
  async queryExposedWall(id) {
    try {
      const exposedNode = await this.query(`MATCH (n:room) WHERE id(n)=${id}
MATCH (n)-[:ifc_wall]->(w:Wall)
MATCH (w)<-[:ifc_wall]-(r:room)
WITH w, count(r) AS connection
WHERE connection =1
RETURN w`);
      const data = [];
      exposedNode.records.forEach(async (record) => {
        const miniData = {};
        miniData["wallId"] = record.get(0).identity.low;
        miniData["length"] = record.get(0).properties.length;
        const direction = await this.query(
          `MATCH (n:Wall) WHERE id(n)=${
            record.get(0).identity.low
          } MATCH (n)-[:has_direction]->(d:direction) RETURN d`
        );
        console.log(direction);
        miniData["direction"] =
          direction?.records[0]?.get("d")?.properties.direction;
        data.push(miniData);
      });

      for (let exp of data) {
      }

      return data;
    } catch (err) {
      //console.log(err);
    }
  }
  async querySharedWall(id) {
    try {
      const exposedNode = await this.query(`MATCH (n:room) WHERE id(n)=${id}
MATCH (n)-[:ifc_wall]->(w:Wall)
MATCH (w)<-[:ifc_wall]-(r:room)
WITH w, count(r) AS connection
WHERE connection >1
RETURN w`);

      const data = [];

      for (let record of exposedNode.records) {
        const miniData = {};
        miniData["wallId"] = record.get(0).identity.low;
        miniData["length"] = record.get(0).properties.length;
        miniData["sharedRoom"] = await this.exposedRoom(
          record.get(0).identity.low,
          id
        );
        data.push(miniData);
      }

      //console.log(data.sharedRoom);

      return data;
    } catch (err) {
      //console.log(err);
    }
  }
  async getWallByRoomId(id) {
    try {
      const WallNode = await this.query(`MATCH (n:room) WHERE id(n)=${id}
MATCH (n)-[:ifc_wall]->(w:Wall)
RETURN w`);
      const data = [];
      WallNode?.records.forEach((r, i) => {
        // //console.log("r",r.get(0).properties.x1);

        data.push({
          WallId: r.get(0).identity.low,
          length: r.get(0).properties.length,
        });
      });
      return data;
    } catch (err) {
      //console.log(err);
    }
  }
  async exposedRoom(id, roomId) {
    const query = await this.query(
      `MATCH (n:Wall) WHERE id(n)=${id}
        MATCH (n)<-[:ifc_wall]-(r:room)
        WHERE id(r) <> ${roomId}
        RETURN r
        `
    );
    const data = [];

    for (let node of query.records) {
      const id = node.get(0).identity.low;
      const name = node.get(0).properties.name;
      data.push({ roomId: id, RoomName: name });
    }
    return data;
  }
}
