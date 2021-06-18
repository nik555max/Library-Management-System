import alert from 'alert';
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const app = express();
alert('howdy');

app.listen('4000', function(req,res){
    console.log('Server is running at port 4000');
})
