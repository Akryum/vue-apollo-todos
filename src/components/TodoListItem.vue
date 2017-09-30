<template>
	<md-list-item class="todo-list-item">
		<div class="content">
			<template v-if="!editMode">
				<md-checkbox
					class="checkbox"
					v-model="done"
				>
					{{task.label}}
				</md-checkbox>
				<md-button
					class="md-icon-button"
					@click="openEdit"
				>
					<md-icon>edit</md-icon>
				</md-button>
				<md-button
					class="md-icon-button"
					@click="deleteTask"
				>
					<md-icon>delete</md-icon>
				</md-button>
			</template>

			<!-- Edition -->
			<template v-else>
				<md-input-container>
					<md-input
						ref="input"
						v-model="newLabel"
						placeholder="New label"
						@keyup.enter.native="saveLabel"
						@keyup.esc.native="editMode = false"
					/>
				</md-input-container>
				<md-button
					class="md-icon-button"
					@click="saveLabel"
				>
					<md-icon>done</md-icon>
				</md-button>
				<md-button
					class="md-icon-button"
					@click="editMode = false"
				>
					<md-icon>close</md-icon>
				</md-button>
			</template>
		</div>
	</md-list-item>
</template>

<script>
import TASKS_UPDATE from '../graphql/TasksUpdate.gql'
import TASKS_ALL from '../graphql/TasksAll.gql'
import TASKS_DELETE from '../graphql/TasksDelete.gql'

export default {
	name: 'todo-list-item',

	props: {
		task: {
			type: Object,
			required: true,
		},
	},

	data () {
		return {
			editMode: false,
			newLabel: '',
		}
	},

	computed: {
		done: {
			get () {
				return this.task.done
			},
			set (value) {
				this.$apollo.mutate({
					mutation: TASKS_UPDATE,
					variables: {
						...this.task,
						done: value,
					},
					update: (store, { data: { updateTask }}) => {
						// Done tasks
						const doneQuery = {
							query: TASKS_ALL,
							variables: { filter: { done: true } },
						}
						const doneData = store.readQuery(doneQuery)
						
						// Todo tasks
						const todoQuery = {
							query: TASKS_ALL,
							variables: { filter: { done: false } },
						}
						const todoData = store.readQuery(todoQuery)
						
						let addList
						let removeList

						// We swap the item on the filtered lists
						if (value) {
							addList = doneData.allTasks
							removeList = todoData.allTasks
						} else {
							addList = todoData.allTasks
							removeList = doneData.allTasks
						}

						// Operations on the 2 lists
						addList.push(updateTask)
						const index = removeList.findIndex(o => o.id === updateTask.id)
						if (index !== -1) {
							removeList.splice(index, 1)
						}

						// Update the queries
						store.writeQuery({ ...doneQuery, data: doneData })
						store.writeQuery({ ...todoQuery, data: todoData })
					},
					optimisticResponse: {
						__typename: 'Mutation',
						updateTask: {
							__typename: 'Task',
							...this.task,
							done: value,
						},
					},
				})
			},
		},
	},

	methods: {
		deleteTask () {
			this.$apollo.mutate({
				mutation: TASKS_DELETE,
				variables: {
					id: this.task.id,
				},
				update: (store) => {
					const queries = [
						{ query: TASKS_ALL },
						{ query: TASKS_ALL, variables: { filter: { done: this.task.done } } },
					]
					const data = queries.map(query => store.readQuery(query))
					data.forEach(({ allTasks: list }) => {
						const index = list.findIndex(o => o.id === this.task.id)
						if (index !== -1) {
							list.splice(index, 1)
						}
					})
					queries.forEach((query, index) => {
						store.writeQuery({
							...query,
							data: data[index],
						})
					})
				},
			})
		},

		openEdit () {
			this.newLabel = this.task.label
			this.editMode = true
			this.$nextTick(() => {
				const input = this.$refs.input.$el
				input.focus()
				input.setSelectionRange(0, input.value.length)
			})
		},

		saveLabel () {
			this.$apollo.mutate({
				mutation: TASKS_UPDATE,
				variables: {
					...this.task,
					label: this.newLabel,
				},
				optimisticResponse: {
					__typename: 'Mutation',
					updateTask: {
						__typename: 'Task',
						...this.task,
						label: this.newLabel,
					},
				},
			})
			this.editMode = false
		},
	},
}
</script>

<style lang="stylus" scoped>
.content {
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.checkbox {
	flex: auto 1 1;

	>>> .md-checkbox-label {
		flex: 100% 1 1;
	}
}
</style>

