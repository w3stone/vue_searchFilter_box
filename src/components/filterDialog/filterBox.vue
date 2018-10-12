<!--筛选条件(核心)-->
<template>
    <div class="filter_body clearfix">

        <filter-input-item v-for="(item,index) in searchList" :width="eachWidth"
            :name="item.Title" :required="item.Required" :key="index">

            <!--input框-->
            <el-input v-model="modelList[index].model[0]" clearable v-if="item.Type==0"
                placeholder="请输入内容" style="max-width:200px;">
            </el-input>
            
            <!--radio单选-->
            <el-radio-group v-model="modelList[index].model[0]" v-if="item.Type==1">
                <el-radio-button v-for="(itemc, indexc) in item.SelectItemList" 
                    :key="indexc" :label="JSON.stringify(itemc)">{{itemc.name}}
                </el-radio-button>
            </el-radio-group>

            <!--checkbox多选-->
            <el-checkbox :indeterminate="modelList[index].isIndeterminate" v-model="modelList[index].checkAll"
                @change="(val)=>{
                    modelList[index].model = val? transSearchList(item.SelectItemList): [];
                    modelList[index].isIndeterminate = false;
                }" slot="supply" v-if="item.Type==2">全选
            </el-checkbox>
            <el-checkbox-group v-model="modelList[index].model"  v-if="item.Type==2"
                @change="(value)=>{
                    checkALLFn(index, item.SelectItemList.length);
                }">
                <el-checkbox-button v-for="(itemc, indexc) in item.SelectItemList" 
                    :key="indexc" :label="JSON.stringify(itemc)">{{itemc.name}}
                </el-checkbox-button>
            </el-checkbox-group>

            <!--select单选-->
            <el-select v-model="modelList[index].model[0]" placeholder="请选择" v-if="item.Type==3">
                <el-option v-for="(itemc) in modelList[index].options"
                    :key="itemc.value" :label="itemc.name" :value="JSON.stringify(itemc)">
                </el-option>
            </el-select>

            <!--select多选-->
            <el-select v-model="modelList[index].model[0]" multiple placeholder="请选择" v-if="item.Type==4">
                <el-option v-for="(itemc) in modelList[index].options"
                    :key="itemc.value" :label="itemc.name" :value="JSON.stringify(itemc)">
                </el-option>
            </el-select>

            <!--自动补全-->
            <el-select v-model="modelList[index].model" multiple filterable remote reserve-keyword 
                placeholder="请输入关键词" :remote-method="(queryString)=>{
                    remoteMethod(queryString, item.SelectItemList, index);
                }" v-if="item.Type==5">
                <el-option v-for="(itemc) in modelList[index].options"
                    :key="itemc.value" :label="itemc.name" :value="JSON.stringify(itemc)">
                </el-option>
            </el-select>

            <!--级联多选框(可搜索)-->
            <el-select v-model="modelList[index].model" multiple filterable remote reserve-keyword 
                placeholder="请输入关键词" :remote-method="(queryString)=>{
                    remoteMethodMulti(queryString, item.SelectItemList, index);
                }" v-if="item.Type==6">
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
                    if(obj.type==5){
                        let tempArr = [];
                        if(obj.model.length>0){
                            obj.model.forEach(value=>{ //item:""
                                tempArr.push(value);
                            });
                            this.params[obj.name] = tempArr.join(","); //数组转字符串并添加到参数中
                        }else{
                            if(obj.required) unfilledList.push(obj.title); //判断必填项
                            this.params[obj.name] = "";
                        }

                    }else{
                        let tempArr = [];
                        console.log(obj.model);
                        if(obj.model.length>0){
                            obj.model.forEach((item)=>{ //item:{value:"",name:""}
                                tempArr.push( JSON.parse(item).value );
                            });
                            this.params[obj.name] = tempArr.join(","); //数组转字符串并添加到参数中
                        }else{
                            if(obj.required) unfilledList.push(obj.title); //判断必填项
                            this.params[obj.name] = "";
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

                    if(inputType==0){ //input框

                    }else if(inputType==1){ //radio单选
                        
                    }else if(inputType==2){ //checkbox多选
                        obj.checkAll = false;
                        obj.isIndeterminate = false;

                    }else if(inputType==3 || inputType==4){ //select框(单选&多选)
                        obj.options = item.SelectItemList;

                    }else if(inputType==5){ //自动补全
                        obj.options = item.SelectItemList.slice(0,20);

                    }else if(inputType==6){ //级联多选
                        let level1List = Enumerable.From(item.SelectItemList).Distinct("o=>o.name").ToArray();
                        obj.options = level1List.map(itemi=>{
                            let children = Enumerable.From(item.SelectItemList).Where((o)=>{return o.name==itemi.name;}).ToArray();
                            let options = children.map(itemc=>{
                                return {"name": itemc.CName, "value":itemc.value};
                            });
                            return {"name": itemi.name, "options":options}
                        });
                    }
                    this.modelList.push(obj);
                });
            },
            //重置options(select自动补全相关)
            remoteMethod(queryString, lists, index) { //lists:原始数据, index:autocomplete.models的索引
                let newList = [];
                if(queryString != ""){ //如果值不为空
                    //新数组匹配
                    lists.forEach((v,i)=>{
                        let val = v.name;
                        if(val.indexOf(queryString)!=-1){
                            let newObj = {};
                            newObj.value = v.value;
                            newObj.name = v.name;
                            newList.push(newObj);
                        }
                    });
                    this.modelList[index].options = newList; //返回有匹配值得数组
                }else{ //如果值为空
                    this.modelList[index].options= lists.slice(0,20); //返回数组前二十
                }
            },
            //重置options(select自动补全相关)
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
                if(type==1){

                }else{
                    let allModel = this.modelList[index].model;
                    allModel.forEach((item,i)=>{
                        if(item==model){
                            this.modelList[index].model.splice(i, 1);
                            return 1;
                        }
                    });
                }
                return 1;
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
                    let model=newVal[0], index=newVal[1], type=newVal[2], selectLength=newVal[3]; 
                    //console.log(model, index, type);
                    this.delModel(model, index, type);
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