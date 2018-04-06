export default function (callback, duration, repetitions) {
  let elapsedTime = 0,
      enabled = true

  return {
    update (delta) {
      if (!duration > 0 || !enabled)
        return

      elapsedTime += delta

      callback((elapsedTime/duration) % 1)

      if (elapsedTime >= duration * repetitions)
        this.update = ()=>{}
    },

    setDuration (newDuration) {
      duration = newDuration
    },

    setRepetitions (newRepetitions) {
      repetitions = newRepetitions
    },

    pause () {
      enabled = !enabled
    }
  }
}
