const express = require('express')
const app = express()
const PORT = 8000
const cors = require('cors')

app.use(cors())

const rappers = {
    '21 savage': {
        'age': 30,
        'birthName':'Sheyaa Bin Abraham-Joseph',
        'birthLocation': 'London, England'
    },
    'chance rhe rapper': {
        'age': 28,
        'birthName':'Chancelor Bennett',
        'birthLocation': 'Chicago, Illinois'
    },
    'dylan': {
        'age': 27,
        'birthName':'Dylan',
        'birthLocation': 'Dylan'
    },
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/api/:rapperName', (req, res) => {
    const rappersName = req.params.rapperName.toLowerCase()
    if(rappers[rappersName]){
        res.json(rappers[rappersName])
    }else{
        res.json(rappers['dylan'])
    }
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`The server is running on port: ${PORT}`)
})