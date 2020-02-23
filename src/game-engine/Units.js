let global_id = 0;
const INF = 999;

const UnitType = ({type, cost, attack, defense, mobility}) => {
  return class {
    static type = type;
    static cost = cost;
    static mobility = mobility;

    constructor(player) {
      this.type = type;
      this.cost = cost;
      this.attack = attack;
      this.defense = defense;
      this.mobility = mobility;

      this.id = global_id++;
      this.owner = player;
    }

    getCost() {
      return this.cost;
    }

    reachable(pos) {
      if (this.pos == null) return false;
      let dx = Math.abs(pos[0] - this.pos[0]);
      let dy = Math.abs(pos[1] - this.pos[1]);
      return dx + dy <= this.mobility;
    }
  };
}

const Units = [
  UnitType({
    type: "soldier", 
    cost: 1, 
    attack: 1, 
    defense: 1,
    mobility: 1,
  }),
  UnitType({
    type: "engineer", 
    cost: 2, 
    attack: 0, 
    defense: 0,
    mobility: 1,
  }),
  UnitType({
    type: "tank", 
    cost: 3, 
    attack: 3, 
    defense: 3,
    mobility: 2,
  }),
  UnitType({
    type: "balistic tank", 
    cost: 3, 
    attack: 4, 
    defense: 1,
    mobility: 1,
  }),
  UnitType({
    type: "jet fighter", 
    cost: 5, 
    attack: 4, 
    defense: 2,
    mobility: 5,
  }),
  UnitType({
    type: "short-range missile", 
    cost: 4, 
    attack: INF, 
    defense: 0,
    mobility: 2,
  }),
  UnitType({
    type: "nuke", 
    cost: 10, 
    attack: INF, 
    defense: 0,
    mobility: INF,
  }),
];

let UnitList = {};
for (const idx in Units) {
  UnitList[Units[idx].type] = Units[idx];
}

export default UnitList;