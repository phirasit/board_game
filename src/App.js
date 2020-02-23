import React, {useState, useMemo, useCallback} from 'react';
import { Button } from 'react-bootstrap';
import 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import Hud from './components/Hud.js';
import Map from './components/Map.js';
import Engine from './game-engine/Engine.js';

const App = () => {
  const {players, nextMove} = Engine.useBoardGame();
  const {player, player1, player2} = players;

  const [units, setUnits] = useState([]);
  const attack = useMemo(() => {
    let atk = 0;
    units.forEach(unit => atk += unit.attack)
    return atk;
  }, [units]);
  const addSelectedUnit = useCallback((unit) => setUnits([...units, unit]), [units, setUnits]);
  const resetSelectedUnit = useCallback(() => setUnits([]), []);

  const [moves, setMoves] = useState([]);
  const onNextMove = useCallback(() => { 
    resetSelectedUnit();
    setMoves([]);
    nextMove();
  }, [setMoves, nextMove, resetSelectedUnit]);
  const onClickOption = useCallback(option => () => { setMoves([]); option(player); }, [setMoves, player]);

  return (
    <div className="row" style={{ padding: "30px" }}>
      <div className="col-md-10">
        <div>
          <div style={{ padding: "10px" }}>
            <Map
              width={5} height={5}
              players={players}
              selectedUnit={[units, attack, addSelectedUnit, resetSelectedUnit]}
              setMoves={setMoves}
            />
          </div>
        </div>
      </div>
      <div className="col-md-2">
        <div>
          <div>
            <Hud
              player={player1}
              isPlaying={player.name === player1.name}
            />
          </div>
          <div>
            <Hud
              player={player2}
              isPlaying={player.name === player2.name}
            />
          </div>
        </div>
        <div style={{ padding: "10px"}}>
          <Button onClick={onNextMove}> Next Turn </Button>
        </div>
        <div style={{ display: "inline" }}>
          {units.length > 0 && (
            <>
              {units.map(unit => (
                <div key={unit.id} className="col-md-2">
                  {unit.type} 
                </div>
              ))}
              <Button variant="danger" onClick={resetSelectedUnit}>
                Cancel Selection
              </Button>
            </>
          )}
          {moves.map(({text, onClick}) => (
            <div key={text}>
              <Button variant="info" size="sm" onClick={onClickOption(onClick)}>
                {text}
              </Button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default App;
