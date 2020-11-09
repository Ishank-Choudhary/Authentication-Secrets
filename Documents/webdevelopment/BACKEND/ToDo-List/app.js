//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//mongoose
const mongoose = require("mongoose");
//for capatilizing the first work of any web pages
const _ = require("lodash");
//ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect mongoose
mongoose.connect("mongodb+srv://admin-Ishank:Test123@cluster0.rm0nv.mongodb.net/todolistDB", {useNewUrlParser: true});
//create schema
const itemSchema = {
  name: String
};
// mongoose model
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: "Welcome to your todo list"
});
const item2 = new Item({
  name: "Hit + button to add a new item"
});
const item3 = new Item({
  name: "<-- hit this to delete an item"
});
const defaultItems = [item1,item2,item3];

//New schema for another web page
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model('List' , listSchema);

app.get('/' , function(req, response){
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
       Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
       }else{
        console.log("successfully add all items");
       }
       });
       response.redirect("/")
    }else{
          response.render("list" , {listTitle : "Today" , newListItems: foundItems});
        }
});

});
//for adding new pages to the list
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
List.findOne({name: customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      //create a new list
      const list = new List({
        name : customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"  + customListName);
    }
    else{
    //show an existing list
    res.render("list" , {listTitle : foundList.name , newListItems: foundList.items});
    }
  }
});

});




//Adding items to our todolist
app.post("/", function(req, res) {
  const itemName = req.body.newItem ;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
      List.findOne({name: listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listName);
      });
  }
});

//To delete a particular item after tapping onto its button
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("removed successfully");
        res.redirect("/");
      }

    });
  }

else{
    List.findOneAndUpdate({name: listName} , {$pull: {items: {_id: checkedItemId}}} , function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

//To listen on a particular port
app.listen(port,function(){
  console.log("server is started");
});
