//jshint esversion:6

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require('ejs');
const _ = require("lodash")

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://Rahul_kumar:Rahul123@@cluster0.cphjdby.mongodb.net/todolistDB', { useNewUrlParser: true });
const itemSchema = {
    name: String
};
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: "Eat"
});

const item2 = new Item({
    name: "Sleep"
});

const item3 = new Item({
    name: "Repeat"
});


const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {


    Item.find({}).then(function (foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems).then(function () {
                if (defaultItems) {
                    console.log("hello people");

                } else {
                    console.log("not inserted")
                }
                res.redirect("/")



            })

        }
        res.render("list", { listStyle: "today", items: foundItems });



    });

});



app.post("/", function (req, res) {

    let itemName = _.capitalize(req.body.item);
    let listName = _.capitalize(req.body.list);

    const item = new Item({
        name: itemName
    });


    if(listName==="Today"){
        item.save();
        res.redirect("/");

    }else{
        List.findOne({ name: listName }).then((foundList) => {
            
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
                
            })
        
    
    }

    

    






})

app.post("/delete", function (req, res) {

    const checkedItemId = _.capitalize(req.body.checkbox);
    const listName = _.capitalize(req.body.listName);
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId).then(function () {
            if (checkedItemId) {
                console.log("delete item successfully")
            }
        });
    
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then((foundList)=>{
            if(foundList){
                res.redirect("/" + listName);
            }
        })
    }
    





})

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }).then((foundList) => {
        if (foundList) {
            res.render("list", { listStyle: foundList.name, items: foundList.items });
            
        }else{
              
        const list = new List({
            name: customListName,
            items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
            
        }
    });


});









app.listen(3000, function () {
    console.log("server is running successfully");
})
