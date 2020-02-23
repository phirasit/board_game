import React from 'react';

const boxStyle = (color) => ({
  backgroundColor: color, 
  width: "10px", 
  height: "10px",
  display: "inline-block",
  marginRight: "5px",
});

const Hud = ({
  player: { name, color, money }, 
  isPlaying
}) => {
  return (
    <>
      <div style={boxStyle(color)} /> 
      {isPlaying ?
        <b> {name}: {money} </b>
      : 
        <> {name}: {money} </>
      }
    </>
  );
};

export default Hud;