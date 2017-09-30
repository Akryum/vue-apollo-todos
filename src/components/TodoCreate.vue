<template>
	<md-card class="todo-list-create">
		<md-card-header>
			<div class="md-title">Create a new task</div>
		</md-card-header>

		<md-card-content>
			<md-input-container>
				<label>Label</label>
				<md-input
					v-model="label"
					@keyup.enter.native="createTask"
				/>
			</md-input-container>
		</md-card-content>

		<md-card-actions>
			<md-button
				class="create-button md-primary"
				type="button"
				@click="createTask"
			>
				Create
			</md-button>
		</md-card-actions>
	</md-card>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import TASKS_ALL 		from '../graphql/TasksAll.gql'
import TASKS_CREATE from '../graphql/TasksCreate.gql'

export default {
	data () {
		return {
			busy: false,
			label: '',
		}
	},

	validations: {
		label: {
			required,
		},
	},

	methods: {
		createTask () {
			if (!this.$v.$invalid) {
				const label = this.label
				this.label = ''
				try {
					this.$apollo.mutate({
						mutation: TASKS_CREATE,
						variables: {
							label,
						},
						update: (store, { data: { createTask } }) => {
							// Add to All tasks list
							const data = store.readQuery({ query: TASKS_ALL })
							data.allTasks.push(createTask)
							store.writeQuery({ query: TASKS_ALL, data })

							// Add to Todo tasks list
							const todoQuery = {
								query: TASKS_ALL,
								variables: { filter: { done: false } },
							}
							const todoData = store.readQuery(todoQuery)
							todoData.allTasks.push(createTask)
							store.writeQuery({ ...todoQuery, data: todoData })
						},
						optimisticResponse: {
							__typename: 'Mutation',
							createTask: {
								__typename: 'Task',
								id: null,
								done: false,
								label,
							},
						},
					})
				} catch (e) {
					console.error(e)
					this.label = label
				}
			}
		},
	},	
}
</script>

<style lang="stylus" scoped>
.form {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.create-button {
	position: relative;

	.spinner {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style>

