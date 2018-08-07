<template>
    <div class="filter_box">
        <!--筛选条件-->
        <div class="filter_box clearfix">
            <filter-box @paramsChanged="paramsChanged" @hasUnfilled="hasUnfilled"></filter-box>
        </div>

        <!--筛选条件-->
        <div class="filter_bar top_bar clearfix">
            <p>筛选条件: </p>
            <filter-list @filterListChange="filterListChange"></filter-list>
            <el-button type="primary" icon="el-icon-search" class="filterBtn" @click="searchChart()">查询</el-button>
        </div>
    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex'
    import filterBox from './filterBox'
    import filterList from './filterList'
    
    export default {
		name: "filter_box",
        data: function() {
            return {
                chartList: [], //用于存储返回的图表数据
                params: {}, //api参数
                filterLength: 0,
                unfilledList: [], //没有填的必选项集合
                dialogChanged: 0 //用于记录params变化次数
            }
        },
        computed:{
            //获取vuex的传值
            ...mapState({
                "searchList": state=>state.searchList
            }),
            showParas(){
                return JSON.stringify(this.params);
            }
        },
        mounted(){
            this.getData("/data01.json");
           
        },
        methods:{
            ...mapMutations({
                changeSearchList: "changeSearchList"
            }),
            //获取数据
            getData(apiName){
                var url = "http://47.98.205.88:3000/api/filterBox" + apiName;
                this.axios.get(url).then((response) => {
                    var data = response.data.data;
                    console.log(data);
                    this.changeSearchList(data);


                }).catch((error)=>{
                    console.log(error);    
                });
            },
            paramsChanged(data){
                console.log(data);
                this.params = data;
            },
            hasUnfilled(data){
                this.unfilledList = data;
            },
            //获取图表信息
            searchChart(){
                if(this.unfilledList.length>0){ //如果有必填项未填
                    this.$message({message: this.unfilledList.join(",") + '为必填项！', type: 'error'});
                }else{
                    console.log(this.params);
                }
            },
            filterListChange(legnth){
                this.filterLength = legnth;
            }
        },
        watch:{
            level3Id:{ //如果第三级菜单id发生变化
                handler(newVal, oldVal){
                    this.isShowing = true;
                    this.params.MenuID = parseInt(this.level3Id); //重新设置MenuID

                    if(this.filterLength>0){
                        //this.params.MenuID = parseInt(this.level3Id); //重新设置MenuID
                        this.searchChart(); //重新搜索
                    }else{
                        this.chartList = []; //清空
                        //this.ifLoading(false);
                    }
                }
            },
            chartList:{
                handler(newVal, oldVal){
                    //console.log(newVal, oldVal);
                }
            }
        },
        components:{
            filterBox, filterList
        }

	}
</script>

<style lang="scss" type="text/css">
    .filter_box{
        height: 100%;
        overflow-y: hidden;
        
        .right{
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;
        }
        .top_bar{
            position: relative;
            padding: 8px 18px;
            font-size: 16px;
            background-color: #fff;

            p{
                float: left;
                height: 40px;
                line-height: 40px;
            }
        }

        //当前位置
        .location_bar{
            height: 40px;

            .collapseBtn{
                float: right;
                margin-top: 8px;
                cursor: pointer;

                i{
                    &.hover{
                        transform: rotate(180deg);
                        transition: all .5s;
                    }
                    &.unhover{
                        transform: rotate(360deg);
                        transition: all .5s;
                    }
                }
            }
            ul{
                float: left;
                padding-left: 6px;
                line-height: 40px;

                li{
                    float: left;
                    &.arrow{
                        color: #b0b0b0;
                        margin: 0 4px;
                    }
                }
            }
        }
        //筛选条件
        .filter_bar{
            border-top: 1px dashed #e0e0e1;
            border-bottom: 1px solid #e0e0e1;

            ul{
                float: left;
                width: 80%;
            }
            .filterBtn{
                float: right;
            }
            
        }

        //图表页面
        .charts_page{
            padding: 16px;
        }

    }

</style>