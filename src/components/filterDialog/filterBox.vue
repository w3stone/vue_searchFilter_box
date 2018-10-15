<!--筛选条件(核心)-->
<template>
    <div class="filter_body clearfix">

        <filter-input-item v-for="(item,index) in searchList" :width="eachWidth"
            :name="item.Title" :required="item.Required" :key="index">

            <!--1、input框-->
            <el-input v-model="modelList[index].model[0]" v-if="item.Type==1" placeholder="请输入内容" 
                style="max-width:200px;">
            </el-input>
            
            <!--2、radio单选-->
            <el-radio-group v-model="modelList[index].model[0]" v-if="item.Type==2">
                <el-radio-button v-for="(itemc, indexc) in item.SelectItemList" 
                    :key="indexc" :label="JSON.stringify(itemc)">{{itemc.name}}
                </el-radio-button>
            </el-radio-group>

            <!--3、checkbox多选-->
            <el-checkbox :indeterminate="modelList[index].isIndeterminate" v-model="modelList[index].checkAll"
                @change="(val)=>{
                    modelList[index].model = val? transSearchList(item.SelectItemList): [];
                    modelList[index].isIndeterminate = false;
                }" slot="supply" v-if="item.Type==3">全选
            </el-checkbox>
            <el-checkbox-group v-model="modelList[index].model"  v-if="item.Type==3"
                @change="(value)=>{
                    checkALLFn(index, item.SelectItemList.length);
                }">
                <el-checkbox-button v-for="(itemc, indexc) in item.SelectItemList" 
                    :key="indexc" :label="JSON.stringify(itemc)">{{itemc.name}}
                </el-checkbox-button>
            </el-checkbox-group>

            <!--4、select单选-->
            <el-select v-model="modelList[index].model[0]" placeholder="请选择" v-if="item.Type==4">
                <el-option v-for="(itemc) in modelList[index].options"
                    :key="itemc.value" :label="itemc.name" :value="JSON.stringify(itemc)">
                </el-option>
            </el-select>

            <!--5、select多选-->
            <el-select v-model="modelList[index].model" multiple placeholder="请选择" v-if="item.Type==5">
                <el-option v-for="(itemc) in modelList[index].options"
                    :key="itemc.value" :label="itemc.name" :value="JSON.stringify(itemc)">
                </el-option>
            </el-select>

            <!--6、自动补全单选(本地)-->
            <el-autocomplete v-model="modelList[index].model[0]" 
                :fetch-suggestions="(queryString, callbacK)=>{querySearchLocal(queryString, callbacK, item.SelectItemList)}"
                placeholder="请输入内容" v-if="item.Type==6 && item.LoadType==1">
            </el-autocomplete>

            <!--6、自动补全单选(网络)-->
            <el-autocomplete v-model="modelList[index].model[0]" 
                :fetch-suggestions="(queryString, callbacK)=>{querySearchAsync(queryString, callbacK, item.ID, item.CName)}" 
                placeholder="请输入内容" v-if="item.Type==6 && item.LoadType==3">
            </el-autocomplete>

            <!--7、自动补全多选(本地)-->
            <el-select v-model="modelList[index].model" multiple filterable remote reserve-keyword 
                placeholder="请输入关键词" :remote-method="(queryString)=>{
                    remoteMethodLocal(queryString, index, item.SelectItemList);
                }" v-if="item.Type==7 && item.LoadType==1">
                <el-option v-for="(itemc) in modelList[index].options"
                    :key="itemc.value" :label="itemc.name" :value="JSON.stringify(itemc)">
                </el-option>
            </el-select>

            <!--7、自动补全多选(网络)-->
            <el-select v-model="modelList[index].model" multiple filterable remote reserve-keyword 
                placeholder="请输入关键词" :remote-method="(queryString)=>{
                    remoteMethodAsync(queryString, index, item.ID, item.CName);
                }" v-if="item.Type==7 && item.LoadType==2">
                <el-option v-for="(itemc) in modelList[index].options"
                    :key="itemc.value" :label="itemc.name" :value="JSON.stringify(itemc)">
                </el-option>
            </el-select>

            <!--级联多选框(可搜索)-->
            <el-select v-model="modelList[index].model" multiple filterable remote reserve-keyword 
                placeholder="请输入关键词" :remote-method="(queryString)=>{
                    remoteMethodMulti(queryString, item.SelectItemList, index);
                }" v-if="false">
                <el-option-group v-for="group in modelList[index].options"
                    :key="group.name"
                    :label="group.name" @click.native="multiCheckAll(group.name, index)">
                    <el-option
                        v-for="itemc in group.options"
                        :key="itemc.value"
                        :label="itemc.name"
                        :value="itemc.value">
                    </el-option>
                </el-option-group>
            </el-select>

        </filter-input-item>

    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex'
    import filterInputItem from './filterInputItem'
    
    export default {
        name: "filterBody",
        props:{
            searchList:{type: Array}
        },
        data(){
            return {
                params:{}, //参数
                allList: [],
                modelList:[], //所有的modelList
                apiName: "/selection/selectiondelaydata", //实时调接口api
                loading: false
            }
        },
        computed:{
            //获取vuex的传值
            ...mapState({
                //"searchList": state=>state.searchList, //获取搜索条件列表
                "filterListItem": state=>state.filterListItem,
                "modelListCopy": state=>state.modelListCopy
            }),
            level3Id(){ //三级菜单id(用作参数)
                let chartId = this.$route.query.chartId;
                return  (typeof chartId != "undefined") ? chartId.split("-")[1]: 0;
            },
            eachWidth(){
                return parseInt(100/this.searchList.length) + "%";
            }
        },
        methods:{
            ...mapMutations({
                changeModelListCopy:"changeModelListCopy"
            }),
            //拼接参数方法
            setParas(){
                let unfilledList = []; //未填写的必填项

                this.modelList.forEach((obj)=>{
                    let inputType = obj.type; //表单控件类型
                    let inputModel = obj.model; //表单model
                    let paramsName = obj.name; //作为参数名

                    if(!inputModel.length>0){
                        if(obj.required) unfilledList.push(obj.title); //判断必填项
                        this.params[paramsName] = "";

                    }else{
                        if(inputType==10){ //级联多选
                            let tempArr = [];
                            inputModel.forEach(value=>{ //item:""
                                tempArr.push(value);
                            });
                            this.params[paramsName] = tempArr.join(","); //数组转字符串并添加到参数中

                        }else if(inputType==1 || inputType==6){ //普通input
                            this.params[paramsName] = inputModel[0];

                        }else{
                            let tempArr = [];

                            inputModel.forEach((item)=>{ //item:{value:"",name:""}
                                tempArr.push( JSON.parse(item).value );
                            });
                            this.params[paramsName] = tempArr.join(","); //数组转字符串并添加到参数中
                        }
                    }

                });
                
                this.$emit("hasUnfilled", unfilledList);

                if(unfilledList.length==0){ //如果没有未填项目
                    this.params.MenuID = parseInt(this.level3Id); //重新设置MenuID
                    //console.log(this.params);
                    this.$emit("paramsChanged", this.params); //向父组件传递参数
                }
                
            },
            //搜索条件分类,并动态生成v-model(核心方法)
            modifySelectType(){
                //console.log(this.searchList);
                this.searchList.forEach((item) => { //动态生成v-model
                    let obj = {"name":item.CName, "title":item.Title, "required":item.Required, "type":item.Type,
                        "listLength":item.SelectItemList.length, "model":[]};

                    let inputType = item.Type; //表单样式类型
                    let selectOptions = item.SelectItemList; //select条件

                    if(inputType==1){ //input框

                    }else if(inputType==2){ //radio单选
                        
                    }else if(inputType==3){ //checkbox多选
                        obj.checkAll = false;
                        obj.isIndeterminate = false;

                    }else if(inputType==4 || inputType==5){ //select框(单选&多选)
                        obj.options = selectOptions;

                    }else if(inputType==6 || inputType==7){ //自动补全(单选&多选)(本地&网络)
                        obj.options = [];
                        obj.id = item.ID; //设置id

                    }else if(inputType==6){ //级联多选
                        let level1List = Enumerable.From(selectOptions).Distinct("o=>o.name").ToArray();
                        obj.options = level1List.map(itemi=>{
                            let children = Enumerable.From(selectOptions).Where((o)=>{return o.name==itemi.name;}).ToArray();
                            let options = children.map(itemc=>{
                                return {"name": itemc.CName, "value":itemc.value};
                            });
                            return {"name": itemi.name, "options":options}
                        });
                    }
                    this.modelList.push(obj);
                });
            },
            /**********/
            //自动补全单选
            querySearchLocal(queryString, callback, list){
                //console.log(list);
                let result = queryString? list.filter((o)=>{ return o.name.indexOf(queryString)!=-1 }): list.slice(0,20);
                result = result.map((o)=>{return {"value": o.name}});
                callback(result);
            },
            //实时调接口方法(自动补全单选)
            querySearchAsync(queryString, callback, selectionId, extraName) {
                if(!queryString){
                    callback([]);
                    return false;
                };

                let params = {};
                params.selectionId = selectionId;
                params[extraName] = queryString; //补充参数

                this.$dataPost(this.apiName, params, (data)=>{
                    //console.log(data);
                    let result = data.SelectItemList.map((o)=>{return {"value": o.name}}); //?
                    callback(result);
                });
            },
            //重置options(自动补全多选相关)
            remoteMethodLocal(queryString, index, lists) { //lists:原始数据, index:autocomplete.models的索引
                let result = queryString? lists.filter((o)=>{ return o.name.indexOf(queryString)!=-1 }): lists.slice(0,20);
                this.modelList[index].options = result;
            },
            //重置options(自动补全多选相关)
            remoteMethodAsync(queryString, index, selectionId, extraName){
                let result = [];

                if(queryString){
                    let params = {};
                    params.selectionId = selectionId;
                    params[extraName] = queryString; //补充参数

                    this.$dataPost(this.apiName, params, (data)=>{
                        result = data.SelectItemList;
                    });
                }
                this.modelList[index].options = result;
            },
            //重置options(自动补全多选相关)
            remoteMethodMulti(queryString, lists, index) { //lists:原始数据, index:autocomplete.models的索引
                let mappedList = Enumerable.From(lists).Where((o)=>{return o.CName.indexOf(queryString)!=-1 
                    || o.name.indexOf(queryString)!=-1 }).ToArray();
                let level1List = Enumerable.From(mappedList).Distinct("o=>o.name").ToArray();

                this.modelList[index].options = level1List.map(item=>{
                    let children = Enumerable.From(mappedList).Where((o)=>{return o.name==item.name;}).ToArray();

                    let options = children.map(itemc=>{
                        return {"name": itemc.CName, "value":itemc.value};
                    });
                    
                    return {"name": item.name, "options":options}
                });
            },
            //根据index删除对应的model内的项
            delModel(model, index, type){
                //console.log(model, index, type);
                let allModel = this.modelList[index].model;
                allModel.forEach((item,i)=>{
                    if(item==model){
                        this.modelList[index].model.splice(i, 1);
                    }
                });
            },
            //全选半选不选判断
            checkALLFn(index, selectLength){
                let checkedCount = this.modelList[index].model.length;
                //this.modelList[index].checkAll = (checkedCount==item.SelectItemList.legnth);
                this.modelList[index].checkAll = checkedCount? true: false;
                this.modelList[index].isIndeterminate = checkedCount>0 && checkedCount<selectLength;
            },
            //多级select全选
            multiCheckAll(value, index){
                let level1list = Enumerable.From(this.modelList[index].options).Where((o)=>{return o.name==value;}).ToArray();
                let level2list = level1list[0].options;
                if(this.modelList[index].model.length < level2list.length){ //全选
                    this.modelList[index].model = Enumerable.From(level2list).Select("o=>o.value").ToArray();
                }else{ //取消全选
                    this.modelList[index].model = [];
                }
            },
            transSearchList(list){
                var newArr = [];
                list.forEach((item)=>{
                    newArr.push( JSON.stringify(item) )
                });
                return newArr;
            }
        },
        watch:{
            searchList:{
                handler(newVal, oldVal){
                    //console.log(newVal, oldVal);
                    this.params = {}; //清空
                    this.modelList = []; //清空
                    this.modifySelectType();
                    
                    let usefulModelList = Enumerable.From(this.modelListCopy).Where((o)=>{return o.model.length>0;}).ToArray();
                    //console.log(usefulModelList);
                    usefulModelList.forEach((mitem)=>{ //循环已经选择的项
                        newVal.forEach((sitem, index)=>{ //循环新条件
                            debugger;
                            if(sitem.CName==mitem.name){
                                this.modelList[index].model = mitem.model; //设置新model默认值
                                return true;
                            }
                        });
                    })

                    
                }
            },
            modelList:{
                deep:true,
                handler(newVal, oldVal){
                    this.changeModelListCopy(newVal); //改变vuex值,向filterList传值
                    this.setParas();
                }
            },
            filterListItem:{
                handler(newVal, oldVal){
                    let model=newVal.model, index=newVal.index, type=newVal.type, selectLength=newVal.length; 
                    console.log(newVal);
                    //console.log(model, index, type);
                    this.delModel(model, index, type);
                    //取消全选状态
                    if(type==2)
                        this.checkALLFn(index, selectLength);
                }
            }
        },
        components:{
            filterInputItem
        }

	}
</script>

<style lang="scss" type="text/css">
    .filter_body{
        background: #f8f8f8;
        padding: 10px 0;

        .filter_moudle{
            float: left;
        }
        .filterInput_item{
            //float: left;
            display: table-cell;
            border-right: 1px dashed #ddd;
            padding: 0 8px;
        }

        //重置样式
        .el-input{
            margin-top: 4px !important;
            //margin-left: 4px !important;
        }
        .el-checkbox-button{
            margin: 4px;
        }
        .el-checkbox-button__inner{
            border-left: 1px solid #dcdfe6;
        }
        .el-radio-button{
            margin: 4px;
        }
        .el-radio-button__inner{
            border-left: 1px solid #dcdfe6;
        }
    }
</style>