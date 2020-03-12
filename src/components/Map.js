import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Bases from '../game-engine/Bases.js';
import Units from '../game-engine/Units.js';
import { Button } from 'react-bootstrap';

const TileSize = 130;
const HexCoor = [[0, 0], [TileSize, 0], [TileSize, TileSize], [0, TileSize], [0, 0]];

const BackGroundImg = ({ x, y, color }) => (
  <svg height={TileSize} width={TileSize}>
    <polyline
      {...{ x, y }}
      style={{
        fill: color || 'none',
        padding: 0,
        margin: 0,
        stroke: 'black',
        strokeWidth: 5,
      }}
      type={'pointy-topped'}
      size={TileSize}
      points={HexCoor.map(pos => `${pos[0]},${pos[1]}`).join(' ')}
    />
  </svg>
);

const Hex = ({
  tile,
  player, turn,
  selectedUnit: [selectedUnit, selectedUnitAttack, resetSelectedUnit],
  setMoves, setCellUnits,
  selectedTile: [selectedTile, setSelectedTile],
}) => {
  const {
    x, y, 
    base: default_base,
    units: default_units,
  } = tile;
  const { money } = player;
  const [base, setBase] = useState(default_base || null);
  const [units, setUnits] = useState(default_units || {});

  // add money
  useEffect(() => {
    if (base && base.sameSide(player)) {
      player.addMoney(base.money); 
    }
    return () => {};
  }, [turn]);

  // calculate color
  const owner = useMemo(() => {
    if (base != null && base.owner != null) {
      return base.owner;
    }
    const unitArr = Object.values(units);
    return unitArr.length > 0 ? unitArr[0].owner : null;
  }, [base, units])
  const color = owner ? owner.color : null;

  // calculate attack
  const attack = useMemo(() => {
    const unitArr = Object.values(units);
    let atk = 0;
    unitArr.forEach(unit => (atk += unit.attack));
    return atk;
  }, [units]);

  // calculate defense
  const defense = useMemo(() => {
    const unitArr = Object.values(units)
    if (unitArr.length === 0 && base == null) {
      return null;
    }
    let def = base != null ? base.defense : 0;
    unitArr.forEach(unit => (def += unit.defense));
    return def;
  }, [units, base]);

  // remove operation
  const newUnitList = useMemo(() => {
    let newUnits = { ...units };
    selectedUnit.forEach(unit => {
      if (unit.id in newUnits) {
        delete newUnits[unit.id];
      }
    })
    return newUnits;
  }, [selectedUnit, units])
  useEffect(() => {
    const unitArr = Object.values(units);
    unitArr.forEach(unit => unit.extractFromHex = () => setUnits(newUnitList))
  }, [newUnitList, units, setUnits]);

  // move operation
  const moveUnitToHex = useCallback(additionalUnits => {
    let newUnits = { ...units };
    additionalUnits.forEach(unit => {
      if (unit.extractFromHex != null) {
        unit.extractFromHex(unit.id);
      } else {
        player.reduceMoney(unit.getCost());
      }
      unit.tile = tile;
      unit.onMove(turn);
      newUnits[unit.id] = unit;
    });
    setUnits(newUnits);
  }, [units, player, tile, turn]);

  const addSelectedUnitToHex = useCallback(() => {
    moveUnitToHex(selectedUnit);
    resetSelectedUnit();
  }, [selectedUnit, moveUnitToHex, resetSelectedUnit]);

  // cache
  useEffect(() => {
    tile.base = base;
    tile.owner = owner;
  }, [tile, base, owner])

  const moveSelections = useMemo(() => {
    if (base && !base.sameSide(player)) {
      return [];
    }

    let moves = [];
    const unitArr = Object.values(units);

    const hasEngineer = unitArr.some(unit => 
      unit.type === "engineer" && unit.owner.name === player.name
    );

    if (hasEngineer && base === null) {
      // add all base option
      moves = moves
        .concat(Object.values(Bases)
          .map(base => ({
            text: `${base.type} (${base.cost})`,
            disabled: base.cost > money,
            onClick: (player) => {
              player.reduceMoney(base.cost);
              setBase(new base(player));
            },
          }))
        );
    }

    if (base != null && base.sameSide(player)) {
      // add everything related to base
      moves = moves
        .concat(base.units
          .map(unit => ({
            text: `${unit.type} (${unit.cost})`,
            disabled: unit.cost > money,
            onClick: () => {
              player.reduceMoney(unit.cost);
              moveUnitToHex([new unit(player, turn)])
            },
          }))
        )
        .concat([{
          text: "remove base",
          onClick: () => { setBase(null); },
        }]);
    }

    return moves;
  }, [base, units, moveUnitToHex, money, player, turn]);

  const onSelectedHex = useCallback(() => { 
    setMoves(moveSelections); 
    setCellUnits(Object.values(units));
    setSelectedTile(tile);
  }, [setMoves, moveSelections, setCellUnits, units, tile, setSelectedTile]);

  // auto select
  useEffect(() => {
    if (selectedTile === tile) {
      onSelectedHex();
    }
  }, [selectedTile, tile, onSelectedHex])

  const onAttackHex = useCallback(() => {
    setBase(null);
    setUnits({});
    setCellUnits([]);
    selectedUnit
      .map(unit => {
        unit.onAttack(turn);
        return unit;
      })
      .filter(unit => unit.useOnce)
      .map(unit => unit.extractFromHex());
    resetSelectedUnit();
  }, [setUnits, selectedUnit, resetSelectedUnit, setCellUnits, turn]);

  const HexOption = useMemo(() => {
    if (selectedUnit.length === 0) return null;
    let move = null;
    if (!owner || owner.name === player.name) {
      if (selectedUnit.every(unit => unit.reachable(tile) && turn > unit.lastMovedTurn)) {
        move = (
          <Button variant="success" size="sm" onClick={addSelectedUnitToHex}>
            Move
          </Button>
        );
      }
    } 
    let attack = null;
    if (selectedUnitAttack > defense && ((owner && owner.name !== player.name) || (!owner && base))) { 
      if (selectedUnit.every(unit => unit.inRange(tile))) {
        attack = (
          <Button variant="warning" size="sm" onClick={onAttackHex}>
            Attack
          </Button>
        );
      }
    }
    return (
      <>
        {move}
        {attack}
      </>
    );
  }, [owner, base, turn, player, tile, addSelectedUnitToHex, onAttackHex, selectedUnit, selectedUnitAttack, defense]);

  return (
    <>
      <div style={{ position: "relative", width: TileSize, height: TileSize }}>
        <div style={{
          position: "absolute",
          zIndex: 0,
          top: 0,
          left: 0,
        }}>
          <BackGroundImg {...{ x, y, color }} />
        </div>
        <div style={{ 
          position: "relative", 
          zIndex: 1, 
          padding: "10px", 
          cursor: "pointer",
          width: "100%",
          height: "100%",
        }} onClick={onSelectedHex}>
          <>
            {base && (<> <b> {base.type} </b> <br /> </>)}
            {defense != null && (
              <> 
                {`ATK: ${attack >= Units.INF ? `∞` : attack} DEF: ${defense}`} <br /> 
                {`Units: ${Object.values(units).length}`}  <br/>
              </>
            )}
            {HexOption}
          </>
        </div>
      </div>
    </>
  );
};

const Map = ({
  width, height,
  players: { player, turn, player1, player2 },
  selectedUnit,
  setMoves,
  setCellUnits,
  selectedTile,
}) => {
  // game state
  const tiles = useMemo(() => {
    let data = [];
    console.log('init', height, width, player1, player2);
    for (let i = 0; i < height; ++i) {
      data.push([]);
      for (let j = 0; j < width; ++j) {
        let tile = {
          key: `${i}#${j}`,
          pos: [i, j],
          x: i * TileSize,
          y: j * TileSize,
          neighbor: [],
        };
        if (i === height - 1 && j === 0) {
          tile.base = new Bases['City'](player1);
          const eng = new Units["engineer"](player1, -1);
          eng.tile = tile 
          tile.units = {[eng.id]: eng}
        }
        if (i === 0 && j === width - 1) {
          tile.base = new Bases['City'](player2);
          const eng = new Units["engineer"](player2, -1);
          eng.tile = tile
          tile.units = {[eng.id]: eng}
        }
        data[i].push(tile);
      }
    }

    // set neighbor
    for (let i = 0; i < height; ++i) {
      for (let j = 0; j < width; ++j) {
        if (j+1 < width) {
          data[i][j].neighbor.push(data[i][j+1]);
          data[i][j+1].neighbor.push(data[i][j]);
        }
        if (i+1 < height) {
          data[i][j].neighbor.push(data[i+1][j]);
          data[i+1][j].neighbor.push(data[i][j]);
        }
      }
    }

    return data;
  }, [width, height]);

  return (
    <table style={{
      marginLeft: "auto",
      marginRight: "auto",
    }}>
      <tbody>
        {tiles.map((row, r) => (
          <tr key={r}>
            {row.map((tile, c) =>
              <td key={`${r}${c}`}>
                <Hex
                  key={`${r}${c}`}
                  tile={tile}
                  player={player}
                  turn={turn}
                  selectedUnit={selectedUnit}
                  setMoves={setMoves}
                  setCellUnits={setCellUnits}
                  selectedTile={selectedTile}
                />
              </td>
            )}
          </tr>
        ))}
        <tr>

        </tr>
      </tbody>
    </table>
  );
};

export default Map;
