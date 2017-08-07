const todos = {
  ADD_TODO(state, action){
    return [
      {
        id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
        completed: false,
        text: action.text
      },
      ...state
    ]
  },
  DELETE_TODO(state, action){
    return state.filter(todo =>
      todo.id !== action.id
    )
  },
  EDIT_TODO(state, action){
    return state.map(todo =>
      todo.id === action.id ?
        { ...todo, text: action.text } :
        todo
    )
  },
  COMPLETE_TODO(state, action){
    return state.map(todo =>
      todo.id === action.id ?
        { ...todo, completed: !todo.completed } :
        todo
    )
  },
  COMPLETE_ALL(state, action){
    const areAllMarked = state.every(todo => todo.completed)
    return state.map(todo => ({
      ...todo,
      completed: !areAllMarked
    }))
  },
  CLEAR_COMPLETED(state, action){
    return state.filter(todo => todo.completed === false)
  }
}

export default todos
