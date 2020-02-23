import React, {useState, useMemo, useCallback} from 'react';
import { Button } from 'react-bootstrap';
import 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import Hud from './components/Hud.js';
import Map from './components/Map.js';
import Engine from './game-engine/Engine.js';

const Section = ({isShow, title, content}) => {
  if (!isShow) {
    return null;
  }
  return (
    <div style={{padding: "5px"}}>
      <b> {title} </b>
      <hr />
      {content}
    </div>
  )
}

const App = () => {
  const {players, nextMove} = Engine.useBoardGame();
  const {player, turn, player1, player2} = players;

  // list of selected units
  const [units, setUnits] = useState([]);
  const attack = useMemo(() => {
    let atk = 0;
    units.forEach(unit => atk += unit.attack)
    return atk;
  }, [units]);
  const addSelectedUnit = useCallback((unit) => setUnits([...units, unit]), [units, setUnits]);
  const removeSelectedUnit = useCallback((removeUnit) => {
    setUnits(units.filter(unit => unit.id !== removeUnit.id));
  }, [units, setUnits]);
  const resetSelectedUnit = useCallback(() => setUnits([]), []);

  // list of units in cell
  const [cellUnits, setCellUnits] = useState(null);
  const onClickCellUnit = useCallback((unit) => {
    if (units.includes(unit)) {
      removeSelectedUnit(unit);
    } else {
      addSelectedUnit(unit);
    }
  }, [addSelectedUnit, removeSelectedUnit, units]);

  // list of moves
  const [moves, setMoves] = useState([]);
  const onNextMove = useCallback(() => { 
    resetSelectedUnit();
    setMoves(null);
    setCellUnits(null);
    nextMove();
  }, [setMoves, nextMove, resetSelectedUnit, setCellUnits]);

  const onClickOption = useCallback(option => () => {
    setMoves(null);
    setCellUnits(null);
    option(player); 
  }, [setMoves, player]);

  return (
    <div className="row" style={{ paddingTop: "30px" }}>
      <div className="col-md-9">
        <div>
          <div style={{ padding: "10px" }}>
            <Map
              width={5} height={5}
              players={players}
              selectedUnit={[units, attack, resetSelectedUnit]}
              setMoves={setMoves}
              setCellUnits={setCellUnits}
            />
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="row">
          <div className="col-md-6">
            <div>
              <Hud
                player={player1}
                isPlaying={player.name === player1.name}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div>
              <Hud
                player={player2}
                isPlaying={player.name === player2.name}
              />
            </div>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-md-6">
            <Section
              isShow={moves}
              title={"List of usable moves"}
              content={
                <div>
                  {moves && moves.map(({ text, onClick }) => (
                    <div key={text} style={{ marginTop: "5px", marginBottom: "5px" }}>
                      <Button variant="info" size="sm" onClick={onClickOption(onClick)}>
                        {text}
                      </Button>
                    </div>
                  ))}
                </div>
              } />
          </div>
          <div className="col-md-6">
            <Section
              isShow={cellUnits}
              title={`Unit in the cell`}
              content={
                <div>
                  {cellUnits && cellUnits.map(unit => (
                    <div key={unit.id}>
                      <Button 
                        disabled={turn === unit.lastMovedTurn}
                        variant={ units.includes(unit) ? "secondary" : "outline-secondary"}
                        size="sm"
                        onClick={() => onClickCellUnit(unit)}>
                        {unit.type}
                      </Button>
                    </div>
                  ))}
                </div>
              } />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Section
              isShow={units.length > 0}
              title={
                <>
                  List of selected Units 
                  <br /> 
                  Attack = {attack}
                </>
              }
              content={
                <div>
                  <ul>
                    {units.map(unit => (
                      <div key={unit.id}>
                        <li>
                          {`${unit.type} #${unit.pos[0]},${unit.pos[1]}`}
                        </li>
                      </div>
                    ))}
                  </ul>
                  <Button variant="danger" size="sm" onClick={resetSelectedUnit}>
                    Cancel Selection
              </Button>
                </div>
              } />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Section
              isShow={true}
              title={"Other options"}
              content={
                <div>
                  <Button onClick={onNextMove}> Next Turn </Button>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div >
  );
};

export default App;
