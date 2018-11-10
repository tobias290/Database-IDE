<template>
    <div class="context-menu" ref="contextMenu">
        <div v-for="item in items">
            <div v-if="item.type !== 'separator'" class="item" v-bind:class="{disabled: item.disabled}" v-on:click="!item.disabled ? itemClick(item) : null">
                <div class="icon">
                    <i class="fas" v-bind:class="[item.icon || 'blank']"></i>
                </div>
                <div class="title">
                    {{ item.title }}
                </div>
                <!-- NOTE: Possibly add key bindings here -->
            </div>
            <div v-else class="separator"></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ContextMenu",
        props: {
            target: {
                type: String,
                required: true,
            },
            items: {
                type: Array,
                required: true,
            },
        },
        mounted() {
            document.addEventListener("click", (e) => this.toggle(false, e));
            document.addEventListener("contextmenu", this.closeIfOutsideTargetElement);
            document.getElementById(this.target).addEventListener("contextmenu", (e) => this.toggle(true, e))
        },
        methods: {
            /**
             * Toggles the context menu.
             *
             * @param {boolean} show - If true show the context menu, else hide it.
             * @param event - Click event instance.
             */
            toggle(show, event) {
                if (show) {
                    // TODO: Stop it from leaving the page
                    this.$refs.contextMenu.style.visibility = "visible";
                    this.$refs.contextMenu.style.left = event.pageX + "px";
                    this.$refs.contextMenu.style.top = event.pageY + "px";
                } else {
                    this.$refs.contextMenu.style.visibility = "hidden";
                }
            },

            /**
             * Closes the context menu the the click is outside the target element.
             *
             * @param e - Click event instance.
             */
            closeIfOutsideTargetElement(e) {
                let targetEl = document.getElementById(this.target).getBoundingClientRect();

                // If the click is outside the target element then close the context menu
                if (e.clientX < targetEl.left || e.clientX > targetEl.right || e.clientY < targetEl.top || e.clientY > targetEl.bottom)
                    this.toggle(false, e)
            },

            /**
             * Called when an item is clicked. If it has an action it will be called.
             *
             * @param item - Item clicked on.
             * @return {*} - Returns called event.
             */
            itemClick(item) {
                if (item.hasOwnProperty("click")) {
                    return item.click();
                }
            }
        },
    }
</script>

<style scoped>
    .context-menu {
        background: #F2F2F2;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
        cursor: default;
        font-size: 16px;
        height: fit-content;
        left: 0;
        line-height: 40px;
        position: fixed;
        text-align: left;
        top: 0;
        user-select: none;
        visibility: hidden;
        width: fit-content;
        z-index: 1000;
    }

    .context-menu .separator {
        background: #C1C1C1;
        height: 1px;
        width: 100%;
    }

    .context-menu .item {
        background: #F2F2F2;
        font-family: 'Raleway', sans-serif;
        height: 40px;
        white-space: nowrap;
        width: 100%;
        min-width: 150px;
    }

    .context-menu .item.disabled {
        color: #C3C3C3;
    }

    .context-menu .item.disabled:hover {
        background: #F2F2F2;
    }

    .context-menu .item.disabled .icon {
        color: #C3C3C3;
    }

    .context-menu .item:hover {
        background: white;
    }

    .context-menu .item .icon {
        color: #444;
        display: inline-block;
        height: 40px;
        line-height: 40px;
        text-align: center;
        width: 40px;
    }

    .context-menu .item:not([class~="disabled"]) .icon .active {
        color: #5CB85C;
    }

    .context-menu .item .blank {
        color: transparent;
    }

    .context-menu .item .title {
        display: inline-block;
        height: 40px;
        min-width: 100px;
        padding-right: 20px;
        width: fit-content;
    }
</style>
