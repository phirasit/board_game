import { useState, useCallback, useMemo } from 'react';
import Player from "./Player.js";

const useBoardGame = () => {
  const player1 = Player.usePlayer({name: 'Player 1', color: 'orange'});
  const player2 = Player.usePlayer({name: 'Player 2', color: 'lightblue'});

  const [turn, setTurn] = useState(0);
  const player = useMemo(() => {
    return !turn ? player1 : player2;
  }, [turn, player1, player2]);

  const [turnNum, setTurnNum] = useState(1);

  const nextMove = useCallback(() => { 
    setTurn(!turn);
    setTurnNum(turnNum+1);
  }, [turn, turnNum]);

  return {
    players: { player, turn: turnNum, player1, player2, },
    nextMove,
  };
};

export default { useBoardGame, };