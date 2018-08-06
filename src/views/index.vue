<template>
    <div class="home">
        <!--筛选条件-->
        <div class="filter_box clearfix" v-show="isShowing">
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
    import filterBox from '@/components/filterDialog/filterBox'
    import filterList from '@/components/filterDialog/filterList'
    
    export default {
		name: "detail",
        data: function() {
            return {
                chartList: [], //用于存储返回的图表数据
                params: {}, //api参数
                filterLength: 0,
                unfilledList: [], //没有填的必选项集合
                dialogChanged: 0, //用于记录params变化次数
                level2Name: "",
                level3Name: "",
                isShowing: true, //筛选条件是否展示
                demoPicShow: true,
                config: { //图表配置项
                    barConfig: {
                        barWidth: '30%' //柱状图宽度
                    }
                },
            }
        },
        computed:{
            level1Id(){ //一级菜单id
                return this.$route.query.menuId;
            },
            level3Id(){ //三级菜单id
                let chartId = this.$route.query.chartId;
                let finalId = (typeof chartId != "undefined") ? chartId.split("-")[1]: 0;
                return finalId;
            },
            //获取vuex的传值
            ...mapState({
                "searchList": state=>state.searchList
            })
        },
        mounted(){
            //console.log("进入detail");
            this.params = {}; //清空参数
            this.chartList = []; //清空
            this.filterList = []; //清空
        },
        methods:{
            ...mapMutations({
                ifLoading: 'setLoading', //改变加载状态
                innerChartData: 'changeInnerChartData',
                changeFilterDgVisible:"changeFilterDgVisible"
            }),
            paramsChanged(data){
                this.dialogChanged++;
                this.params = data;
            },
            hasUnfilled(data){
                this.unfilledList = data;
            },
            //获取图表信息
            searchChart(){
                //console.log(this.unfilledList);
                //console.log(this.params);
                
                if(this.unfilledList.length>0){ //如果有必填项未填
                    this.$message({message: this.unfilledList.join(",") + '为必填项！', type: 'error'});

                }else{
                    this.ifLoading(true); // 打开加载动画
                    this.chartList = []; //清空

                    this.$dataPost("/Report/Search", this.params, (data) => {
                        let workedData = Enumerable.From(data).Where((i) => { return i.chartData.length!=0;}).OrderBy().ToArray();
                        this.chartList = workedData;
                        //console.log(this.chartList);
                        this.isShowing = false;
                        this.demoPicShow = false;
                        this.ifLoading(false); //关闭加载动画
                    });
                } 
            },
            //菜单选项改变
            leftMenuChanged(level2Name, level3Name){
                this.level2Name = level2Name;
                this.level3Name = level3Name;
            },
            filterListChange(legnth){
                this.filterLength = legnth;
            },
            toggleShow(){
                this.isShowing = !this.isShowing;
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
    .home{
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