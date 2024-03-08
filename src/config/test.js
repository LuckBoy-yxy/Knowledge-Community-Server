import { setValue, getValue, getHValue, delValue } from './RedisConfig'

setValue('test', 'test message from redis client')

getValue('test').then(res => {
  console.log('getValue: ' + res)
})

delValue('test')

const obj = {
  name: 'hmxs_hmbb',
  age: 22
}
setValue('testObj', obj)

getHValue('testObj').then(res => {
  console.log('testObj: ' + JSON.stringify(res))
})