import axios from 'axios'
import {Message} from 'element-ui' //获取消息框
import {getSession} from './storageFn.js'
import store from '@/store/store.js'

var domain = store.state.domain; //api域名
var baseParams = store.state.baseParams; //基础参数


function initFn(params, callback, argument){
    //如果没有参数
    if (typeof argument == "function"){
        callback = argument;
        params = {};
    }

    //对象合并,确定最终参数
    return {
        nparams: Object.assign(params, baseParams),
        callback: callback
    } 
}


//ajaxGet封装
function dataGet(apiName, params, callback){
    var url = domain + apiName;
    var obj = initFn(params, callback, arguments[1]);
    var nparams = obj.nparams;
    callback = obj.callback;

    axios.get(url, {params: nparams}).then((response) => {
        var all = response.data;
        var data = response.data.data;

        if(all.state!=1)
            console.log(all.state, all.message);

        if(callback) callback(data, all);

    }).catch((error)=>{
        console.log(error);    
    });
}


//ajaxPost封装
function dataPost(apiName, params, callback){
    var url = domain + apiName;
    var obj = initFn(params, callback, arguments[1]);
    var nparams = obj.nparams;
    callback = obj.callback;

    axios.post(url, nparams).then((response) => {
        var all = response.data;
        var data = response.data.data;
        
        if(all.state==1){ //成功
            if(callback) callback(data, all);
        }else{ //失败
            console.log(all.state, all.message);
        }
        
    }).catch((error)=>{
        console.log(error);
    });
}


//ajaxPost封装(含交互)
function dataPostXD(apiName, params, callback){
    var url = domain + apiName;
    //如果没有参数
    if (typeof arguments[1] == "function"){
        callback = arguments[1];
        params = {};
    }
    //对象合并,确定最终参数
    var nparams = $.extend({}, params, baseParams); 

    axios.post(url, nparams).then((response) => {
        var all = response.data;
        var data = response.data.data;
        
        if(all.state==1){ //成功
            Message({message: '操作成功！', type: 'success'});
            if(callback) callback(data, all);

        }else{ //失败
            console.log(all.state, all.message);
            Message({message: '操作失败！', type: 'error'});
        }
        
    }).catch((error)=>{
        console.log(error);
        Message({message: '操作失败！', type: 'error'});
    });
}


export{
    dataGet, dataPost, dataPostXD
}
