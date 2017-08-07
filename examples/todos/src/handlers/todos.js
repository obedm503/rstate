const todos = {
  ADD_TODO(state, action){
    return [
      ...state,
      {
        id: action.id,
        text: action.text,
        completed: false
      }
    ]
  },
  TOGGLE_TODO(state, action){
    return state.map(todo =>
      (todo.id === action.id)
        ? {...todo, completed: !todo.completed}
        : todo
    )
  }
}

export default todos
