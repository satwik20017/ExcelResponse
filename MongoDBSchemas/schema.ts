import mongoose from 'mongoose'
const eschema = new mongoose.Schema({
    imagepath:{type:String},
    empno:{type:Number},
    ename:{type:String},
    sal:{type:Number}
})

export const Schema = mongoose.model('emp',eschema,'emp')