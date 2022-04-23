import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { client } from '../../api/client'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const allNotifications = selectAllNotifications(getState()) //vai pegar o state de notificações[] e armazenar na const
    const [latestNotification] = allNotifications //desestrutura o primeiro valor do array de notificações e chama de latestnotification
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    //O ultimo timestamp vai ser: se tiver uma ultima notificação, a data dela. Se não tiver, vai ser vazia.
    const response = await client.get(
      `/fakeApi/notifications?since=${latestTimestamp}`
    )
    return response.data
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [],
  reducers: {
    allNotificationsRead(state, action) {
      state.forEach((notification) => {
        notification.read = true // quando for chamada essa ação, as notificações serão consideradas como lidas
      })
    },
  },
  extraReducers: {
    [fetchNotifications.fulfilled]: (state, action) => {
      state.push(...action.payload)
      state.forEach((notification) => {
        //As notificações lidas não vão ser consideradas como novas, cada vez que rolar o fetch
        notification.isNew = !notification.read
      })
      // Sort with newest first
      state.sort((a, b) => b.date.localeCompare(a.date))
    }, //Sort vai sortear de acordo com a função de comparação dentro do (), se o retorno for negativo
    //o elemento de referência é ordenado antes do de comparação, se o retorno for positivo, o elemento de
    //refência é ordenado depois do de comparação.
    //localecompare indica se uma string vem antes ou depois.
    //Se a string de referência(ex: b) vier antes da comparada(ex:a), retorna valor negativo
    //Retorna valor positivo quando o referenceStr ocorre após compareString
  },
})

export default notificationsSlice.reducer

export const selectAllNotifications = (state) => state.notifications

export const { allNotificationsRead } = notificationsSlice.actions
