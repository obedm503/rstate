import { combineHandlers } from 'rstate'
import todos from './todos'
import visibilityFilter from './visibilityFilter'

const todoApp = combineHandlers({
  todos,
  visibilityFilter,
})

export default todoApp
