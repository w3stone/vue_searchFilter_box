<template>
    <div class="home">

        <filter-menu :searchList="searchList" @paramsChanged="paramsChanged">
            <h3 class="title" slot="title">搜索框</h3>
        </filter-menu>

        <!--显示-->
        <div style="margin-top:80px;padding-left:20px;">{{params}}</div>
    </div>
</template>

<script>
    import filterMenu from '@/components/filterDialog/filterMenu'
    
    export default {
		name: "home",
        data: function() {
            return {
                searchList: [], //后端返回的所有搜索条件
                params: {}, //api参数
            }
        },
        mounted(){
            this.getData("/filter_data.json"); 
        },
        methods:{
            //获取数据
            getData(apiName){
                var url = "http://47.98.205.88:3000/api/filterBox" + apiName;
                this.axios.get(url).then((response) => {
                    var data = response.data.data;
                    //console.log(data);
                    this.searchList = data;

                }).catch((error)=>{
                    console.log(error);    
                });
            },
            //参数变化
            paramsChanged(data){
                //console.log(data);
                this.params = JSON.parse(JSON.stringify(data)); //深复制
            }
            
        },
        components:{
            filterMenu
        }

	}
</script>

<style lang="scss" type="text/css">
    .home{
        height: 100%;
        overflow-y: hidden;

        .title{
            float: left;
            line-height: 40px;
        }
    }

</style>