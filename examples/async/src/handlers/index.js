// import { combineReducers } from 'redux'
import { combineHandlers } from 'rstate'

import {
  SELECT_REDDIT, INVALIDATE_REDDIT,
  REQUEST_POSTS, RECEIVE_POSTS,
  requestPosts, receivePosts,
  fetchPosts,
} from '../actions'


const posts = (state = {
  isFetching: false,
  didInvalidate: false,
  items: []
}, action) => {
  switch (action.type) {
    case INVALIDATE_REDDIT:
      return {
        ...state,
        didInvalidate: true
      }
    case REQUEST_POSTS:
      return {
        ...state,
        isFetching: true,
        didInvalidate: false
      }
    case RECEIVE_POSTS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt
      }
    default:
      return state
  }
}

const genericRedditHandler = (state, action) => ({
  ...state,
  [action.reddit]: posts(state[action.reddit], action)
})

const selectedReddit = {
  [SELECT_REDDIT]: (state, action) => action.reddit,
}

const postsByReddit = {
  [INVALIDATE_REDDIT]: genericRedditHandler,
  [RECEIVE_POSTS]: genericRedditHandler,
  [REQUEST_POSTS]: genericRedditHandler,
}

const reducers = {
  postsByReddit,
  selectedReddit
}

const procedures = {
  FETCH_POSTS(state, action, dispatch){
    dispatch(requestPosts(action.reddit))
    fetch(`https://www.reddit.com/r/${action.reddit}.json`)
      .then(response => response.json())
      .then(json => dispatch(receivePosts(action.reddit, json)))
  },
  FETCH_POSTS_IF_NEEDED(state, action, dispatch){
    if (shouldFetchPosts(state, action.reddit)) {
      dispatch(fetchPosts(action.reddit))
    }
  }
}

const shouldFetchPosts = (state, reddit) => {
  const posts = state.postsByReddit[reddit]
  if (!posts) {
    return true
  }
  if (posts.isFetching) {
    return false
  }
  return posts.didInvalidate
}

const rootHandler = combineHandlers({
  ...reducers,
  ...procedures,
})
export default rootHandler
