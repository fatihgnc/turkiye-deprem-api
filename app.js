(async () => {
    // importing necessary modules
    const express = require('express')
    const axios = require('axios')
    const cheerio = require('cheerio')

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

    // formatting data
    let formattedData = []
    let earthquakeData = []

    for (let i = 0; i < rawData.length; i++) {
        formattedData.push(rawData[i].split('  '))
    }

    // flattening 2d array
    formattedData = formattedData.flat()

    // removing unwanted data
    for(let i = formattedData.length-1; i >= 0; i--) {
        if (formattedData[i] === '' || 
            formattedData[i].includes('lksel') || 
            formattedData[i].includes('REVIZE') || 
            formattedData[i].includes('(2021')) {
                formattedData.splice(i, 1)
            }
    }

    // storing data as an object in array
    for(let i = 0; i < formattedData.length; i += 8) {
        earthquakeData.push({
            tarih: formattedData[i],
            enlem: formattedData[i+1],
            boylam: formattedData[i+2],
            derinlik: formattedData[i+3],
            buyukluk: formattedData[i+5],
            lokasyon: formattedData[i+7]
        })
    }

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

        if(!isValidOperation) {
            return res.status(400).send({
                error: 'geçersiz filtre girdiniz!'
            })
        }
        // users have to provide at least one filter on this route so we have to check that
        if(Object.keys(req.query).length === 0) {
            return res.status(400).send({
                error: 'en az 1 filtre girmelisiniz!'
            })
        }
        
        // duplicating the earthquake data into this array so we can filter it as according to query object and send it via response
        let filteredData = []

        for(let i = 0; i < earthquakeData.length; i++) {
            filteredData.push(earthquakeData[i])
        }
        
        // filtering data
        if(req.query.tarih_o) {
            filteredData = filteredData.filter(data => Date.parse(req.query.tarih_o) >= Date.parse(data.tarih))
        }

        if(req.query.tarih_s) {
            filteredData = filteredData.filter(data => Date.parse(req.query.tarih_s) <= Date.parse(data.tarih))
        }

        if(req.query.min_buyukluk) {
            filteredData = filteredData.filter(data => parseFloat(req.query.min_buyukluk) <= parseFloat(data.buyukluk))
        }

        if(req.query.max_buyukluk) {
            filteredData = filteredData.filter(data => parseFloat(req.query.max_buyukluk) >= parseFloat(data.buyukluk))
        }

        if(req.query.lokasyon) {
            filteredData = filteredData.filter(data => data.lokasyon.includes(req.query.lokasyon.toUpperCase()))
        }

        // allowing access
        res.setHeader('Access-Control-Allow-Origin', '*')
        // if no data matches the filters, then return bad request
        if(filteredData.length === 0) {
            return res.status(400).send({
                error: 'Girdiğiniz filtrelere uygun bir sonuç bulunamadı.'
            })
        }

        res.status(200).send(filteredData)
    })

    app.listen(PORT, () => {
        console.log('server is listening on port %s', PORT);
    })
})()
