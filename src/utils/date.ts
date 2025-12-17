// src/utils/date.ts
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatTime = (time: string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(time).format(format)
}

export const formatRelativeTime = (time: string | Date) => {
  return dayjs(time).fromNow()
}

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format)
}

export const isToday = (date: string | Date) => {
  return dayjs(date).isSame(dayjs(), 'day')
}

export const isYesterday = (date: string | Date) => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}