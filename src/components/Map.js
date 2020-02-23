import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Bases from '../game-engine/Bases.js';
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
    color: default_color,
  },
  player,
  selectedUnit: [selectedUnit, attack, addSelectedUnit, resetSelectedUnit],
  setMoves,
}) => {
  const { money } = player;
  const [base, setBase] = useState(default_base || null);
  const [units, setUnits] = useState({});

  // calculate defense
  const defense = useMemo(() => {
    const unitArr = Object.values(units)
    if (unitArr.length === 0 && base == null) {
      return null;
    }
    let def = base != null ? base.defense : 0;
    unitArr.forEach(unit => {
      def += unit.defense;
    });
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
      if (unit.extractFromHexRef != null) {
        unit.extractFromHexRef.current(unit.id);
      } else {
        player.reduceMoney(unit.getCost());
      }
      unit.pos = pos;
      unit.extractFromHexRef = removeFromHexRef;
      newUnits[unit.id] = unit;
    });
    setUnits(newUnits);
  }, [units, player, pos]);

  const addSelectedUnitToHex = useCallback(() => {
    moveUnitToHex(selectedUnit);
    resetSelectedUnit();
  }, [selectedUnit, moveUnitToHex, resetSelectedUnit]);

  const color = useMemo(() => {
    if (base != null && base.owner != null) {
      return base.owner.color;
    }
    const unitArr = Object.values(units);
    return unitArr.length > 0 ? unitArr[0].owner.color : null;
  }, [base, units]);

  const moveSelections = useMemo(() => {
    if (base && player.name !== base.owner.name) {
      return [];
    }

    let moves = [];
    const unitArr = Object.values(units);

    if (unitArr.some(unit => unit.type === "engineer") && base === null) {
      // add all base option
      moves = moves
        .concat(Object.values(Bases)
          .filter(base => (base.cost <= money))
          .map(base => ({
            text: `${base.type} (${base.cost})`,
            onClick: (player) => {
              player.reduceMoney(base.cost);
              setBase(new base(player));
            },
          }))
        );
    }

    if (base != null) {
      // add everything related to base
      moves = moves
        .concat(base.units
          .filter(unit => (unit.cost <= money))
          .map(unit => ({
            text: `${unit.type} (${unit.cost})`,
            onClick: () => {
              player.reduceMoney(unit.cost);
              moveUnitToHex([new unit(player)])
            },
          }))
        )
        .concat([{
          text: "remove base",
          onClick: () => { setBase(null); },
        }]);
    }

    if (moves.length > 0) {
      console.log(pos, moves);
    }
    return moves;
  }, [base, units, moveUnitToHex, pos, money, player]);

  const onSelectedHex = useCallback(() => { setMoves(moveSelections); }, [setMoves, moveSelections]);
  const onClickUnit = useCallback(unit => { addSelectedUnit(unit); }, [addSelectedUnit]);
  const onAttackHex = useCallback(() => {
    setBase(null);
    setUnits({});
  }, [setUnits]);

  const HexOption = useMemo(() => {
    if (selectedUnit.length === 0) return null;
    if (selectedUnit.some(unit => !unit.reachable(pos))) {
      return null;
    }
    if (color == null || color === player.color) {
      return (
        <Button variant="success" size="sm" onClick={addSelectedUnitToHex}>
          Move
        </Button>
      );
    } else if (attack > defense) {
      return (
        <Button variant="warning" size="sm" onClick={onAttackHex}>
          Attack
        </Button>
      );
    }
    return null;
  }, [pos, color, player, addSelectedUnitToHex, onAttackHex, selectedUnit, attack, defense]);

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
        }} onClick={onSelectedHex}>
          <>
            {base && (<> <b> {base.type} </b> <br /> </>)}
            {defense != null && (<> {`ATK: ${attack} DEF: ${defense}`} <br /> </>)}
            {Object.values(units).map(unit  => (
              <div key={unit.id}>
                {!selectedUnit.includes(unit) ? <>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => onClickUnit(unit)}>
                    {unit.type}
                  </div>
                </> : <>
                    <b> {unit.type} </b>
                  </>}
              </div>
            ))}
            {HexOption}
          </>
        </div>
      </div>
    </>
  );
};

const Map = ({
  width, height,
  players: { player, player1, player2 },
  selectedUnit,
  setMoves,
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
          tile.color = player1.color;
          tile.base = new Bases['City'](player1);
        }
        if (i === 0 && j === width - 1) {
          tile.color = player2.color;
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
                  selectedUnit={selectedUnit}
                  setMoves={setMoves}
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
