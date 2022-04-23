import React, { useEffect } from 'react'
import { Spinner } from '../../components/Spinner'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { PostAuthor } from './PostAuthor'
import { TimeAgo } from './TimeAgo'
import { ReactionButtons } from './ReactionButtons'
import {
  selectAllPosts,
  fetchPosts,
  selectPostIds,
  selectPostById,
} from './postsSlice'

let PostExcerpt = ({ postId }) => {
  const post = useSelector((state) => selectPostById(state, postId))
  return (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>

      <ReactionButtons post={post} />
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  )
}

export const PostsList = () => {
  const dispatch = useDispatch()
  const orderedPostIds = useSelector(selectPostIds)
  const posts = useSelector(selectAllPosts)
  const postStatus = useSelector((state) => state.posts.status) //definiu selector para o state.status
  const error = useSelector((state) => state.posts.error) // definiu selector para state.error

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch]) //utiliza um useEffect para quando a página for renderizada, utilizar dispatch no async thunk
  //a função vai ser chamada novamente sempre que o status mudar
  let content //define content

  if (postStatus === 'loading') {
    content = <Spinner text="Loading..." /> //caso o status seja loading content será um componente spinner
  } else if (postStatus === 'succeeded') {
    content = orderedPostIds.map((postId) => (
      <PostExcerpt key={postId} postId={postId} />
    ))
  } else if (postStatus === 'failed') {
    content = <div>{error}</div> //caso o status seja failed, content será uma div com error
  }

  return (
    //retorna uma section, rederizando o content
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
