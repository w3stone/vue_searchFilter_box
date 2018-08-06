<template>
    <div class="filterInput_item" :style="{'width':width}">
        <div class="inner">
            <div class="title_bar clearfix">
                <h4 class="title">{{name}}
                    <span class="required" v-show="required">*</span>
                </h4>
                <div class="supply">
                    <slot name="supply"></slot>
                </div>
            </div>
            <div class="right">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "filterItem",
        props: ["name", "required", "width"] //父级传值
	}
</script>

<style lang="scss" scoped="" type="text/css">
    .filterInput_item{
        //padding: 25px 0;

        .inner{
            //width: 80%;
            padding: 4px;
        }

        .title_bar{
            margin-bottom: 10px;
            border-bottom: 1px dashed #ddd;
            padding-bottom: 10px;

            .title{
                float: left;
                font-weight: normal;
                height: 20px;
                line-height: 20px;
                padding-left: 6px;

                .required{
                    color: red;
                    margin-left: 4px; 
                }
            }
            .supply{ //补充内容
                float: right;
                padding-right: 5px;
            }
        }

    }

</style>