require('dotenv').config()
const express = require("express");
const app = express();
const ejs = require("ejs")
const expressLayout = require("express-ejs-layouts");
const path = require('path');
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const emmiter = require('events');


app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
app.use(express.json())


app.use(expressLayout);
app.set('views', path.join(__dirname,"/resources/views"))
app.set('view engine','ejs');



//database connection
mongoose.connect("mongodb://localhost:27017/icecreamdb",({useNewUrlParser:true , useUnifiedTopology:true, useCreateIndex:true, }));

const connection = mongoose.connection;
connection.once('open',()=>{
    console.log("mongoose connected");
})

let mongoStore = new MongoDbStore({
    mongooseConnection:connection,
    collection: 'sessions',
})
const eventEmitter = new emmiter();
app.set('eventEmitter',eventEmitter);
app.use(session({
    secret:process.env.SECRET_KEY,
    saveUninitialized:false,
    resave:false,
    store:mongoStore,
    cookie: {maxAge:1000*60*60*24}
}))
app.use(flash());
const passportInit = require('./app/config/passport');

passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());
//middleware
app.use((req,res,next)=>{
    res.locals.session = req.session;
    res.locals.user = req.user;
    next()
})
require('./routes/web')(app);

const server = app.listen(PORT,()=>{console.log(`server has started on ${PORT}`)});
const io = require('socket.io')(server);
io.on('connection',(socket)=>{
   
    socket.on('join',(orderId)=>{
       
       socket.join(orderId);
    })
})
eventEmitter.on('orderUpdated',(data)=>{
          io.to(`order_${data.id}`).emit('orderUpdated',data);
})
eventEmitter.on('adminOrderUpdated',(data)=>{
    io.to('adminRoom').emit('adminOrderUpdated',data);
})