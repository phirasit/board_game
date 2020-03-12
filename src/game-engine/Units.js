let global_id = 0;
const INF = 999;

const UnitType = ({ 
  type, 
  cost, 
  attack, 
  defense, 
  mobility, 
  range,
  useOnce = false,
  attackAfterMove = false,
  airborne = false,
}) => {
  return class {
    static type = type;
    static cost = cost;
    static mobility = mobility;
    static range = range;

    constructor(player, turn) {
      this.type = type;
      this.cost = cost;
      this.attack = attack;
      this.defense = defense;
      this.mobility = mobility;
      this.range = range;
      this.useOnce = useOnce;
      this.lastMovedTurn = turn;
      this.lastAttackedTurn = turn;
      this.attackAfterMove = attackAfterMove;
      this.airborne = airborne;
      this.id = global_id++;
      this.owner = player;
    }

    getCost() {
      return this.cost;
    }

    onMove(turn) {
      this.lastMovedTurn = turn;
    }

    onAttack(turn) {
      this.lastMovedTurn = turn;
      this.lastAttackedTurn = turn;
    }

    samePos(pos1, pos2) {
      return pos1[0] === pos2[0] && pos1[1] === pos2[1];
    }

    withInRange(tile, step, useRoad = false) {
      const ownerName = this.owner.name;
      let inRangeTiles = [this.tile];
      for (let i = 0; i < step; ++i) {
        let nwInRangeTiles = [...inRangeTiles]
        function expand(tile) {
          if (tile.owner && tile.owner.name !== ownerName) return;
          tile.neighbor.forEach(tile2 => {
            if (airborne) {
              if (tile2.base && tile2.base.antimissile && tile2.base.owner.name !== ownerName) {
                return;
              }
              if (tile2.neighbor.some(tile3 => tile3.base && tile3.base.antimissile && tile3.base.owner.name !== ownerName)) {
                return;
              }
            }
            if (nwInRangeTiles.indexOf(tile2) === -1) {
              nwInRangeTiles.push(tile2);
              if (useRoad && tile2.base && tile2.base.isRoad) {
                expand(tile2)
              }
            }
          })
        }
        inRangeTiles.forEach(tile => expand(tile))
        inRangeTiles = [...nwInRangeTiles]
      }
      return inRangeTiles.some(t => this.samePos(t.pos, tile.pos))
    }

    reachable(tile) {
      return this.withInRange(tile, this.mobility, true)
    }

    inRange(tile) {
      return this.withInRange(tile, this.range, false);
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
    range: 1,
  }),
  UnitType({
    type: "engineer", 
    cost: 2, 
    attack: 0, 
    defense: 0,
    mobility: 1,
    range: 0,
  }),
  UnitType({
    type: "tank", 
    cost: 3, 
    attack: 3, 
    defense: 3,
    mobility: 2,
    range: 1,
  }),
  UnitType({
    type: "balistic tank", 
    cost: 3, 
    attack: 4, 
    defense: 2,
    mobility: 1,
    range: 2,
  }),
  UnitType({
    type: "jet fighter", 
    cost: 5, 
    attack: 5, 
    defense: 2,
    mobility: 5,
    range: 1,
    attackAfterMove: true,
    airborne: true,
  }),
  UnitType({
    type: "short-range missile", 
    cost: 4, 
    attack: INF, 
    defense: 0,
    mobility: 1,
    range: 2,
    useOnce: true,
    airborne: true,
  }),
  UnitType({
    type: "nuke", 
    cost: 10, 
    attack: INF, 
    defense: 0,
    mobility: -1,
    range: INF,
    useOnce: true,
  }),
];

let UnitList = {};
for (const idx in Units) {
  UnitList[Units[idx].type] = Units[idx];
}
UnitList.INF = INF;

export default UnitList;