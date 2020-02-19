<template>
    <div ref="container" class="card">
        <slot></slot>
    </div>
</template>
<script>

export default {
    props: ['position'],
    data: function() {
		return {
			pos: this.position || {x: 0, y: 0}
		}
    },
    watch : {
        position(val) {
            let container = this.$refs.container;
            
        }
    }
};
</script>

<style lang="less">
.card {
    position: absolute;
    padding: 15px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .15);
    background-color: white;
    z-index: 103;
    top: 25px;
    left: 25px;
}
</style>
