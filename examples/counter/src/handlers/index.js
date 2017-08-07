export const reducers = {
  INCREMENT(state, action){
    return state + 1
  },
  DECREMENT(state, action){
    return state - 1
  },
};

export const procedures = {
  INCREMENT_ASYNC(state, action, dispatch){
    setTimeout(() => dispatch({ type: 'INCREMENT' }), 1000)
  },
  INCREMENT_IF_ODD(state, action, dispatch){
    if(state % 2 !== 0){
      dispatch({ type: 'INCREMENT' })
    }
  },
};

export default {
  ...reducers,
  ...procedures,
};
