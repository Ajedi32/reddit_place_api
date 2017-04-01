class DrawingContext {
  constructor({modhash}) {
    this._modhash = modhash
    this._drawingQueue = []
    this._isProcessingQueue = false
  }

  get modhash() {
    return this._modhash
  }
  set modhash(newModhash) {
    this._modhash = newModhash
  }

  queueDrawPixel(x, y, {color}) {
    var promise = new Promise((resolve, reject) => {
      this._drawingQueue.unshift({x, y, color, promiseResolution: {resolve, reject}})
    })
    this._startProcessingQueue()
    return promise
  }

  _drawPixel({x, y, color}) {
    return drawPixel(x, y, {color, modhash: this._modhash})
  }

  _startProcessingQueue() {
    if (this._isProcessingQueue) return
    this._isProcessingQueue = true
    this._processNextItem()
  }

  _processNextItem() {
    if (!this._isProcessingQueue) return
    if (this._isProcessingQueue.length === 0) {
      this._isProcessingQueue = false
      return
    }

    let item = this._drawingQueue[this._drawingQueue.length-1]
    console.log("Processing: ", item)
    let {promiseResolution: {resolve, reject}} = item
    return this._drawPixel(item).then((response) => {
      console.log("Received response: ", response)
      if (response.error === undefined) {
        this._drawingQueue.pop()
        resolve(response)
      }
      console.log(`Waiting ${response.wait_seconds*1000 + 500}ms (${response.wait_seconds} seconds)`)
      setTimeout(this._processNextItem.bind(this), response.wait_seconds*1000 + 500)
    })
  }
}
