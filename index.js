var express = require("express"); //requiring express module
var app = express(); //creating express instance
var fs = require("fs"); //require fs(file system) module
var request = require("request"); //requiring request module
const cors = require('cors');



var url = "https://api.mercadolibre.com/sites/MLA/search?q=";
var corsOptions = {
    origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}

app.use(cors());


app.get('/api/items', function(req, res) {

    var q = (typeof req.query.q !== 'undefined') ? req.query.q : "";

    request({
        url: url+q,
        json: false
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var categories = [];
            var items = [];
            const responseSearch = JSON.parse(body);
            for( i in responseSearch.available_filters ){
                filter = responseSearch.available_filters[i];
                if(filter.id == 'category') {
                    for (j in filter.values) {
                        categories.push(filter.values[j].name)
                        if(j ==3) break;
                    }
                    break;
                }
            }

            for ( i in responseSearch.results ){
                var item = {
                    id : responseSearch.results[i].id,
                    title: responseSearch.results[i].title,
                    condition: responseSearch.results[i].condition,
                    free_shipping: responseSearch.results[i].shipping.free_shipping,
                    picture: responseSearch.results[i].thumbnail,
                    price: {
                        "currency": responseSearch.results[i].currency_id,
                        "amount": responseSearch.results[i].price,

                    }
                };
                items.push(item);
                if (i == 3) break;
            }

            var responseApi = {
                "autor": {
                    "name": "Deivy Leonardo",
                    "lastname": "Avella Sánchez"
                },
                "categories": categories,
                "items": items
            }
            res.send(responseApi);
        }
    })
});




app.listen(8888, function() {
    console.log("Node server is running..");
});