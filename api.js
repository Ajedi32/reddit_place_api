// Hex values from `r.place.DEFAULT_COLOR_PALETTE`
const COLORS = [
  {
    name: 'white',
    hex: "#FFFFFF",
  },
  {
    name: 'light-gray',
    hex: "#E4E4E4",
  },
  {
    name: 'dark-gray',
    hex: "#888888",
  },
  {
    name: 'black',
    hex: "#222222",
  },
  {
    name: 'light-red',
    hex: "#FFA7D1",
  },
  {
    name: 'red',
    hex: "#E50000",
  },
  {
    name: 'orange',
    hex: "#E59500",
  },
  {
    name: 'brown',
    hex: "#A06A42",
  },
  {
    name: 'yellow',
    hex: "#E5D900",
  },
  {
    name: 'light-green',
    hex: "#94E044",
  },
  {
    name: 'green',
    hex: "#02BE01",
  },
  {
    name: 'cyan',
    hex: "#00D3DD",
  },
  {
    name: 'light-blue',
    hex: "#0083C7",
  },
  {
    name: 'blue',
    hex: "#0000EA",
  },
  {
    name: 'light-purple',
    hex: "#CF6EE4",
  },
  {
    name: 'purple',
    hex: "#820080",
  },
]
COLORS.forEach((color, index) => {color.id = index})

const colorsByName = new Map(COLORS.map((color) => [color.name, color]))
const getColorByName = colorsByName.get.bind(colorsByName)
const colorsById = new Map(COLORS.map((color) => [color.id, color]))
const getColorById = colorsById.get.bind(colorsById)
const colorsByHex = new Map(COLORS.map((color) => [color.hex, color]))
const getColorByHex = colorsByHex.get.bind(colorsByHex)

// Asyncronously return some information about the pixel at the given coodinates
//
// Example response:
// {
//   x: 0,
//   y: 0,
//   timestamp: 1491002432.609314,
//   user_name: "Ajedi32",
//   color: 10,
// }
function getPixelInfo(x, y) {
  return fetch(
    `/api/place/pixel.json?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`,
    {method: "GET"}
  ).then((x) => x.json())
}

// Draw a pixel at the given position
//
// `color` is the an object from the COLOR array above
//
// `modhash` is a value required by Reddit as a measure to prevent CSRF attacks.
// Ideally we'd obtain that value automatically, but I'm not really sure how to
// do that just yet.
//
// Example response 1 (success):
//
//     {wait_seconds: 600}
//
// Example response 2 (error):
//
//    {wait_seconds: 45.631169, message: "Too Many Requests", error: 429}
function drawPixel(x, y, {color, modhash}) {
  return fetch(
    "/api/place/draw.json",
    {
      method: "POST",
      credentials: 'include',
      headers: {
        "x-modhash": modhash,
      },
      body: new URLSearchParams(
        `x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}&color=${encodeURIComponent(color.id)}`
      ),
    }
  ).then((x) => x.json())
}

// Got this from Reddit's place-base.js code. Not quite sure how to interpret
// the data yet, but it seems like it contains the state of the entire canvas.
function getCanvasBitmapState() {
  function o(e) {
      r || (r = (new Uint32Array(e.buffer,0,1))[0],
      e = new Uint8Array(e.buffer,4));
      for (var t = 0; t < e.byteLength; t++)
          i[s + 2 * t] = e[t] >> 4,
          i[s + 2 * t + 1] = e[t] & 15;
      s += e.byteLength * 2
  }
  var e = $.Deferred(), r, i = new Uint8Array(1000 * 1000), s = 0;
  fetch("/api/place/board-bitmap", {
      credentials: "include"
  }).then((response) => {
      function n(response) {
          response.read().then((s) => {
              s.done ? e.resolve(r, i) : (o(s.value), n(response))
          })
      }
      if (!response.body || !response.body.getReader) {
          response.arrayBuffer().then(function(response) {
              o(new Uint8Array(response)),
              e.resolve(r, i)
          });
          return
      }
      n(response.body.getReader())
  });
  return e.promise()
}

// Asyncronously returns the number of seconds before the next draw is allowed
async function getTimeToWait() {
  var response = await fetch(
    "/api/place/time.json",
    {
      credentials: "include",
      method: "GET",
    }
  ).then((x) => x.json())

  return response.wait_seconds
}
