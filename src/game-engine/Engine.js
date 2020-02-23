import { useState, useCallback, useMemo, useEffect } from 'react';
import Player from "./Player.js";

const useBoardGame = () => {
  const player1 = Player.usePlayer({name: 'player1', color: 'orange'});
  const player2 = Player.usePlayer({name: 'player2', color: 'lightblue'});

  const [turn, setTurn] = useState(0);
  const player = useMemo(() => {
    return !turn ? player1 : player2;
  }, [turn, player1, player2]);

  const nextMove = useCallback(() => { 
    setTurn(!turn);
    (player === player1 ? player2 : player1).addMoney(); 
  }, [turn, player, player1, player2]);

  useEffect(() => { player.addMoney(); }, []);

  return {
    players: { player, player1, player2, },
    nextMove,
  };
};

export default { useBoardGame, };