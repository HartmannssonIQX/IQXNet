var jwt=require('jwt-simple')
var config=require('../config')

module.exports=function (req,res,next) {
  if (req.headers['x-auth']) {
    req.headers.iqxauth=jwt.decode(req.headers['x-auth'],config.secret)
    req.headers.iqxauthuser=req.headers.iqxauth.username
    }
  next()
  }
  