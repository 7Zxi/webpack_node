import 'lib/common';
import '../css/home'
import $ from 'lib/zepto.min';
import common from 'lib/common'


console.log('this is home page', __publicMethod);

let image = document.createElement('img');
image.src = require('resource/3.jpg');
document.body.appendChild(image);

['1','2'].includes('q');

const qqq = new Set([1,1,2,2])

class Qzx {
    constructor(str){
        this.str = str;
        this.print()
    }

    print(){
        console.log(`hi,${this.str}`)
    }

}

let qzx = new Qzx('qzx');
console.log(qzx);

let promise = (number)=>{
    return new Promise((resolve, reject)=>{
        if(number > 5){
            resolve('true')
        }else{
            reject('false')
        }
    })
};
promise(10).then(value=>{
    console.log(value)
}).catch(value => {
    console.log(value)
});

