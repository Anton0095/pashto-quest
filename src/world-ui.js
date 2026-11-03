/* Production navigation delegates to the sole Phaser world controller. */
function createWorld({state}) {
  return {
    startWorld:()=>state.rpg?.startWorld(),
    navigatePlace:()=>state.rpg?.navigatePlace(),
  };
}
