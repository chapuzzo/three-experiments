import * as THREE from 'three'

let sizes = {
  position: 3,
  normal: 3,
  uv: 2
}

function bufferGeometryMerger (...geometries) {
  let composedGeometry = new THREE.BufferGeometry()
  let arrays = {}

  ;['position', 'normal', 'uv'].forEach(attribute => {
    let length = geometries.reduce((total, geometry) => {
      let currentAttribute = geometry.getAttribute(attribute)
      // console.log(currentAttribute)
      return total + currentAttribute.count * currentAttribute.itemSize
    }, 0)
    // console.log(length)
    arrays[attribute] = new Float32Array(length)

    geometries.reduce((mergedLength, geometry) => {
      let currentAttribute = geometry.getAttribute(attribute).array
      // console.log(currentAttribute)

      currentAttribute.forEach((element, index) => {
        arrays[attribute][mergedLength + index] = element
      })

      return mergedLength + currentAttribute.length
    }, 0)

    composedGeometry.addAttribute(attribute, new THREE.BufferAttribute(
      arrays[attribute],
      sizes[attribute]
    ))


    // let composedArray = Float32Array.from(
    //   geometries.reduce((total, geometry) => {
    //     let currentAttribute = geometry.getAttribute(attribute)
    //     // console.log(currentAttribute)
    //     console.log(currentAttribute, currentAttribute.length)
    //     return total.concat(Array.from(currentAttribute.array))

    //     // return total + currentAttribute.count * currentAttribute.size
    //   }, [])
    // )

    // // console.log(composedArray, composedArray.length)

    // composedGeometry.addAttribute(attribute, new THREE.BufferAttribute(
    //   composedArray,
    //   sizes[attribute]
    // ))

    // console.log(composedGeometry.getAttribute(attribute))
  })

  return composedGeometry
}

export default bufferGeometryMerger
