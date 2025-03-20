import * as fs from 'fs';

const file = JSON.parse(fs.readFileSync('data01.json','utf8'))

// {id, title, supermarket, price}

interface MarketData {
    id: Number,
    title: string,
    supermarket: string,
    price: Number
}

interface Output {
    category: string,
    count: Number,
    products: {
        title: string, 
        supermarket: string
    }[]
}


function hasNumber(text: string) {
    for (var char of text.split("")) {
        if (!isNaN(Number(char))) {
            return true
        }
    }
    return false
}

function splitNumber(text): [string, string] {
    var outputText = ""
    var outputNumber = ""
    text.split("").forEach(char => {
        if (isNaN(char)) {
            outputText += char
        } else {
            outputNumber += char
        }
    })
    return [
        outputNumber, 
        outputText
    ]
}
const quilo = [
    "quilo",
    "kg",
    "grama",
    "g"
]
const litro = [
    "l",
    "litro",
    "ml"
]

const zeroLactose = [
    "zero lactose",
    
]

var predata: {
    title: string,
    tags: string[]
    quantity: string,
    metric: string,
    products: {
        title: string,
        supermarket: string
    }[]
}[] = []

file.forEach(
    (data: MarketData) => {
    var splited = data.title.toLowerCase().split(" ")
    var quantity = ""
    var metric = ""
    if (hasNumber(splited.at(-1)??"")) {
        [quantity, metric] = splitNumber(splited.at(-1))
        splited.pop()
    } else {
        [quantity, metric] = splited.slice(-3, -1)
        splited = splited.slice(0, -2)
    }
    if (["g", "grama", "ml"].includes(metric)) {
        quantity = (Number(quantity) / 1000).toString()
    }
    metric = quilo.includes(metric) ? "kg" : "l"
    
    var found = false;
    for (var out of predata) {
        var points = 0
        out.tags.forEach(tag => {
            if (splited.includes(tag)) {
                points += 1
            }
        })
        if (points > 3 && out.metric === metric && out.quantity === quantity) {
            out.products.push({
                title: data.title,
                supermarket: data.supermarket
            })
            found = true
            break
        }
    }
    if (!found) {
        predata.push({
            title: data.title,
            tags: splited,
            quantity: quantity,
            metric: metric,
            products: [{
                title: data.title,
                supermarket: data.supermarket
            }]
        })
    }

    
})


const output: Output[] = predata.map(data => {
    return {
        category: data.title,
        count: data.products.length,
        products: data.products
    }
})

console.log(output)
console.log(output.length, file.length)
fs.writeFileSync("test.json", JSON.stringify(output))
