const db = require("../DAO/db")
const db2 = require("../DAO/db2")
var async = require("async")
var moment = require("moment")
//查询每页文章
exports.allArticle = (req, res, next) => {
  const page = req.body.page
  const pageSize = req.body.pageSize
  if (!page || page <= 0) return res.json({ "meta": { "msg": 'page参数错误', "status": 201 } })
  if (!pageSize || pageSize <= 0) return res.json({ "meta": { "msg": 'pageSize参数错误', "status": 201 } })

  const start = (page - 1) * pageSize
  const sql = `SELECT
  zj_articles.*,
  zj_sorts.sort_name,
  zj_users.user_name
  FROM
  zj_articles
  INNER JOIN zj_sorts ON zj_articles.sort_id = zj_sorts.sorts_id
  INNER JOIN zj_users ON zj_articles.user_id = zj_users.user_id
  order by article_id desc
  limit ?,?`
  const data = [start, pageSize]
  db.base(sql, data, (result) => {
    console.log(result)
    res.json(
      {
        "data": result,
        "meta": {
          "msg": '获取文章列表成功',
          "status": 200
        }
      }
    )
  })
}
//查询文章总数
exports.getArticleTotal = (req, res, next) => {
  const sql = `select count(*) as total from zj_articles `
  db.base(sql, null, (result) => {
    res.json(
      {
        "data": result[0],
        "meta": {
          "msg": '获取文章总数成功',
          "status": 200
        }
      }
    )
  })
}
//获取单张文章详情（通过ID）
exports.getOneArticleById = (req, res, next) => {
  let id = req.params.id
  // const sql = `select * from zj_articles where article_id = ?`

  const sql = `SELECT zj_articles.*,zj_sorts.sort_name FROM zj_articles
    JOIN zj_sorts on zj_articles.sort_id = zj_sorts.sorts_id
    WHERE article_id = ?`


  const data = [id]

  db.base(sql, data, (result) => {
    res.json(
      {
        "data": result,
        "meta": {
          "msg": '获取文章成功',
          "status": 200
        }
      }
    )
  })

}
//获取单张文章标签（通过ID）
exports.getOneArticleLabelById = (req, res, next) => {
  let id = req.params.id
  const sql = `SELECT
              zj_labels.label_name
              FROM
              zj_article_label
              INNER JOIN zj_articles ON zj_article_label.ch_article_id = zj_articles.article_id
              INNER JOIN zj_labels ON zj_article_label.ch_label_id = zj_labels.label_id
              WHERE
              zj_articles.article_id = ?`
  const data = [id]
  db.base(sql, data, (result) => {
    let labelList = []
    result.forEach((item) => {
      labelList.push(item.label_name)
    })
    res.json(
      {
        "data": labelList,
        "meta": {
          "msg": '获取该文章标签成功',
          "status": 200
        }
      }
    )
  })

}
//获取单张文章评论（通过ID）
exports.getCommentsByArticleId = (req, res, next) => {
  let id = req.params.id
  const sql = `SELECT zj_comments.*,zj_users.user_name,zj_users.user_profile_photo FROM zj_comments JOIN zj_users on zj_comments.user_id = zj_users.user_id WHERE zj_comments.article_id = ? order by comment_date desc`
  const data = [id]
  db.base(sql, data, (result) => {
    res.json(
      {
        "data": result,
        "meta": {
          "msg": '获取评论成功',
          "status": 200
        }
      }
    )
  })
}
//分类
exports.allSort = (req, res, next) => {
  const sql = `SELECT
  zj_sorts.sort_name,
  zj_sorts.sorts_id
  FROM
  zj_sorts`
  db.base(sql, null, (sortList) => {
    async.map(sortList, (item, callback) => {
      const sql = `SELECT
      count(article_title) as total
      FROM
      zj_articles
      WHERE
      zj_articles.sort_id = ?`
      const data = [item.sorts_id]
      db.base(sql, data, (result) => {
        item.articleNum = result[0].total
        callback(null, item)
      })
    }, (err, artNum) => {
      res.json(
        {
          "data": artNum,
          "meta": {
            "msg": '获取分类成功',
            "status": 200
          }
        }
      )
    })
  })
}
//分类获取文章
exports.articleBySortName = (req, res, next) => {
  let name = req.params.name
  const sql = `SELECT
              zj_articles.*,
              zj_users.user_name
              FROM
              zj_sorts
              INNER JOIN zj_articles ON zj_articles.sort_id = zj_sorts.sorts_id
              INNER JOIN zj_users ON zj_articles.user_id = zj_users.user_id
              WHERE
              zj_sorts.sort_name = ?`
  const data = [name]
  db.base(sql, data, (result) => {
    res.json(
      {
        "data": result,
        "meta": {
          "msg": '获取文章成功',
          "status": 200
        }
      }
    )

  })


}
//标签
exports.allTag = (req, res, next) => {
  const sql = `SELECT * FROM zj_labels`
  db.base(sql, null, (tagList) => {
    async.map(tagList, (item, callback) => {
      const sql = `SELECT
                  count(zj_article_label.ch_article_id) as total
                  FROM
                  zj_article_label
                  WHERE
                  zj_article_label.ch_label_id = ?`
      const data = [item.label_id]
      db.base(sql, data, (result) => {
        item.articleNum = result[0].total
        callback(null, item)
      })
    }, (err, artNum) => {
      res.json(
        {
          "data": artNum,
          "meta": {
            "msg": '获取标签成功',
            "status": 200
          }
        }
      )


    })
  })
}
//标签获取文章
exports.articleByTagName = (req, res, next) => {
  let name = req.params.name
  const sql = `SELECT
              zj_articles.*,
              zj_sorts.sort_name,
              zj_users.user_name
              FROM
              zj_article_label
              INNER JOIN zj_articles ON zj_article_label.ch_article_id = zj_articles.article_id
              INNER JOIN zj_labels ON zj_article_label.ch_label_id = zj_labels.label_id
              INNER JOIN zj_sorts ON zj_articles.sort_id = zj_sorts.sorts_id
              INNER JOIN zj_users ON zj_articles.user_id = zj_users.user_id
              WHERE
              zj_labels.label_name = ?`
  const data = [name]


  db.base(sql, data, (result) => {
    res.json(
      {
        "data": result,
        "meta": {
          "msg": '获取文章成功',
          "status": 200
        }
      }
    )

  })


}
//归档
exports.articleFiling = (req, res, next) => {
  const sql = `SELECT
               zj_articles.article_id,
               zj_articles.article_date,
               zj_articles.article_title
               FROM
               zj_articles
               order by article_date desc`
  db.base(sql, null, (result) => {
    res.json(
      {
        "data": result,
        "meta": {
          "msg": '获取文章成功',
          "status": 200
        }
      }
    )

  })

}
//添加文章
exports.addArticle = (req, res, next) => {
  async.waterfall([
    function (callback) {
      let addData = req.body.params
      const sql = `INSERT INTO zj_articles (article_title, article_content, article_date, sort_id, user_id,article_views,article_comment_count) VALUES (?,?,?,?,?,0,0);`
      const data = [addData.name, addData.content, moment(addData.pubTime).format('YYYY-MM-DD HH:mm:ss'), addData.sort, addData.user_id]
      db.base(sql, data, (result) => {
        if (result.affectedRows === 1) {
          callback(null, addData.name, addData.label)
        }
      })
    },
    function (articleName, articlelabel, callback) {
      const sql = `SELECT zj_articles.article_id FROM zj_articles WHERE zj_articles.article_title = ?`
      const data = [articleName]
      db.base(sql, data, (result) => {
        callback(null, result, articlelabel)
      })
    },
    function (articleId, articlelabel, callback) {
      async.map(articlelabel, (item, callback) => {
        const sql = `INSERT INTO zj_article_label (ch_article_id,ch_label_id) VALUES (?,?)`
        const data = [articleId[0].article_id, item]
        db.base(sql, data, (result) => {
          callback(null, result)
        })
      }, (err, result) => {
        callback(null, result)
      })
    }
  ], function (err, result) {
    let status = result.every(item => {
      return item.affectedRows === 1
    })
    if (status) {
      res.json(
        {
          "meta": {
            "msg": '添加文章成功',
            "status": 200
          }
        }
      )

    }
  })
}
//文章列表页（文章管理）
exports.articleManage = (req, res, next) => {
  const sql = `SELECT
  zj_articles.*,
  zj_sorts.sort_name,
  zj_users.user_name
  FROM
  zj_articles
  JOIN zj_sorts ON zj_articles.sort_id = zj_sorts.sorts_id
  INNER JOIN zj_users ON zj_articles.user_id = zj_users.user_id
  order by article_id desc`
  db.base(sql, null, (result) => {
    async.map(result, (obj, callback) => {
      const sql = `SELECT
      zj_article_label.ch_label_id
      FROM
      zj_article_label
      WHERE
      zj_article_label.ch_article_id = ?`
      const data = [obj.article_id]
      db.base(sql, data, (result) => {
        let arr = []
        async.waterfall([
          function (callback) {
            result.forEach(item => {
              arr.push(item.ch_label_id)
            })
            obj.label_id = arr
            callback(null, obj)
          }
        ], function (err, result) {
          callback(null, result)
        })
      })
    }, (err, artNum) => {
      res.json(
        {
          "data": artNum,
          "meta": {
            "msg": '获取分类成功',
            "status": 200
          }
        }
      )
    })

  })
}
//修改文章
exports.articleUpdate = (req, res, next) => {
  let addData = req.body.params
  let artId = addData.article_id
  let artTitle = addData.name
  let artContent = addData.content
  let artSort = addData.sort
  let artDate = moment(addData.pubTime).format('YYYY-MM-DD HH:mm:ss')
  let artLabel = addData.label
  const sql = `UPDATE zj_articles SET article_title = ?,article_content = ?,article_date = ?,sort_id = ? WHERE article_id = ?`
  const data = [artTitle, artContent, artDate, artSort, artId]
  db.base(sql, data, (result) => {
    if (result.affectedRows === 1) {
      async.waterfall([
        function (callback) {
          const sql = `DELETE FROM zj_article_label WHERE ch_article_id = ?`
          const data = [artId]
          db.base(sql, data, (result) => {
            callback(null)
          })
        },
        function (callback) {
          async.map(artLabel, (item, callback) => {
            const sql = `INSERT INTO zj_article_label (ch_article_id,ch_label_id) VALUES (?,?)`
            const data = [artId, item]
            db.base(sql, data, (result) => {
              callback(null, result)
            })
          }, (err, result) => {
            const complete = result.every(item => {
              return item.affectedRows === 1
            })
            if (complete) {
              res.json(
                {
                  "meta": {
                    "msg": '修改文章成功',
                    "status": 200
                  }
                }
              )

            }
          })
        }
      ])

    }
  })

}






