<script>
import TodoPage from './TodoPage.vue'

export default {
  name: 'app',

  render (h) {
    return <div id="app">
      <TodoPage />
    </div>
  },
}
</script>

<style lang="stylus">
html,
body,
#app {
	height: 100%;
}

body {
	margin: 0;
	font-family: 'Roboto', Helvetica, Arial, sans-serif;
}

.md-card {
	margin: 12px;
}
</style>
