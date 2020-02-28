import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
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
  tile: {
    x, y, pos,
    base: default_base,
  },
  player, turn,
  selectedUnit: [selectedUnit, selectedUnitAttack, resetSelectedUnit],
  setMoves, setCellUnits
}) => {
  const { money } = player;
  const [base, setBase] = useState(default_base || null);
  const [units, setUnits] = useState({});

  // calculate color
  const color = useMemo(() => {
    if (base != null && base.owner != null) {
      return base.owner.color;
    }
    const unitArr = Object.values(units);
    return unitArr.length > 0 ? unitArr[0].owner.color : null;
  }, [base, units]);

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
  const removeFromHexRef = useRef();
  useEffect(() => {
    removeFromHexRef.current = () => setUnits(newUnitList);
  }, [newUnitList, setUnits]);

  // move operation
  const moveUnitToHex = useCallback(additionalUnits => {
    let newUnits = { ...units };
    additionalUnits.forEach(unit => {
      if (unit.extractFromHex != null) {
        unit.extractFromHex(unit.id);
      } else {
        player.reduceMoney(unit.getCost());
      }
      unit.pos = pos;
      unit.lastMovedTurn = turn;
      unit.extractFromHex = () => removeFromHexRef.current();
      newUnits[unit.id] = unit;
    });
    setUnits(newUnits);
  }, [units, player, pos, turn]);

  const addSelectedUnitToHex = useCallback(() => {
    moveUnitToHex(selectedUnit);
    resetSelectedUnit();
  }, [selectedUnit, moveUnitToHex, resetSelectedUnit]);

  const moveSelections = useMemo(() => {
    if (base && player.name !== base.owner.name) {
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

    if (base != null && base.owner.name === player.name) {
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
  }, [setMoves, moveSelections, setCellUnits, units]);

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
    if (color == null || color === player.color) {
      if (selectedUnit.some(unit => !unit.reachable(pos))) {
        return null;
      }
      return (
        <Button variant="success" size="sm" onClick={addSelectedUnitToHex}>
          Move
        </Button>
      );
    } else if (selectedUnitAttack > defense) {
      if (selectedUnit.some(unit => !unit.inRange(pos))) {
        return null;
      }
      return (
        <Button variant="warning" size="sm" onClick={onAttackHex}>
          Attack
        </Button>
      );
    }
    return null;
  }, [pos, color, player, addSelectedUnitToHex, onAttackHex, selectedUnit, selectedUnitAttack, defense]);

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
}) => {
  // game state
  const tiles = useMemo(() => {
    let data = [];
    for (let i = 0; i < height; ++i) {
      data.push([]);
      for (let j = 0; j < width; ++j) {
        let tile = {
          key: `${i}#${j}`,
          pos: [i, j],
          x: i * TileSize,
          y: j * TileSize,
        };
        if (i === height - 1 && j === 0) {
          tile.base = new Bases['City'](player1);
        }
        if (i === 0 && j === width - 1) {
          tile.base = new Bases['City'](player2);
        }
        data[i].push(tile);
      }
    }
    return data;
  }, [width, height, player1, player2]);

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
