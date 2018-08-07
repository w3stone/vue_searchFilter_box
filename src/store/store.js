import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
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