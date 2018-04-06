import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import Stats from 'stats.js'
import dat from 'dat.gui'
import cubeHelper from './cubeHelper'
import createGrids from './createGrids'
import CallbackMixer from './CallbackMixer'
import bufferGeometryMerger from './bufferGeometryMerger'
import {debounce, random, times} from 'lodash'

window.THREE = THREE
window.gui = new dat.GUI({closeOnTop: true, hideable: false, width: 350})
let stats = new Stats()
document.body.appendChild(stats.dom)
let clock = new THREE.Clock()

window.scene = new THREE.Scene()
let mixers = []

window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
camera.position.set(2500, 4100, 2300)

window.renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)
document.body.style.margin = 0

let gridsPosition = new THREE.Vector3(0, -100, 0)
createGrids(2000, 20, gridsPosition, scene)

window.controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(-200, 0, -200)
controls.enableKeys = false
controls.autoUpdate = false

let light = new THREE.HemisphereLight('white', 'black')
scene.add(light)

let pointLight = new THREE.PointLight('red', 5, 10000)
pointLight.castShadow = true
scene.add(pointLight)

// let lightHelper = new THREE.PointLightHelper(pointLight)
// scene.add(lightHelper)

let textArea = document.querySelector('textarea')

let textSettings = {
  height: 100,
  line: 120,
  showBoxes: false,
  followCamera: true
}

let textFolder = gui.addFolder('text')
textFolder.add(textSettings, 'height', 50, 200)
textFolder.add(textSettings, 'line', 50, 200)
textFolder.add(textSettings, 'showBoxes')
textFolder.add(textSettings, 'followCamera')

let texts = new THREE.Group()
texts.name = 'texts'
scene.add(texts)

window.objects = new THREE.Group()
objects.name = 'objects'
scene.add(objects)

// let wglrt = new THREE.WebGLRenderTarget(512, 512, {format: THREE.RGBFormat})
// let sceneMaterial = new THREE.MeshBasicMaterial({map: wglrt})
let orangeMaterial = new THREE.MeshPhongMaterial({color: 'orange'/*, opacity: 0.9, transparent: true*/})
let greenMaterial = new THREE.MeshPhongMaterial({color: 'green'/*, opacity: 0.9, transparent: true*/})


function geometries () {
  let sphereGeometry = new THREE.SphereGeometry(50, 16, 16)
  let cubeGeometry = new THREE.BoxGeometry(75, 75, 75)
  cubeGeometry.translate(25, 25, 25)

  let sphereBufferGeometry = new THREE.BufferGeometry().fromGeometry(sphereGeometry).toNonIndexed()
  let cubeBufferGeometry = new THREE.BufferGeometry().fromGeometry(cubeGeometry).toNonIndexed()

  let mergedBufferGeometry = bufferGeometryMerger(sphereBufferGeometry, cubeBufferGeometry)
  let mergedBufferMesh = new THREE.Mesh(mergedBufferGeometry, greenMaterial)
  mergedBufferMesh.position.set(-100, 100, -100)

  let mergedGeometry = new THREE.Geometry()
  mergedGeometry.merge(cubeGeometry)
  mergedGeometry.merge(sphereGeometry)

  let geometrySettings = {
    amount: 100,
    addMergedBufferGeometries() {
      addClones(mergedBufferGeometry, this.amount, objects, greenMaterial)
    },
    addMergedGeometries() {
      addClones(mergedGeometry, this.amount, objects, orangeMaterial)
    },
    clearObjects() {
      clearChildren(objects)
    }
  }

  let geometriesFolder = gui.addFolder('geometries')
  geometriesFolder.add(objects.children, 'length').name('current amount').listen()
  geometriesFolder.add(geometrySettings, 'amount', 1, 5000, 50).name('geometries to merge')
  geometriesFolder.add(geometrySettings, 'addMergedBufferGeometries')
  geometriesFolder.add(geometrySettings, 'addMergedGeometries')
  geometriesFolder.add(geometrySettings, 'clearObjects')
  geometriesFolder.open()

  function addClones (geometry, amount, parent, material) {
    let clones = Array(amount).fill().map(() => {
      let clonedGeometry = geometry.clone()

      clonedGeometry.translate(
        random(-1000, 1000),
        random(0, 2000),
        random(-1000, 1000)
      )

      return clonedGeometry
    })

    let mergedClones

    if (geometry.isBufferGeometry) {
      mergedClones = bufferGeometryMerger(...clones)
    }
    else {
      mergedClones = new THREE.Geometry()
      clones.forEach(clone => mergedClones.merge(clone))
    }

    let mergedMesh = new THREE.Mesh(mergedClones, material)
    mergedMesh.castShadow = true
    mergedMesh.receiveShadow = true

    parent.add(mergedMesh)
  }

  function clearChildren (group) {
    group.children.forEach(child => {
      if (child.geometry)
        child.geometry.dispose()

      child.parent = null
    })

    group.children.length = 0
  }
}

gui.add({geometries}, 'geometries').onChange(function(){this.remove()})


function rollerCoaster() {

  let rollerCoaster = new THREE.Group()
  scene.add(rollerCoaster)

  let vertexes = new Array(10).fill().map(() => {
    return new THREE.Vector3(
      random(-1000, 1000),
      random(0, 2000),
      random(-1000, 1000)
    )
  })

  let curve = new THREE.CatmullRomCurve3(vertexes, true)

  let points = curve.getPoints(3000)
  let geometry = new THREE.BufferGeometry().setFromPoints(points)
  let splineLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({
    color: 'orange',
    linewidth: 2
  }))

  rollerCoaster.add(splineLine)

  let cube = cubeHelper(curve.getPointAt(0))
  rollerCoaster.add(cube)

  // let otherCube = cubeHelper(curve.getPointAt(0))
  // rollerCoaster.add(otherCube)

  let cubeMotionSettings = {
    position: 0,
    timePerLoop: 30,
    enabled: true,
    cameraTracking: true,
    cameraLookAt: true,
    applyMatrixTracking: true
  }

  let updateCubePosition = function (delta) {
    cubeMotionSettings.position = delta
    cube.position.copy(curve.getPointAt(delta))
    let x = curve.getPointAt((delta + 0.0001) % 1)
    cube.lookAt(x)
  }

  let updateCameraPosition = function (delta) {
    let cubePosition = curve.getPointAt(delta).clone()
    let offset = new THREE.Vector3(-100, 150, -100)
    let offsettedPosition = cubePosition.add(offset)

    if (cubeMotionSettings.applyMatrixTracking) {
      offsettedPosition.applyMatrix4(cube.matrixWorld)
    }

    // otherCube.position.copy(offsettedPosition)
    camera.position.copy(offsettedPosition)
    controls.update()
  }

  window.cubeMovementMixer = new CallbackMixer(ratio => {
    if (cubeMotionSettings.enabled)
      updateCubePosition(ratio)

    if (cubeMotionSettings.cameraTracking)
      updateCameraPosition(ratio)

    if (cubeMotionSettings.cameraLookAt){
      camera.lookAt(cube.position)
    }

  }, 30, Infinity)

  let cubeMotionFolder = gui.addFolder('cube motion')
  cubeMotionFolder.open()

  cubeMotionFolder.add(cubeMotionSettings, 'position', 0, 0.9999, 0.001).onChange(value => {
    updateCubePosition(value)
  }).listen()

  cubeMotionFolder.add(cubeMotionSettings, 'timePerLoop', 0, 60, 0.5).onChange(value => {
    cubeMovementMixer.setDuration(value)
  })

  cubeMotionFolder.add(cubeMotionSettings, 'enabled').onChange(() => {
    cubeMovementMixer.pause()
  })

  cubeMotionFolder.add(cubeMotionSettings, 'cameraTracking')
  cubeMotionFolder.add(cubeMotionSettings, 'cameraLookAt')
  cubeMotionFolder.add(cubeMotionSettings, 'applyMatrixTracking')

  mixers.push(cubeMovementMixer)


  // let controlsFolder = gui.addFolder('controls')
  // controlsFolder.add(controls, 'minPolarAngle', 0, 2*Math.PI)
  // controlsFolder.add(controls, 'maxPolarAngle', 0, 2*Math.PI)
  // controlsFolder.add(controls, 'minAzimuthAngle', 0, 2*Math.PI)
  // controlsFolder.add(controls, 'maxAzimuthAngle', 0, 2*Math.PI)
}

gui.add({rollerCoaster}, 'rollerCoaster').onChange(function(){this.remove()})


// function experiments (geometry) {
//   let originalPositions = geometry.attributes.normal.clone()

//   let experimentsFolder = gui.addFolder('experiments')
//   experimentsFolder.add({doIt() {

//     geometry.attributes.normal.array.forEach((value, idx) =>{
//       geometry.attributes.normal.array[idx] = random(0, 1)
//     })

//     geometry.attributes.normal.needsUpdate = true
//   }}, 'doIt')

//   experimentsFolder.add({restore() {
//     geometry.attributes.normal.copy(originalPositions)
//     geometry.attributes.normal.needsUpdate = true
//   }}, 'restore')
// }

// gui.add({experiments}, 'experiments')

let fontLoader = new THREE.FontLoader()
// fontLoader.load('./assets/fonts/Anonymous Pro_Regular.json', (font) => {
fontLoader.load('./assets/fonts/Luis2_Medium.json', (font) => {

  let debouncedKeyDown = debounce(event => {

    texts.traverse(child => {
      if (child.isMesh)
        child.geometry.dispose()
    })
    texts.children.length = 0

    let rows = event.target.value.split(/\n/)

    rows.forEach((row, i) => {
      let textGeometry = new THREE.TextGeometry(row, {
        font,
        size: textSettings.height,
        height: 5,
        bevelEnabled: true,
        bevelThickness: 5,
        bevelSize: 3
      })
      textGeometry.center()

      let text = new THREE.Mesh(textGeometry, orangeMaterial)
      text.name = row

      if (textSettings.showBoxes) {
        let bb = new THREE.BoxHelper(text)
        text.add(bb)
      }

      text.position.set(0, -textSettings.line * i, 0)
      texts.add(text)

      texts.position.set(0, (rows.length - 1) * textSettings.line / 2, 0)
    })
  }, 500)

  textArea.addEventListener('input', debouncedKeyDown, false)
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function render () {
  stats.begin()
  requestAnimationFrame(render)
  let delta = clock.getDelta()

  mixers.forEach(mixer => mixer.update(delta))

  // only needed for autoRotate or inertia
  // controls.update()

  renderer.render(scene, camera)

  // for "animated" material from render
  // renderer.render(scene, camera, wglrt)

  if (textSettings.followCamera)
    texts.children.forEach(child => {
      child.lookAt(camera.position)
    })

  stats.end()
}

render()

document.addEventListener('DOMContentLoaded', () => {
  let textArea = document.querySelector('textarea')
  textArea.focus()
})

