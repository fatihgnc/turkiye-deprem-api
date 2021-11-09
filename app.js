class Earthquake {
    constructor(tarih, enlem, boylam, derinlik, buyukluk, lokasyon) {
        this.tarih = tarih
        this.enlem = enlem
        this.boylam = boylam
        this.derinlik = derinlik
        this.buyukluk = buyukluk
        this.lokasyon = lokasyon
    }
}

(async () => {
    // importing necessary modules
    const express = require('express')
    const axios = require('axios')
    const cheerio = require('cheerio')
    const cors = require('cors')

    const app = express()

    const PORT = process.env.PORT || 3000

    // little function to scrape the data
    async function fetchHTML(url) {
        const { data } = await axios.get(url)
        return cheerio.load(data)
    }

    const $ = await fetchHTML('http://www.koeri.boun.edu.tr/scripts/lst8.asp')

    // getting the part we want and splicing unnecessary stuff
    const rawData = $('pre').text().split('\n')
    rawData.splice(0, 6)
    rawData.splice(rawData.length - 2, 2)

    // formatting data
    let formattedData = []
    let earthquakeData = []

    for (let i = 0; i < rawData.length; i++) {
        formattedData.push(rawData[i].split(/\s{1,}/g))
    }

    // removing unwanted data
    for (let i = 0; i < formattedData.length; i++) {
        let data = formattedData[i]

        data.splice(5, 1)
        data.splice(6, 1)
        data.splice(data.length - 1, 1)

        if (data[data.length - 1].match(/\d{4}\.\d{2}\.\d{2}/))
            data.splice(data.length - 2, 2)
    }

    // storing data as an object in array
    for (let i = 0; i < formattedData.length; i += 1) {
        let data = formattedData[i]

        // destructuring info from the formatted earthquake data
        let [tarih, enlem, boylam, derinlik, buyukluk, lokasyon] = [data[0] + ' ' + data[1], data[2], data[3], data[4], data[5], data.slice(6,)]
        lokasyon = lokasyon.join('-')

        let earthquake = new Earthquake(tarih, enlem, boylam, derinlik, buyukluk, lokasyon)

        earthquakeData.push(earthquake)
    }

    app.use(cors())

    // any request coming to this route will be redirected to /api route
    app.get('/', (req, res) => {
        res.redirect('/api')
    })

    // simply just send all earhquake info back on this route
    app.get('/api', (req, res) => {
        res.send(earthquakeData)
    })

    // route for filtering data
    app.get('/api/filter', (req, res) => {

        // checking if user queries in an invalid way
        let queries = Object.keys(req.query)
        const allowedFilters = ['lokasyon', 'min_buyukluk', 'max_buyukluk', 'tarih_o', 'tarih_s']
        const isValidOperation = queries.every(query => allowedFilters.includes(query))

        if (!isValidOperation) {
            return res.status(400).send({
                error: 'geçersiz filtre girdiniz!'
            })
        }
        // users have to provide at least one filter on this route so we have to check that
        if (Object.keys(req.query).length === 0) {
            return res.status(400).send({
                error: 'en az 1 filtre girmelisiniz!'
            })
        }

        // duplicating the earthquake data into this array so we can filter it as according to query object and send it via response
        let filteredData = []

        for (let i = 0; i < earthquakeData.length; i++) {
            filteredData.push(earthquakeData[i])
        }

        // filtering data
        if (req.query.tarih_o) {
            filteredData = filteredData.filter(data => Date.parse(req.query.tarih_o) >= Date.parse(data.tarih))
        }

        if (req.query.tarih_s) {
            filteredData = filteredData.filter(data => Date.parse(req.query.tarih_s) <= Date.parse(data.tarih))
        }

        if (req.query.min_buyukluk) {
            filteredData = filteredData.filter(data => parseFloat(req.query.min_buyukluk) <= parseFloat(data.buyukluk))
        }

        if (req.query.max_buyukluk) {
            filteredData = filteredData.filter(data => parseFloat(req.query.max_buyukluk) >= parseFloat(data.buyukluk))
        }

        if (req.query.lokasyon) {
            filteredData = filteredData.filter(data => data.lokasyon.includes(req.query.lokasyon.toUpperCase()))
        }

        // allowing access
        res.setHeader('Access-Control-Allow-Origin', '*')
        // if no data matches the filters, then return bad request
        if (filteredData.length === 0) {
            return res.status(400).send({
                error: 'Girdiğiniz filtrelere uygun bir sonuç bulunamadı.'
            })
        }

        res.status(200).json(filteredData)
    })

    app.listen(PORT, () => {
        console.log('server is listening on port %s', PORT);
    })
})()
