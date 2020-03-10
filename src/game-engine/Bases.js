import Units from "./Units"

let global_id = 0;

const BaseType = ({ 
  name, 
  cost, 
  defense, 
  units = [], 
  isRoad = false,
  noOnwer = false, 
  antimissile = false,
}) => {
  return class {
    static type = name;
    static cost = cost;
    static units = units;

    constructor(player) {
      this.type = name;
      this.cost = cost;
      this.units = units;
      if (!noOnwer) {
        this.owner = player;
      }

      this.defense = defense;
      this.isInField = false;
      this.isRoad = isRoad;
      this.antimissile = antimissile;

      this.id = global_id++;
    }

    getCost() {
      return this.isInField ? 0 : this.cost;
    }

    sameSide(player) {
      return this.owner && this.owner.name === player.name;
    }
  };
}

const Bases = [
  BaseType({
    name: "City", 
    cost: 10, 
    defense: 5,
    units: [Units["engineer"], Units["soldier"]]
  }),
  BaseType({
    name: "Millitary", 
    cost: 4, 
    defense: 2,
    units: [Units["soldier"], Units["tank"], Units["balistic tank"], Units["jet fighter"]],
  }),
  BaseType({
    name: "Missile", 
    cost: 4, 
    defense: 1,
    units: [Units["short-range missile"], Units["nuke"]],
  }),
  BaseType({
    name: "Anti missile", 
    cost: 3, 
    defense: 1,
    antimissile: true,
  }),
  BaseType({
    name: "Road", 
    cost: 1, 
    defense: 0,
    isRoad: true,
    noOnwer: true,
  }),
  BaseType({
    name: "Bunker", 
    cost: 2, 
    defense: 2,
    noOnwer: true,
  }),
];

let BaseObj = {}
for (const x in Bases) {
  BaseObj[Bases[x].type] = Bases[x];
}

export default BaseObj;