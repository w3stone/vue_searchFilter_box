/**柱状图表格
    data: {xdata,ydata,vdata, xUnit, yUnit...}
**/
function makeBarTable(data){
    var copydata = $.extend(true, {}, data); //深拷贝
    var xdata = copydata.xdata || [];
    var ydata = copydata.ydata || [];
    var vdata = copydata.vdata || [];
    var xTitle = copydata.xTitle; //x轴单位
    var yTitle = copydata.yTitle; //y轴单位
    var xUnit = copydata.xUnit; //x轴单位
    var yUnit = copydata.yUnit; //y轴单位
    var chartType = copydata.chartType;
    
    xdata.unshift(""); //在xdata前插入空字符串

    if(xUnit){ //如果有x轴单位
        xdata.forEach(function(item, index){
            if(index != 0){
                xdata[index] = item + "(" + xUnit + ")";
            }
        });
    }

    vdata.forEach(function(arr, index){
        if(chartType==105){ //需要转成%
            arr.forEach(function(val, i){
                arr[i] = val+"%";
            });
            arr.unshift(ydata[index]);
        }else{ //不需要转成%
            if(yUnit){
                arr.forEach(function(val, i){
                    arr[i] = val+ "(" + yUnit + ")";
                });
            }
            arr.unshift(ydata[index] + "(" + yUnit + ")");
        } 
    });

    return {
        thead: xdata,
        tbody: vdata
    };
}


// function makePieTable(data){
//     var copydata = $.extend(true, {}, data); //深拷贝

//     var legenddata = copydata.legenddata || [];
//     var vdata = copydata.vdata || [];

//     var tbody = [];

//     var sum = eval(vdata.join("+"));
    
//     legenddata.forEach((val,index)=>{
//         var arr = [val, ((vdata[index]/sum)*100).toFixed(2)+"%"];
//         tbody.push(arr);
//     });

//     return {
//         thead: ["分类", "比例"],
//         tbody: tbody
//     };
// }


function make2DTable(data, ifPer){
    ifPer = ifPer!=undefined? ifPer: true; //默认需要转成比例
    var copydata = $.extend(true, {}, data); //深拷贝
    var chartData = copydata.chartData;
    //console.log(chartData);
    var sum = 1;
    var tbody = [];

    if(ifPer)
        sum = Enumerable.From(chartData).Sum('o=>o.value');

    chartData.forEach((item)=>{
        var arr = ifPer? [item.name, ((item.value/sum)*100).toFixed(2)+"%"]: [item.name, item.value];
        tbody.push(arr);
    })

    return {
        thead: ifPer? ["名称", "比例"]: ["名称", "值"],
        tbody: tbody
    };
}

export{
    makeBarTable, make2DTable
}