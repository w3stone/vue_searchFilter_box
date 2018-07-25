import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        loginDomain: "/api/api",
        mainDomain: "/Pe",
        baseParams:{ //api基本参数
            appname: "Suvalue_DataModel",
            token: "350E6436-8A02-4683-9697-8AAD368B1D91", //校验码
            device: "3", //设备号 1 苹果 2 安卓 3 网页
            version: "1.0.0.0.0"
        },
        detailData: [],
        scroll: false, //是否滚动
        dialogVisible: false, //弹框可视状态
        updateList: [], //需要更新的列表
        submitTimes: 0, //提交次数
        modelId: "0" //modelId
    },
    getters:{
        getLoginDomain (state) {
            return state.loginDomain;
        },
        getMainDomain (state) {
            return state.mainDomain;
        },
        getScroll (state){
            return state.scroll;
        }
    },
    mutations: {
        changeScroll(state, bol) {
            state.scroll = bol;
        },
        changeModelId(state, id){
            state.modelId = id;
        },
        changeDialogVisible(state, bol){
            state.dialogVisible = bol;
        },
        changeDetailData(state, list){
            state.detailData = list;
        },
        changeUpdateList(state, list){
            state.updateList = list;
        },
        updateSubmitTimes(state){
            state.submitTimes++;
        }
        
    }

});

export default store