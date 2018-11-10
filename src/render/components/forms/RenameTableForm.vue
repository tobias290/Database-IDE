<template>
    <Form v-on:submit="submit">
        <div id="rename">
            <div class="form-icon">
                <i class="fas fa-table"></i>
            </div>
            <input v-model="tableName" type="text" placeholder="Table Name" title="Rename Table">
        </div>
        <div class="action-buttons" id="buttons">
            <input type="button" class="cancel" value="Cancel" v-on:click="$emit('cancel')" />
            <input type="submit" class="submit" value="Rename" v-bind:disabled="originalTableName === tableName || !/\S/.test(tableName)" />
        </div>
    </Form>
</template>

<script>
    import Form from "../containers/Form";
    import DB from "../../js/DB";

    export default {
        name: "RenameTableForm",
        components: {Form},
        props: {
            originalTableName: {
                type: String,
                required: true,
            },
        },
        data() {
            return {
                tableName: null,
            }
        },
        methods: {
            /**
             * Called when the submit button is pressed and renames the currentTable.
             */
            submit() {
                DB.query(DB.generateRenameTableSql(this.originalTableName, this.tableName), (err, results) => {
                    if (err) return console.log(results);

                    this.$emit("submitted", this.originalTableName);
                });
            }
        },
        watch: {
            /**
             * Watches for the old currentTable name prop to change and updates the v-model value.
             */
            originalTableName() {
                this.tableName = this.originalTableName.slice();
            }
        }
    }
</script>

<style scoped>
    #rename {
        margin: 30px auto;
        width: fit-content;
    }

    #rename > * {
        float: left;
    }

    #rename > input {
        padding-left: 10px;
        width: 200px;
    }

    #buttons > input {
       width: calc((300px - 15px) / 2);
    }
</style>
