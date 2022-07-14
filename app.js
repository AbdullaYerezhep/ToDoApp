const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
var _ = require('lodash')

const app = express()
const ejs = require('ejs')
const date = require(__dirname + '/date.js')

const itemSchema = {
    name: String
}

const Item = mongoose.model('item', itemSchema)

const listSchema ={
    name: String,
    items: [itemSchema]
}

const List = mongoose.model('list',listSchema)

const item1 = new Item({
    name: '<- Welcome to TODO list ->'
}
)
const item2 = new Item({
    name: "<-You can add new item by clicking '+'->"
}
)
const item3 = new Item({
    name: "<- To delete an item simply check it ->"
})

const defaultItems = [item1, item2, item3]

mongoose.connect('mongodb://localhost:27017/todoDB')



const itemArray = []



app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.static('public'))

app.get('/', (req, res) => {
    const day = 'Today'
  
    Item.find({},(err,items)=>{

            if(items.length === 0){
                Item.insertMany(defaultItems,(err)=>{
                    if(err){console.log(err)}
                })
                res.redirect('/')
            }else{
                res.render('lists', {
                    title: day,
                    items: items
                })
        }       
    })
    
})

    
app.get('/:route', (req, res) => {
    let title = req.params.route
    title = _.capitalize(title)
    List.findOne({name:title},(err,foundList)=>{
        if(!err){
            if(foundList){
                res.render('lists',{title:foundList.name, items:foundList.items})
            }else{
                const list = new List({
                    name:title,
                    items:defaultItems
                
                }) 
                list.save()
                res.redirect('/'+title)
            }
        }
    })
   
})


app.post('/', (req, res) => {

    const itemName = req.body.newItem
    const listName = req.body.list

    const newitem = new Item({
        name: itemName
    })
    if(listName === "Today"){
        
        newitem.save()
        res.redirect('/') 
    }else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.items.push(newitem)
            foundList.save()
            res.redirect('/'+listName)  
        })
              
    }
    
    
})

app.post('/delete',(req,res)=>{
    const checkedItemID = req.body.checkbox
    const listName = req.body.listName
    if(listName === 'Today'){
        Item.findByIdAndRemove(checkedItemID,(err)=>err?console.log(err):console.log('Item successfuly deleted!'))
        res.redirect('/')
    }else{
        List.findOneAndRemove({name:listName}, {$pull:{items:{_id:checkedItemID}}}, (err, foundList)=>{
            if(!err){
                res.redirect('/'+listName)
            }
        })
    }
})

app.get('/about', (req, res)=>{
    res.render('about',{})
})


app.listen('3000', () => console.log('Server is running on port 3000'))