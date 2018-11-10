<template>
    <form v-on:submit.prevent="$emit('submit')" v-bind:action="action" v-bind:method="method">
        <slot></slot>
    </form>
</template>

<script>
    export default {
        name: "Form",
        props: {
            method: {
                type: String,
                required: false,
            },
            action: {
                type: String,
                required: false,
            }
        }
    }
</script>

<style scoped>
    form {
        padding: 10px;
    }

    form input:not([type="checkbox"]):not([type="radio"]), button {
        box-sizing: border-box;
        border: 1px solid #B2B2B2;
        font-size: 15px;
        height: 40px;
        width: 150px;
    }

    form input[type="button"]:hover, .input[type="submit"]:hover, button:hover {
        background: #C1C1C1;
        border: none;
    }

    form input[type="button"]:active, .input[type="submit"]:active, button:active {
        background: #B1B1B1;
    }

    form input[type="button"]:disabled, input[type="submit"]:disabled, button:disabled {
        background: #C9C9C9;
    }

    form input[type="button"].cancel:enabled:hover, input[type="submit"].cancel:enabled:hover, button.cancel:enabled:hover {
        background: #FE8583;
        border: none;
    }

    form input[type="button"].cancel:enabled:active, input[type="submit"].cancel:enabled:active, button.cancel:enabled:active {
        background: #E47775;
    }

    form input[type="button"].submit:enabled:hover, input[type="submit"].submit:enabled:hover, button.submit:enabled:hover {
        background: #A4E1A4;
        border: none;
    }

    form input[type="button"].submit:enabled:active, input[type="submit"].submit:enabled:active, button.submit:enabled:active {
        background: #93CA93;
    }

    form .form-icon {
        background: white;
        border: 1px solid #B2B2B2;
        border-right: none;
        box-sizing: border-box;
        color: #555;
        display: inline-block;
        height: 40px;
        font-size: 20px;
        line-height: 40px;
        text-align: center;
        width: 40px;
    }

    form .checkbox-container {
        display: block;
        height: 25px;
        line-height: 25px;
        padding-left: 35px;
        position: relative;
        margin: 0 5px 0 5px;
        user-select: none;
    }

    form .checkbox-container input {
        opacity: 0;
        position: absolute;
    }

    form .checkbox-container .checkmark {
        background-color: #D9D9D9;
        /*cursor: pointer;*/
        height: 25px;
        left: 0;
        position: absolute;
        top: 0;
        width: 25px;
    }

    form .checkbox-container input ~ .checkmark:hover {
        background-color: #C1C1C1;
    }

    form .checkbox-container input ~ .checkmark:active {
        background-color: #B1B1B1;
    }

    form .checkbox-container input:checked ~ .checkmark {
        background-color: #555;
    }

    form .checkbox-container input:checked ~ .checkmark:hover {
        background-color: #444;
    }

    form .checkbox-container input:checked ~ .checkmark:active {
        background-color: #333;
    }

    form .checkbox-container .checkmark:after {
        display: none;
        content: "";
        position: absolute;
    }

    .checkbox-container input:checked ~ .checkmark:after {
        display: block;
    }

    .checkbox-container .checkmark:after {
        border: solid white;
        border-width: 0 3px 3px 0;
        height: 10px;
        left: 8px;
        top: 5px;
        transform: rotate(45deg);
        width: 5px;
    }

    form .action-buttons {
        bottom: 5px;
        left: 0;
        margin: auto;
        position: absolute;
        right: 0;
        width: fit-content;
    }
</style>
