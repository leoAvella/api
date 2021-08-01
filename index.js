var express = require("express"); //requiring express module
var app = express(); //creating express instance
var fs = require("fs"); //require fs(file system) module
var request = require("request"); //requiring request module
const cors = require('cors');



var url = "https://api.mercadolibre.com/sites/MLA/search?q=";

var author = {
        "name": "Deivy Leonardo",
        "lastname": "Avella Sánchez"
    };
app.use(cors());


app.get('/api/item/:id', function (req, res) {
    var endPoint = "https://api.mercadolibre.com/items/";

    var id = req.params.id;
    request({
        url: endPoint+id,
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const responseItem = JSON.parse(body);
            var item = {
                "id": responseItem.id,
                "title": responseItem.title,
                "price": {
                    "currency": responseItem.currency_id,
                    "amount": responseItem.base_price,
                    "decimals": responseItem.price,
                },
                "picture": responseItem.pictures[0].url,
                "condition": responseItem.condition,
                "free_shipping": responseItem.shipping.free_shipping,
                "sold_quantity": responseItem.sold_quantity,
                "description": ""
            }

            var responseApi = {
                "author": author,
                "item": item,
            }
            request({
                url: endPoint+id+"/description",
            },function (errorD, responseD, bodyD) {
                if (!errorD && responseD.statusCode === 200) {
                    const responseDescription = JSON.parse(bodyD);
                    responseApi.item.description = responseDescription.plain_text;
                }
                res.send(responseApi);
            })
        } else {
            res.send(response);
        }
    })
});

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
            for( i in responseSearch.filters ){
                filter = responseSearch.filters[i];
                if(filter.id == 'category') {
                    for (j in filter.values) {
                        category = filter.values[j];
                        for (k in category.path_from_root) {
                            categories.push(category.path_from_root[k].name);
                        }
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

                    },
                    state_name: responseSearch.results[i].address.state_name
                };
                items.push(item);
                if (i == 3) break;
            }

            var responseApi = {
                "author": author,
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