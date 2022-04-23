import React, { useLayoutEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { formatDistanceToNow, parseISO } from 'date-fns'
import classnames from 'classnames'

import { selectAllUsers } from '../users/usersSlice'
import {
  selectAllNotifications,
  allNotificationsRead,
} from './notificationsSlice'

export const NotificationsList = () => {
  const dispatch = useDispatch()
  const notifications = useSelector(selectAllNotifications)
  const users = useSelector(selectAllUsers)

  useLayoutEffect(() => {
    dispatch(allNotificationsRead())
  }) //sempre que a tela for renderizada, dá dispatch na action, lendo todas as notificações

  const renderedNotifications = notifications.map((notification) => {
    const date = parseISO(notification.date) //retorna um Date com timezone local
    const timeAgo = formatDistanceToNow(date) //retorna a distancia(diferença) entre a data informada e o horário atual em palavras
    const user = users.find((user) => user.id === notification.user) || {
      name: 'Unknown User',
    } //user é o usuário que corresponde à notificação ou retorna um objeto com name "unknown"

    const notificationClassname = classnames('notification', {
      new: notification.isNew,
    }) // junta as classes e retorna "notification new"
    //desde que notification.isNew seja true

    return (
      <div key={notification.id} className={notificationClassname}>
        <div>
          <b>{user.name}</b> {notification.message}
        </div>
        <div title={notification.date}>
          <i>{timeAgo} ago</i>
        </div>
      </div>
    )
  })

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      {renderedNotifications}
    </section>
  )
}
