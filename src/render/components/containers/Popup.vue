<template>
    <div v-bind:class="{'hidden': !visible, 'visible': visible}">
        <div class="overlay" v-on:click="toggle(false)"></div>
        <div class="popup">
            <div class="header">
                <slot name="title"></slot>
            </div>
            <div class="body">
                <slot name="content"></slot>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Popup",
        data() {
            return {
                visible: false,
            }
        },
        methods: {
            /**
             * Toggles the popup from visible and hidden.
             *
             * @param {boolean} isVisible - If true it will show the popup, else it will hide it.
             */
            toggle(isVisible) {
                this.visible = isVisible;
            }
        }
    }
</script>

<style scoped>
    .overlay {
        background: rgba(0, 0, 0, 0.75);
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        transition: opacity .2s linear;
        width: 100%;
        z-index: 9999;
    }

    .popup {
        background: #F2F2F2;
        /*border-radius: 10px;*/
        bottom: 0;
        height: fit-content;
        left: 0;
        margin: auto;
        max-height: 500px;
        max-width: calc(100% - 100px);
        min-height: 200px;
        min-width: 300px;
        position: absolute;
        right: 0;
        top: 0;
        transition: transform .2s linear;
        width: fit-content;
        z-index: 10000;
    }

    .popup .header {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        height: 40px;
        line-height: 40px;
        text-align: center;
        position: relative;
    }

    .popup .body {
        overflow: overlay;
        max-height: 460px;
    }

    .visible .overlay {
        opacity: 1;
    }

    .visible .popup {
        transform: scale(1);
    }

    .hidden .overlay {
        opacity: 0;
        z-index: -10;
    }

    .hidden .popup {
        transform: scale(0);
    }
</style>
