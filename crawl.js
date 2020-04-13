const fs = require("fs")
const mkdirp = require("mkdirp")
const path = require("path")
const { default: axios } = require("axios")

const file = path.join.bind(null, __dirname, "data")
const exists = (name) => fs.existsSync(file(`${name}.json`))
const save = (name, data) => fs.writeFileSync(file(`${name}.json`), JSON.stringify(data))
const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))

async function main() {
  await mkdirp(path.join(__dirname, "data"))

  for (let year = 2000; year < 2020; year++) {
    if (exists(year)) {
      console.log(`Skipped ${year}...`)
      continue
    }

    console.log(`Downloading ${year}...`)

    const first = `${year}-01-01`
    const last = `${year}-12-31`
    const data = {
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
      sid: "SEAthr+9",
      sDate: first,
      eDate: last,
    }
    const serializedData = JSON.stringify(data).replace(
      /[^\w+]/g,
      (x) => "%" + x.charCodeAt(0).toString(16).toUpperCase()
    )
    // console.log(serializedData);
    const response = await axios({
      method: "POST",
      url: "https://data.rcc-acis.org/StnData",
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
        // "Referer": "https://nowdata.rcc-acis.org/sew/"
      },
      data: `params=${serializedData}&output=json`,
      proxy: {
        // export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7891
        host: "127.0.0.1",
        port: "7890",
        protocol: "http",
      },
    })

    if (response.status === 200) {
      console.log(`Saving to file...`)
      save(year, response.data)
    } else {
      console.log(`Bad status code: ${response.status}`)
    }

    if (year !== 2019) {
      console.log("Sleeping for 5 seconds...")
      await sleep(5 * 1000)
    }
  }
}

main()
