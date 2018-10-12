import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        domain: "http://api.suvalue.com/datasearch",
        baseParams:{ //api基本参数
            token: "350E6436-8A02-4683-9697-8AAD368B1D91", //校验码
            device: "3", //设备号 1 苹果 2 安卓 3 网页
            userid: "",
        },
        searchList: [], //条件筛选列表
        modelListCopy: [], //筛选条件拷贝
        filterListItem: [], //即将被删除的筛选条件
    },
    getters:{
        
    },
    mutations: {
        changeSearchList(state, list){
            state.searchList = list;
        },
        changeModelListCopy(state, list){
            state.modelListCopy = list;
        },
        changefilterListItem(state, list){
            state.filterListItem = list;
        }
        
    }

});

export default store