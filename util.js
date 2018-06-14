function randomCoordinate (maxValue = 100){
  let range = (maxValue * 2)
  return Math.random() * range - maxValue
}

function randomPoint(maxValue){
  return [randomCoordinate(maxValue), randomCoordinate(maxValue), randomCoordinate(maxValue)]
}

export default {
  randomCoordinate,
  randomPoint
}
