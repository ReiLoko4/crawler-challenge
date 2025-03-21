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

function cleanStr(text: string) {
    return text
        .toLowerCase()
        .replace(/-/g, " ")
        .replace(/ de /g, " ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
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
    var tags = cleanStr(data.title).split(" ")
    var quantity = ""
    var metric = ""
    const lactose = tags.includes("lactose")
    if (hasNumber(tags.at(-1)??"")) {
        [quantity, metric] = splitNumber(tags.at(-1))
        tags.pop()
    } else {
        [quantity, metric] = tags.slice(-3, -1)
        tags = tags.slice(0, -2)
    }
    if (["g", "grama", "ml"].includes(metric)) {
        quantity = (Number(quantity) / 1000).toString()
    }
    metric = quilo.includes(metric) ? "kg" : "l"
    var foundIndex;
    var mostPoints = 0;
    for (var [i, value] of predata.entries()) {
        var points = 0
        value.tags.forEach(tag => {
            if (tags.includes(tag)) {
                points += 1
            }
        })
        if (lactose && !value.tags.includes("lactose")) continue;
        if (tags.length === points) {
            foundIndex = i
            break;
        }
        if (points > 2 
            && points > mostPoints
            && tags.length - points < 2
            && value.metric === metric 
            && value.quantity === quantity
            && !value.products.map(
                prod => prod.supermarket
            ).includes(
                data.supermarket
            )) {
            
            foundIndex = i
            mostPoints = points
        }
    }
    if (foundIndex === undefined) {
        predata.push({
            title: data.title,
            tags: tags,
            quantity: quantity,
            metric: metric,
            products: [{
                title: data.title,
                supermarket: data.supermarket
            }]
        })
    } else {
        predata[foundIndex].products.push({
            title: data.title,
            supermarket: data.supermarket
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

console.log(JSON.stringify(output))
// fs.writeFileSync("output.json", JSON.stringify(output))
