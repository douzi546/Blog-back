const express = require("express")
const router = express.Router()
const service = require("../serviecs/service")
const query = require("../DAO/db2")
const md5 = require("md5");
const jwt = require("jsonwebtoken")
const moment = require("moment")
//查询所有文章
router.post("/article", service.allArticle)
//查询文章总数
router.get("/articleTotal", service.getArticleTotal)
//获取单张文章详情（通过ID）
router.get("/articleOne/:id", service.getOneArticleById)
//获取单张文章标签（通过ID）
router.get("/articleLabelOne/:id", service.getOneArticleLabelById)
//获取单张文章评论（通过ID）
router.get("/articleComments/:id", service.getCommentsByArticleId)
//分类
router.get("/sort", service.allSort)
//分类获取文章
router.get("/articleBySort/:name", service.articleBySortName)
//标签
router.get("/tag", service.allTag)
//标签获取文章
router.get("/articleByTag/:name", service.articleByTagName)
//归档
router.get("/articleFiling", service.articleFiling)
//添加文章
router.post('/addArticle', service.addArticle);
//文章列表页（文章管理）
router.get("/articleManage", service.articleManage)
//文章修改
router.post("/articleUpdate", service.articleUpdate)
//文章删除
router.post("/articleDelete", async (req, res) => {
  let id = req.body.params.id
  // let label = req.body.params.label
  const deleteLabel = await query(`DELETE FROM zj_article_label WHERE ch_article_id = ?`, [id])
  const deleteComment = await query(`DELETE FROM zj_comments WHERE article_id = ?`, [id])
  const deleteArticle = await query(`DELETE FROM zj_articles WHERE article_id = ?`, [id])
  if (deleteLabel && deleteComment && deleteArticle) {
    res.json(
      {
        "meta": {
          "msg": '删除文章成功',
          "status": 200
        }
      }
    )
  }




})
// exports.articleDelete = (req, res, next) => {
//   console.log(req.body.params)
//   let id = req.body.params.id
//   let label = req.body.params.label
//   const sql = `DELETE FROM zj_article_label WHERE ch_article_id = ?`
//   const data = [id]
//   db.base(sql, data, (result) => {
//     const sql = `DELETE FROM zj_articles WHERE article_id = ?`
//     db.base(sql, data, (result) => {
//       const sql = `DELETE FROM zj_comments WHERE article_id = 103`
//       if (result.affectedRows === 1) {
//         res.json(
//           {
//             "meta": {
//               "msg": '删除文章成功',
//               "status": 200
//             }
//           }
//         )
//       }
//     })
//   })


// }









//注册
router.post("/signup", async (req, res) => {
  let requestAccount = req.body
  if (!requestAccount.username || requestAccount.username.length < 2) {
    res.json({ "msg": 'length of username need >= 2' })
    return
  }
  if (!requestAccount.password || requestAccount.password.length < 6) {
    res.json({ "msg": 'length of password need >= 6' })
    return
  }
  const data = [requestAccount.username]

  const isDuplicatedUsername = await query(`SELECT zj_users.user_name FROM zj_users WHERE zj_users.user_name = ?`, data)
  if (isDuplicatedUsername.length > 0) {
    res.json({ "msg": 'duplicated username', "status": 201 })
    return
  }

  requestAccount.password = md5(requestAccount.password + "douzi")
  const result = await query(`INSERT INTO zj_users (user_name,user_password) VALUES (?,?)`, [requestAccount.username, requestAccount.password])
  if (result) {
    res.json({ "msg": '账号注册成功', "status": 200 })
  }



})
//登录
router.post("/login", async (req, res) => {
  let requestAccount = req.body
  if (!requestAccount.username || requestAccount.username.length < 2) {
    res.status(400).json({ "msg": 'length of username need >= 2' })
    return
  }
  if (!requestAccount.password || requestAccount.password.length < 6) {
    res.status(400).json({ "msg": 'length of password need >= 6' })
    return
  }
  requestAccount.password = md5(requestAccount.password + "douzi")

  const isAccountCorrent = await query(`SELECT zj_users.user_id,zj_users.user_name,zj_users.user_profile_photo FROM
  zj_users WHERE zj_users.user_name = ? AND zj_users.user_password = ?`, [requestAccount.username, requestAccount.password])
  if (isAccountCorrent.length > 0) {
    var jwtTokenSecret = 'fjJWT'
    var token = jwt.sign({
      id: isAccountCorrent[0].user_id, username: isAccountCorrent[0].user_username,
    }, jwtTokenSecret, { expiresIn: 3600 })
    res.json(
      {
        "meta": {
          "msg": '登录成功',
          "status": 200
        },
        token,
        data: isAccountCorrent[0]
      }
    )
  } else {
    res.json(
      {
        "meta": {
          "msg": '登录失败，请检查账号密码是否正确',
          "status": 201
        }
      }
    )

  }





})
//验证Token
router.post("/token", async (req, res) => {
  let token = req.body.token
  var jwtTokenSecret = 'fjJWT'
  jwt.verify(token, jwtTokenSecret, function (err, decode) {
    if (err) {  //  时间失效的时候/ 伪造的token          
      res.send({ 'status': 0 });
    } else {
      res.send({ 'status': 1 });
    }
  })
})

router.post("/submitCom", async (req, res) => {
  let comment = req.body
  const isComment = await query(`INSERT INTO zj_comments (user_id,article_id,comment_date,comment_content) VALUES (?,?,?,?)`, [comment.login_id, comment.art_id, moment(comment.date).format('YYYY-MM-DD HH:mm:ss'), comment.content])
  if (isComment.affectedRows === 1) {
    res.send({ 'status': 200 });
  }

})


module.exports = router
