import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        profileDialogVisible: false, //个人信息完善框可视状态
        filterDialogVisible: false, //筛选条件弹窗可视状态(弃用)
        chartDialogVisible: false, //二级图表弹框可视状态
        ifLoading: false, //是否正在加载
        searchList: [], //条件筛选列表
        modelListCopy: [], //筛选条件拷贝
        filterListItem: [], //即将被删除的筛选条件
        innerChartData: [] //弹框内部数据
    },
    getters:{
        getImgDomain (state) {
            return state.imgDomain;
        },
    },
    mutations: {
        setLoading(state, bol){
            state.ifLoading = bol;
        },
        changeProfileDgVisible(state, bol){ //改变个人信息弹框可视状态
            state.profileDialogVisible = bol;
        },
        changeFilterDgVisible(state, bol){ //改变筛选条件弹框可视状态(弃用)
            state.filterDialogVisible = bol;
        },
        changeChartDgVisible(state, bol){ //改变二级图表弹框可视状态
            state.chartDialogVisible = bol;
        },
        changeSearchList(state, list){
            state.searchList = list;
        },
        changeModelListCopy(state, list){
            state.modelListCopy = list;
        },
        changefilterListItem(state, list){
            state.filterListItem = list;
        },
        changeInnerChartData(state, data){
            state.innerChartData = data;
        }
        
    }

});

export default store