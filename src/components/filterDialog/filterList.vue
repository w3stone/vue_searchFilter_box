<template>
    <!--筛选条件-->
    <ul class="filter_list clearfix">
        <li v-for="(item,index) in filterList" :key="index" v-show="item.length">
            <span>{{ (item[2]!=5 && item[2]!=0)? JSON.parse(item[0]).name: item[0] }}</span>
            <i class="cancelBtn el-icon-close" @click="del(item)"></i>
        </li>
    </ul>
</template>

<script>
    import {mapState, mapMutations} from 'vuex'
    
    export default {
        name: "filter_list",
        computed:{
            filterList(){ //最终筛选条件
                let arr = [];
                this.modelListCopy.forEach((obj, index)=>{
                    obj.model.forEach((item)=>{
                        arr.push( [item, index, obj.type, obj.listLength] );
                    });
                    
                });
                this.$emit("filterListChange", arr.length);
                return arr; //格式:[[model(string), index, type]]
            },
            //获取vuex的传值
            ...mapState({
                "modelListCopy": state=>state.modelListCopy
            }),
    
        },
        methods:{
            ...mapMutations({
                changefilterListItem:"changefilterListItem"
            }),
            del(list){
                this.changefilterListItem(list);
            }
        }

	}
</script>

<style lang="scss" type="text/css" scoped="">
    .filter_list{
        padding-left: 10px;

        li{
            position: relative;
            float: left;
            border: 1px solid $mainColor;
            border-radius: 2px;
            padding: 0 10px;
            margin: 2px 6px;
            height: 30px;
            line-height: 30px;
            background-color: $mainColor;
            color: #fff;
            cursor: default;

            i{
                font-family: Consolas;
                position: relative;
                transform: translateY(-50%);
                top: 9.5px;
                right: -6px;
                color: #fff;
                font-size: 18px;
                cursor: pointer;
            }
        }
    }

</style>