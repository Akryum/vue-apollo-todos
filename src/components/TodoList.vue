<template>
	<md-list class="todo-list">
		<TodoListItem
			v-for="task of tasks"
			:key="task.id"
			:task="task"
		/>
	</md-list>
</template>

<script>
import TodoListItem from './TodoListItem.vue'
import TASKS_ALL from '../graphql/TasksAll.gql'

export default {
	name: 'todo-list',

	components: {
		TodoListItem,
	},

	props: {
		filter: {
			type: Object,
			default: undefined,
		},
	},

	data () {
		return {
			tasks: [],
		}
	},
	
	apollo: {
		tasks: {
			query: TASKS_ALL,
			variables () {
				return {
					filter: this.filter,
				}
			},
			update ({ allTasks }) {
				// The field is different from 'tasks'
				return allTasks
			},
		},
	},
}
</script>
