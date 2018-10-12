<template>
    <div class="home">
        <div class="selection_box">
            <span>菜单id:</span>
            <el-input class="menu_input" v-model="menuId"></el-input>
            <el-button @click="getSearchList">change</el-button>
        </div>

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
                menuId: 1 //菜单id
            }
        },
        mounted(){

        },
        methods:{
            getSearchList(){
                this.$dataGet("/Selection/GetSelectionByMenuID", {"menuID": this.menuId+731}, (data)=>{
                    this.searchList = data;
                    console.log(data);
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

        .selection_box{
            background-color: #ededed;
            padding: 20px 20px;
            border-bottom: 1px solid #ddd;

            .menu_input{
                width: 200px;
            }
        }

        .title{
            float: left;
            line-height: 40px;
        }
    }

</style>