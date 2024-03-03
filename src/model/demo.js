import USersModel from './test'

// 增
// 定义数据
const userData = {
  name: 'hmxs',
  age: 22,
  email: '123456@163.com'
}
// 插入并保存数据
const saveMethod = async () => {
  const data = new USersModel(userData)
  const res = await data.save()
  console.log(res)
}

// 查
const findMethod = async () => {
  const res = await USersModel.find()
  console.log(res)
}

// 改
const updateMethod = async () => {
  const res = await USersModel.updateOne({
    name: 'hmxs'
  }, {
    email: '3129166417@qq.com'
  })
  console.log(res)
}

// 删
const deleteMethod = async () => {
  const res = await USersModel.deleteOne({
    name: 'hmxs'
  })
  console.log(res)
}
deleteMethod()