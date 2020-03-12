## Battle Square

Battle Square is a Red-Alert-like board game. This game is developed by Phirasit Charoenchitseriwong. It is a turn base strategy 2-player game where each one has to obliterate their opponent. Bases and units will be built. Missile will be launched. Cities will be destroyed.

# How to run this game
1. clone this project
2. `yarn install`
3. `yarn start` # `npm` can also be used instead

# Game Rules
### Beginning
- A person is started with 1 city at the corner of the map.
- In a city, one engineer is provided.
- 5 unit of money is recevied at the beginning of the game. 

### Each turn
- Each unit can be moved or attacked once a turn (unless the unit has its special effects that contradict this rule)
- Each unit has its own attack, defence, mobility and range.
  * attack: the attack power of a unit
  * defence: the defence power of a unit
  * mobility: the range each unit can move to
  * range: the range each unit can attack

### Attacking rule
- A group of selected unit can attack iff its attack power exceeds the defense of the attacking tile.
- Some units cannot enter anti-missile defense base (namely, short-ranged missile and jet fighter).

### Winning condition
When one's bases (not units) are all destroyed, the game is ended and the other person is declared winner.

