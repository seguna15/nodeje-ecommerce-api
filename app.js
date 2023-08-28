const express = require('express');
const morgan = require('morgan');
require('dotenv/config');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { connection } = require('./util/dbConnect');
const categoriesRoutes = require('./routers/categories.router')
const productsRoutes = require('./routers/products.router');
const usersRoutes = require('./routers/users.router');
const ordersRoutes = require('./routers/orders.router');
const authJwt = require('./util/jwt');
const  {errorHandler}  = require('./middlewares/error-handler');


const app = express();

//allow request for all origins
app.use(cors());
//all http request from other origin
app.options('*', cors);

const API_URL = process.env.API_URL;
const PORT= process.env.PORT;
const __logdir = process.env.LOG_DIR;

// create the access.log file in append mode
const accessLogStream =  fs.createWriteStream(path.join(__dirname, __logdir, 'access.log'), {
    flags: 'a',
})

//allow data to be passed to the backend in json format
app.use(express.json());
//middleware to log requests
app.use(morgan('combined', { stream: accessLogStream }))
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler)
//product router
app.use(`${API_URL}/categories`, categoriesRoutes)
app.use(`${API_URL}/products`, productsRoutes)
app.use(`${API_URL}/users`, usersRoutes)
app.use(`${API_URL}/orders`, ordersRoutes)

//database connection function from utils/dbConnect.js
connection()



app.listen(PORT, () => {
    console.log(`app listening on http://localhost:${PORT}`);
})
