import { useState, useCallback, useMemo } from 'react';

const START_MONEY = 5;

const usePlayer = ({name, color}) => {
  const [money, setMoney] = useState(START_MONEY);
  const addMoney = useCallback(() => setMoney(money + 2), [money]);
  const reduceMoney = useCallback((offsetMoney) => setMoney(money - offsetMoney), [money]);

  const player = useMemo(() => ({
    name, 
    money, 
    addMoney, 
    reduceMoney, 
    color 
  }), [name, color, money, addMoney, reduceMoney]);

  return player;
};

export default { usePlayer, };