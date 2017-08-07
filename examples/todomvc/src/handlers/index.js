import { combineHandlers } from 'rstate'
import todos from './todos'

const handlers = combineHandlers({
  todos
})

export default handlers
