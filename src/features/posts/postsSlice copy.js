import {
  createSlice,
  nanoid,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit'
import { client } from '../../api/client'

const initialState = {
  posts: [],
  status: 'idle',
  error: null,
} //O state inicial

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get('/fakeApi/posts')
  return response.data
}) //async thunk pegando o posts através da api e retornando a data

export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  // The payload creator receives the partial `{title, content, user}` object
  async (initialPost) => {
    // We send the initial data to the fake API server
    const response = await client.post('/fakeApi/posts', initialPost)
    // The response includes the complete post object, including unique ID
    return response.data
  }
) //async thunk postando um post novo enviando os dados recebidos como parâmetro

const postsSlice = createSlice({
  name: 'posts', //nome vira action.type
  initialState, //state inicial
  reducers: {
    //aqui vão as actions dos reducers
    postAdded: {
      reducer(state, action) {
        state.posts.push(action.payload) //está acrescentando ao array de posts, o payload de parâmetro
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            date: new Date().toISOString(),
            title,
            content,
            user: userId,
            reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 },
          },
        }
      }, //está retornando um objeto payload
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload //está desestruturando do payload
      const existingPost = state.posts.find((post) => post.id === id) // busca o post requerido pelo parâmetro id recebido
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      } //caso exista o determinado post, substitui o seu title e content, pelo fornecido nos parâmetros
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.posts.find((post) => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      } //mesma lógica, porém está acrescentando a quantidade de determinada reaction no array
    },
  },
  extraReducers(builder) {
    //administrando async thunk
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched posts to the array
        state.posts = state.posts.concat(action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        // We can directly add the new post object to our posts array
        state.posts.push(action.payload)
      })
  },
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions //exportando as actions

export default postsSlice.reducer //exportando o reducer

export const selectAllPosts = (state) => state.posts.posts //criando e exportando um select para utilizar UseSelector
//state.<store name>.<valor do state>

export const selectPostById = (state, postId) =>
  state.posts.posts.find((post) => post.id === postId)
//está selecionando o post cujo id é igual ao parâmetro recebido

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter((post) => post.user === userId)
) //primeiro parâmetro pode ser mais de um input selector dentro de um array,
//que vão virar argumentos para o segundo parâmetro
//segundo parâmetro é output selector

//1º parametro: o primeiro selector pega o array de posts, o segundo selector só retorna um userID
//2º parametro: recebe os parâmetros e retorna um post filtrado correspondente ao id do usuário
