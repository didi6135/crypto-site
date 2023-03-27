/// <reference path="jquery-3.6.3.js" />




const popupFullInfo = document.getElementById('popupFullInfo')

// ID של הטבלה
const cryptoSection = document.getElementById('cryptoSection')

// API לקבלת מידע על מטבע מסוים
const searchById = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=`

// API להוספת 50 מטבעות חדשות בעת לחיצה על הכפתור
const apiGet250Coins = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=50&page='

// הסתרת האנימציה 
const icon = document.getElementById("lds-ripple");
icon.style.display = 'none';


// Favorite Array
let favoriteArr = []

//  all Coins arr
let allCoins = []
let binance

$('#chartContainer').hide()
$('#about-me').hide()
let counter = 2

function getJSON(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url,
            success: data => resolve(data),
            error: err => reject(err)
        })
    })
}
   

// Add to local storage

async function validateCoinsStorage() {
    const coinsData = localStorage.getItem('coins');
    if(coinsData){
        allCoins = JSON.parse(coinsData);
        displayCoins(allCoins);
        
    }else{
        
       const getFirstCoins  = await get50Coins();
       testCoinWorks(getFirstCoins)
    }
    
}

async function validateForBinance() {
    const binanceCoins = localStorage.getItem('binance');
    if(binanceCoins){
        binance = JSON.parse(binanceCoins);
        
    }else{
        binance = []
    }
    
}


// get 50 first coins
async function get50Coins() {

    try {
        icon.style.display = "none";
        return  await getJSON(`${apiGet250Coins}1`)

    } catch (error) {
        alert('Failed to fetch: ' + error)
    }
    
}

// display auto 50 first coins to screen
function displayCoins(array) {
    
let html = ''
    for(const coin of array) {

        let shekel = coin.current_price * 3.65
        let euro = coin.current_price * 0.94
        html += `
    <div class="coinDiv" id="coinDiv">
        <img class="imageCoin" src="${coin.image}" />
        <div class="nameAndSymbol">
        <h3 class="coinSymbol">${coin.symbol.toUpperCase()}</h3>
        <p class="coinName">${coin.name}</p>
        </div><hr class="line">
        <p class="numbers">$ ${coin.current_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
        <p class="numbers">₪ ${shekel.toFixed(2)}</p>
        <p class="numbers">€ ${euro.toFixed(2)}</p><hr class="line">
    
        <div class="moreInfoDiv">
        <i class=" fa fa-spinner fa-spin loadingData" id="${coin.id}SPIN"></i>
        <button id="${coin.id}INFO" onclick="openWithMoreDetails('${coin.symbol.toUpperCase()}' , '${coin.id}')" class="buttonDetails">More Details</button> 
        </div>

        <button id="${coin.id}ID" onclick="addToFavorite('${coin.id}')" class="buttonFavorite">Add To Favorite  </button>
        <i class="fa fa-heart heartIcon" id="${coin.id}COIN"></i>
        
    </div>
        `
    }
    $('#cryptoSection').html(html)
    validateFavoriteCoinsStorage()

}


// add more 50 new coins on Click
$('#addNewCoins').on('click', async function loadMoreCoins()
 {

    try {
        icon.style.display = "";
        const response = await fetch(`${apiGet250Coins}${counter}`)
        const data = await response.json()
        testCoinWorks(data);

        counter++
    } catch (error) {
        console.log(error);
    }
    
    icon.style.display = "none";
})



// check if coins trade in binance
function testCoinWorks(array) {

    array.forEach( async (item, index) => {
    try {
        
        let coinTest = item.symbol.toUpperCase()
        const livePriceBinance = await fetch(`https://api1.binance.com/api/v3/ticker/price?symbol=${coinTest}USDT`)
        const text = await livePriceBinance.text();
        const data = JSON.parse(text);  
        
        let checkCoin = data.symbol.slice(0, -4).toLowerCase()
        
        let testBinance = !binance.includes(data.symbol)
        let testAllCoins = !binance.includes(checkCoin)
        
        if(testBinance) {   
            binance.push(data)
            console.log(binance);
            localStorage.setItem('binance', JSON.stringify(binance))
        }  

        if(testAllCoins) {
            allCoins.push(item)
            localStorage.setItem('coins', JSON.stringify(allCoins))
        }

    } catch (error) {
        console.log('err ' + index )
        array.splice(index, 1)
        console.log(error)
    }
    
    displayCoins(allCoins)
  });
  

}

// search Coins

$('#searchInput').on('click',  function() {
    
    const searchInput = $('#inputCryptoSearch').val()
    allCoins.find(coin => {
        if(coin.symbol === searchInput || coin.name.toLowerCase()  === searchInput) {
            

            let html = ''
            let shekel = coin.current_price * 3.65
            let euro = coin.current_price * 0.94
            html += `
            <div class="coinDiv" id="coinDiv">
            <img class="imageCoin" src="${coin.image}" />
            <div class="nameAndSymbol">
            <h3 class="coinSymbol">${coin.symbol.toUpperCase()}</h3>
            <p class="coinName">${coin.name}</p>
            </div><hr class="line">
            <p class="numbers">$ ${coin.current_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            <p class="numbers">₪ ${shekel.toFixed(2)}</p>
            <p class="numbers">€ ${euro.toFixed(2)}</p><hr class="line">
        
            <div class="moreInfoDiv">
            <i class=" fa fa-spinner fa-spin loadingData" id="${coin.id}SPIN"></i>
            <button id="${coin.id}INFO" onclick="openWithMoreDetails('${coin.symbol.toUpperCase()}' , '${coin.id}')" class="buttonDetails">More Details</button> 
            </div>
    
            <button id="${coin.id}ID" onclick="addToFavorite('${coin.id}')" class="buttonFavorite">Remove Coin  </button>
            <i class="fa fa-heart heartIcon" id="${coin.id}COIN"></i>
            
        </div>
            `
        $('#cryptoSection').html(html)
        validateFavoriteCoinsStorage()

        } 
    
    })
    
})

validateCoinsStorage()
validateFavoriteCoinsStorage()
validateForBinance()
// check if coin into favorite

function validateFavoriteCoinsStorage() {
    const favorite = localStorage.getItem('favorite');
    if(favorite){
        favoriteArr = JSON.parse(favorite);
        $('#favoriteCounter').html(`Favorite Coins - ${favoriteArr.length}/5`)

        for(const coin of favoriteArr) {
            $(`#${coin}ID`).html('Remove Coin')
            $(`#${coin}COIN`).show()
        }

    }else{
        localStorage.setItem('favorite', JSON.stringify(favoriteArr));
    }
}


function refreshFavorite(name) {
    if( jQuery.inArray(`${name}` , favoriteArr) !== -1) {
        if(confirm('Are you sure that you want to remove?')) {
            let item = `${name}`
            console.log(item)
            favoriteArr.splice(favoriteArr.indexOf(item),1)
            localStorage.setItem('favorite', JSON.stringify(favoriteArr));
            validateFavoriteCoinsStorage()
            $(`#${name}ID`).html('Add To Favorite')
            $(`#${name}COIN`).hide()
            
            
        } else {
            console.log('not remove');
        }
}

}

// הצגת המטבעות מהפייבוריט

function favoriteCoin() {
    $('#about-me').hide()
    $('#cryptoSection').show()
    validateFavoriteCoinsStorage()
    
    let drawFavorite = []
    let html = ''

    for(const item of favoriteArr) {

        const result = allCoins.find((res) => res.id === item)
        drawFavorite.push(result)

    }
        for(const coin of drawFavorite) {
    

            let shekel = coin.current_price * 3.65
            let euro = coin.current_price * 0.94
            html += `
            <div class="coinDiv" id="coinDiv">
            <img class="imageCoin" src="${coin.image}" />
            <div class="nameAndSymbol">
            <h3 class="coinSymbol">${coin.symbol.toUpperCase()}</h3>
            <p class="coinName">${coin.name}</p>
            </div><hr class="line">
            <p class="numbers">$ ${coin.current_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            <p class="numbers">₪ ${shekel.toFixed(2)}</p>
            <p class="numbers">€ ${euro.toFixed(2)}</p><hr class="line">
        
            <div class="moreInfoDiv">
            <i class=" fa fa-spinner fa-spin loadingData" id="${coin.id}SPIN"></i>
            <button id="${coin.id}INFO" onclick="openWithMoreDetails('${coin.symbol.toUpperCase()}' , '${coin.id}')" class="buttonDetails">More Details</button> 
            </div>
    
            <button id="${coin.id}ID" onclick="refreshFavorite('${coin.id}')" class="buttonFavorite">Add To Favorite  </button>
            <i class="fa fa-heart heartIcon" id="${coin.id}COIN"></i>
            
        </div>
            `
        }
        $('#buttonLoadMore').hide()
        
        $('#cryptoSection').html(html)
        validateFavoriteCoinsStorage()
        chart()
}



// הוספת מטבע למעודפים ומחיקתו
function addToFavorite(name) {
    
    if( jQuery.inArray(`${name}` , favoriteArr) !== -1) {
        if(confirm('Are you sure that you want to remove?')) {
            let item = `${name}`
            console.log(item)
            
            favoriteArr.splice(favoriteArr.indexOf(item),1)
            localStorage.setItem('favorite', JSON.stringify(favoriteArr));
            validateFavoriteCoinsStorage()
            $(`#${name}ID`).html('Add To Favorite')
            $(`#${name}COIN`).hide()

        } else {
            console.log('not remove');
        }

    } else if(favoriteArr.length <= 4){
         
        $(`#${name}ID`).html('Remove Coin')
        $(`#${name}COIN`).show()
        
        
            $('#favoriteCounter').html(`Favorite Coins - ${favoriteArr.length}/5`)
            favoriteArr.push(name);
            localStorage.setItem('favorite', JSON.stringify(favoriteArr));
        } else {
            alert(`You can add only 5 Coins \n Remove some coin to add another coin`)
        }
    
}


// live data from binance
async function openWithMoreDetails(symbol, id) {
    
$('#chartContainer').show()
$('#canvasJs').hide()
$(`#${id}SPIN`).show()

// getDetailsWithLive(id)
    let allDetails = []
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
    const data = await response.json()
    allDetails.push(data)

let icon


allDetails.findIndex((res) => {
        if(res.id === id){
            symbolFevorite = res.symbol
            icon = res.image.small
        }
    })

setInterval(async() => {
    let firstData = ''
    
    
      const livePriceBinance = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`)
      .then(res => res.json())
      
      const liveData24 = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`)
      .then(res => res.json())
      
  
      const allData = Promise.all([livePriceBinance, liveData24]);
      allData.then(res => {
            
                       
            let currentPrice = res[0].price
                
                
firstData += `
    <div class="modal-box">
        <div class="headerDiv">
            <h1 class="titleWebsite"><a href="./index.html">CRYPTOLI</a></h1>
            <a class="fa fa-remove iconDetails" href="/"></a>
        </div>
                
        <div class="firstDetails">
            <img src="${icon}" />&nbsp; &nbsp;
            <h2 class="nameCoin">${res[0].symbol.slice(0, -4)} / ${res[0].symbol.slice(-4)}</h2>
        </div>

        <div class="priceDiv">
            <h3 class="textPrice">Live Price: </h3>
            <p id="previousPrice" class="livePrice"> $ ${currentPrice}</p>
        </div>
      
        <div class="liveData">
            <div><b>price Change 24: </b><br>${res[1].priceChangePercent}% &nbsp; ${res[1].priceChange} $</div>
            <div><b>High Price 24: </b> <br>${res[1].highPrice} $</div>
            <div><b>Low Price 24: </b><br> ${res[1].lowPrice} $</div>
            <div><b>Volume 24: </b> <br> ${res[1].volume} $</div>
        </div>

    </div>
                `

    $('#header').hide()
    $('#searchDiv').hide()
    $('#cryptoSection').hide()
    $('#buttonLoadMore').hide()
    $('#firstData').html(firstData)
                
    })
            
}, 100);



//Live Chart for any coin
var chart = LightweightCharts.createChart(document.getElementById('chartContainer'), {
    // width: 800,
    // height: 500,
  
    layout: {
      background: { color: "#222" },
      textColor: "#DDD",
      
    },
  
      grid: {
          vertLines: { color: "#444" },
          horzLines: { color: "#444" },
      },
      crosshair: {
          mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
      },
  });

    chart.priceScale().applyOptions({
      borderColor: "#71649C",
    });
    chart.timeScale().applyOptions({
      borderColor: "#71649C",
    });
  
  var candleSeries = chart.addCandlestickSeries({
    upColor: 'rgb(14,203,129)',
    wickUpColor: 'rgb(14,203,129)',
    borderVisible: false,
    downColor: 'rgb(246,70,93)',
    wickDownColor: 'rgb(246,70,93)',
  });
  
   const currentLocale = window.navigator.languages[0];
   const myPriceFormatter = Intl.NumberFormat(currentLocale, {
         style: "currency",
         currency: "USD", 
       }).format;
  
   chart.applyOptions({
     localization: {
       priceFormatter: myPriceFormatter,
     },
   });
  
   chart.applyOptions({
      watermark: {
          visible: true,
          fontSize: 35,
          horzAlign: 'center',
          vertAlign: 'center',
          color: 'rgba(171, 71, 188, 0.5)',
          text: 'CRYPTOLI',
      },
  });
  
  candleSeries.setData([]);

  window.addEventListener('resize', () => {
    chart.resize(window.innerWidth, window.innerHeight);
});
     
let ws = new WebSocket(`wss://stream.binance.com:443/ws/${symbol.toLowerCase()}usdt@kline_1s`)
let openPrice;
let highPrice;
let lowPrice;
let closePrice;

ws.onmessage = (event) => {
    let par = JSON.parse(event.data)
    console.log(par);
    openPrice = par.k.o
    highPrice = par.k.h
    lowPrice = par.k.l
    closePrice = par.k.c

    candleSeries.update(
        { time: new Date().getTime(),
          open: openPrice,
          high: highPrice, 
          low: lowPrice, 
          close: closePrice }
    )
 
}

// function test() {
//     setInterval(async() => {

// let openPrice;
// let highPrice;
// let lowPrice;
// let closePrice;
        
//         const livePriceBinance = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1s&limit=1`)
//         const data = await livePriceBinance.json()
//         // console.log(data[0]);

        
        
//         openPrice = data[0][1]
//         highPrice = data[0][2]
//         lowPrice = data[0][3]
//         closePrice = data[0][4]
 


//         candleSeries.update(
//             { time: new Date().getTime(),
//               open: openPrice,
//               high: highPrice, 
//               low: lowPrice, 
//               close: closePrice }
//         )


//     }, 1000);
// }


// test()
  
        
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////  Chart /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let livePriceFavorite = []

let dataPoints1 = []
let dataPoints2 = []
let dataPoints3 = []
let dataPoints4 = []
let dataPoints5 = []


function chart() {
    validateFavoriteCoinsStorage()
 
for(const item of favoriteArr) {
    const result = allCoins.find((res) => res.id === item)
    const symbol = `${result.symbol.toUpperCase()}USDT`
    
    livePriceFavorite.push(symbol)
}


let addToData = []

let dataPointsArr = {
        dataPoints1 , 
        dataPoints2 , 
        dataPoints3 , 
        dataPoints4 , 
        dataPoints5 ,
}

// Build URL for get live price
    let url = ''
for(let i =0; i < livePriceFavorite.length; i++) {

    if(livePriceFavorite.length - 1 === i) {
        let getName =  `"${livePriceFavorite[i].toUpperCase()}"`
        url += getName
    } else {
        let lestName =  `"${livePriceFavorite[i].toUpperCase()}",`
        url += lestName
    }   
}

function updateChart() {

    setInterval( async () => {

        const test = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=[${url}]`)
        let data = await test.json()

// push data to Chart
    for(let i = 0; i < livePriceFavorite.length; i++) {
        const result = data.find((res) => res.symbol === livePriceFavorite[i])
        let par = parseFloat(result.price)
        Object.values(dataPointsArr)[i].push({ x: new Date(), y: par })
        chart.render()
    }

    }, 100);
   
// create Chart
    for(let i = 0; i < livePriceFavorite.length; i++) {
        addToData.push({
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: "###.00 USD",
            xValueFormatString: "hh:mm:ss TT",
            showInLegend: true,
            name: livePriceFavorite[i],
            dataPoints: Object.values(dataPointsArr)[i]
        })
    }
    chart.render()
}

var chart = new CanvasJS.Chart("canvasJs", {
    backgroundColor: "#181a20",
		title:{
			text: "Chart of favorite coins", 
            fontColor: "white"             
		},
        axisX: {
            title: "chart updates every 1s",
            titleFontColor: "white"
        },
        
        axisY: {
            suffix: "$",
            titleFontColor: "white"
        },
        axisY2: {
            // suffix: "$",
            titleFontColor: "white"
        },
        
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "top",
            fontSize: 16,
            fontColor: "white",
            itemclick: toggleDataSeries
        },
		data: addToData
});
	chart.render();
    updateChart()

function toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    }
    else {
        e.dataSeries.visible = true;
    }
    e.chart.render();
 }
}


//////////////////////////////// About /////////////////////////////////

$('#about').on('click', function() {
    
    $('#canvasJs').hide()
    $('#searchDiv').hide()
    $('#cryptoSection').hide()
    $('#buttonLoadMore').hide()
    $('#about-me').show()
})