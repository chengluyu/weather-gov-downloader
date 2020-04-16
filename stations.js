const mkdirp = require("mkdirp")
const path = require("path")

const { stateCodes } = require("./constants")
const { save, send } = require("./utils")

async function downloadList() {
  const file = path.join.bind(null, __dirname, "data", "states")
  await mkdirp(file())
  for (const state of stateCodes) {
    const response = await send("Meta", {
      state,
      sdate: "2010-01-01",
      edate: "2019-12-31",
      elems: ["maxt", "mint", "avgt", "avgt", "hdd", "cdd", "pcpn", "snow", "snwd"],
    })
    if (response.status === 200) {
      console.log(`Saving meta of ${state}...`)
      save(file(`${state}.json`), response.data)
    } else {
      console.log(`Bad status code: ${response.status}`)
    }
  }
}

downloadList()
