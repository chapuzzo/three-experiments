import * as THREE from 'three'

function cubeHelper (position, side = 20, color) {
  let cubeGeometry = new THREE.BoxGeometry(side, side, side)
  let cubeMaterial = new THREE.MeshPhongMaterial({
    color: color || Math.floor(0xffffff * Math.random()),
    transparent: true,
    opacity: 0.9,
    wireframe: true
  })

  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.position.copy(position)

  return cube
}

export default cubeHelper
