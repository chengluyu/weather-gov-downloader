const fs = require("fs")
const path = require("path")
const { default: axios } = require("axios")

const proxy = { host: "127.0.0.1", port: "7890", protocol: "http" }
const dataFile = path.join.bind(null, __dirname, "data")
const exists = (name) => fs.existsSync(dataFile(`${name}.json`))
const save = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data))
const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))
const serialize = (records) =>
  JSON.stringify(records).replace(
    /[^\w+]/g,
    (x) => "%" + x.charCodeAt(0).toString(16).toUpperCase()
  )
const send = (target, data) =>
  axios({
    method: "POST",
    url: `https://data.rcc-acis.org/Stn${target}`,
    headers: {
      Host: "data.rcc-acis.org",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:76.0) Gecko/20100101 Firefox/76.0",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Origin: "https://nowdata.rcc-acis.org",
      DNT: "1",
    },
    data: `params=${serialize(data)}&output=json`,
    proxy,
  })

module.exports = { proxy, dataFile, exists, save, sleep, serialize, send }
