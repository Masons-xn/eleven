import moment from 'moment'

const dateFormat = (date: any = new Date()) => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss')
}
export default dateFormat