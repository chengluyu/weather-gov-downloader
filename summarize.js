const fs = require("fs")
const path = require("path")
const file = path.join.bind(null, __dirname, "data", "states")

const stations = []
for (const name of fs.readdirSync(file())) {
  console.log(`Processing ${name}`)
  const raw = fs.readFileSync(file(name), { encoding: "utf-8" })
  const parsed = JSON.parse(raw)
  for (const { name: county, sids, state } of parsed.meta) {
    stations.push(...sids.map((sid) => ({ county, sid, state })))
  }
}
fs.writeFileSync(path.join(__dirname, "data", "station.json"), JSON.stringify(stations))
console.log(`${stations.length} station had been save to the disk.`)
