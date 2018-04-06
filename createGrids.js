import * as THREE from 'three'

function createGrids (size, divisions, position, scene) {
  let squareGrid = new THREE.GridHelper(size, divisions, 'orange', 'blue')
  squareGrid.position.copy(position)
  squareGrid.material.opacity = 0.5
  squareGrid.material.transparent = true
  scene.add(squareGrid)

  var circularGrid = new THREE.PolarGridHelper(size/2, 8, divisions/2, 64, 'green', 'red')
  circularGrid.position.copy(position)
  circularGrid.material.opacity = 0.5
  circularGrid.material.transparent = true
  scene.add(circularGrid)
}

export default createGrids