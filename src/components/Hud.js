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
      <div style={{fontWeight: isPlaying ? "bold" : null}}>
        <div style={boxStyle(color)} /> 
        {name}
      </div>
      <div>
        Money: {money}
      </div>
    </>
  );
};

export default Hud;