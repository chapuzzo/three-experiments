import * as THREE from 'three'
import util from './util'

function splines(myScene, numberOfPoints = 15){

  let points = []

  for (let i = 0; i < numberOfPoints; i++) {
    points.push(new THREE.Vector3(...util.randomPoint(500)))
  }

  let splineCurve = new THREE.CatmullRomCurve3(points, true)

  let geometry = new THREE.BufferGeometry().setFromPoints(splineCurve.getPoints(300))
  let mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 'green', linewidth: 100}))

  myScene.add(mesh)
}

export default splines
