const jwt = require('jsonwebtoken')
const User = require('../usuario/model')
const Role = require('../roles/model')
const config = require('../../config')

async function sing_up(req) {
  const { nombre, apellido, username, password, rol } = req.body
  const new_user = new User({
    username,
    password: User.encrypted_password(password)
  })
  if (rol) {
    const found_rol = await Role.find({ name: { $in: rol } })
    new_user.rol = found_rol.map(roles => roles._id)
  } else {
    const role = await Role.find({ name: 'usuario' })
    new_user.rol = [role._id]
  }

  const saved_user = await new_user.save()
  const token = jwt.sing(
    {
      id: saved_user._id
    },
    config.SECRET,
    {
      expiresIn: 86400
    }
  )

  return token

}

async function sing_in(req) {
  try {
    const user_found = await User.findOne({ apellido: req.body.apellido })
    if (!user_found) {
      throw new Error('User not found')
    }
    console.log(user_found)
    console.log(req.body.password)
    const verify_password = await User.compare_password(req.body.password, user_found.password)
    console.log(verify_password)
    if (!verify_password) {
      throw new Error('Password incorrecto')
    }

    const token = jwt.sign({ id: user_found._id }, config.SECRET, { expiresIn: 86400 })

    return { token: token }
  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = {
  sing_up,
  sing_in
}