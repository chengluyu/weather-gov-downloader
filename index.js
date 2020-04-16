const fs = require("fs")
const mkdirp = require("mkdirp")
const path = require("path")
const pino = require("pino")

const { send, save } = require("./utils")

mkdirp.sync(path.join(__dirname, "logs"))
const log = pino(
  pino.destination(
    path.join(__dirname, "logs", new Date().toISOString().replace(/[:]/g, ".") + ".logs")
  )
)

const failures = []
const failuresPath = path.join(__dirname, "data", "failures.json")

const reportFailure = (data) => {
  failures.push(data)
  save(failuresPath, failures)
}

async function main() {
  const stations = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "stations.json")))
  let index = 0
  for (const { sid, county, state } of stations) {
    log.info(`Station ${sid}, ${county}, ${state}`)
    try {
      const filePath = path.join(__dirname, "data", state, county, sid + ".json")
      if (fs.existsSync(filePath)) {
        log.info("File already exists. Skipped.")
        continue
      }
      const response = await send("Data", {
        elems: [
          { name: "maxt", add: "t" },
          { name: "mint", add: "t" },
          { name: "avgt", add: "t" },
          { name: "avgt", normal: "departure", add: "t" },
          { name: "hdd", add: "t" },
          { name: "cdd", add: "t" },
          { name: "pcpn", add: "t" },
          { name: "snow", add: "t" },
          { name: "snwd", add: "t" },
        ],
        sid,
        sDate: `2010-01-01`,
        eDate: `2019-12-31`,
      })
      if (response.status === 200) {
        await mkdirp(path.join(__dirname, "data", state, county))
        save(filePath, response.data)
        log.info(`Saved to ${filePath}`)
      } else {
        log.error("Bad status code", response.status)
        reportFailure(index)
      }
    } catch (e) {
      log.error("Other errors")
      reportFailure(index)
    }
  }
}

main()
