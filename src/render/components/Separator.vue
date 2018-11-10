<template>
    <div
        id="grabber"
        v-bind:class="{'horizontal': direction === 'horizontal', 'vertical': direction === 'vertical'}"
        v-on:mouseover="onMouseOver"
        v-on:mousedown="onMouseDown(true)"
    ></div>
</template>

<script>
    export default {
        name: "Separator",
        props: {
            direction: {
                type: String,
                required: true,
                validator: (value) => {
                    // The value must match one of these strings
                    return ["horizontal", "vertical"].indexOf(value) !== -1
                }
            },
            panels: {
                type: Array,
                required: true,
            },
            panelMinSize: {
                type: Number,
                required: false,
                default: 100,
            }
        },
        data() {
            return {
                mouseDown: false,
            }
        },
        methods: {
            onMouseOver(event) {
                event.target.style.cursor = this.direction === "horizontal" ? "e-resize" : "n-resize";
            },

            onMouseDown(isDown) {
                this.mouseDown = isDown;

                // Listen for mouse up anywhere in the document
                document.addEventListener("mouseup", () => this.onMouseDown(false));
                document.addEventListener("mousemove", this.onDrag);

            },

            onDrag(event) {
                if (!this.mouseDown) return;

                if (this.direction === "vertical") {
                    let topPanelNewHeight = event.clientY;
                    let bottomPanelNewHeight = window.innerHeight - event.clientY;

                    if (topPanelNewHeight < this.panelMinSize || bottomPanelNewHeight < this.panelMinSize) return;

                    document.getElementById(this.panels[0]).style.height = topPanelNewHeight + "px";
                    document.getElementById(this.panels[1]).style.height = bottomPanelNewHeight + "px";
                } else {
                    let topPanelNewWidth = event.clientX;
                    let bottomPanelNewWidth = window.innerWidth - event.clientX;

                    if (topPanelNewWidth < this.panelMinSize || bottomPanelNewWidth < this.panelMinSize) return;

                    document.getElementById(this.panels[0]).style.width = topPanelNewWidth + "px";
                    document.getElementById(this.panels[1]).style.width = bottomPanelNewWidth + "px";
                }
            }
        }
    }
</script>

<style scoped>
    #grabber {
        background: #B2B2B2;
    }

    .horizontal {
        height: 100%;
        width: 5px;
    }

    /*.horizontal:hover {*/
        /*width: 5px;*/
    /*}*/

    .vertical {
        height: 5px;
        width: 100%;
    }

    /*.vertical:hover {*/
        /*height: 5px;*/
    /*}*/
</style>
