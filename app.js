const express = require('express')
const mysql = require('mysql');
const path = require('path');
const app = express();
const session = require('express-session');
app.use(session({ secret: "Secret", resave: false, saveUninitialized: true }));

require('dotenv').config()
// Соединение с базой данных
const connection = mysql.createConnection({
    host: '127.0.0.1',
    database: 'nature',
    user: 'root',
    password: 'secret'
});

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
});

// Парсинг json
app.use(express.json())

// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static('public'));

// Настройка шаблонизатора
app.set('view engine', 'ejs');

// Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'));

// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }));

// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000);


// Middleware
function isAuth(req, res, next) {
    if (req.session.auth) {
        next();
    } else {
        res.redirect('/');
    }
};
/**
 * Маршруты
 */
app.post('/items', (req, res) => {
    connection.query("SELECT * from items LIMIT 4 OFFSET ?", [[req.body.offset]], (err, data, fields) => {
        if (err) {
            console.log(err);
        }

        res.status(200).send(data);
    })
});

app.get('/', (req, res) => {
    const itemsPerPage = 4;
    let page = parseInt(req.query.page); // localhost?page=4
    if (!page) page = 1;

    connection.query('SELECT count(id) as count from items', (err, data, fields) => {
        const count = data[0].count;
        const pages = Math.ceil(count / itemsPerPage);

        if (err) {
            console.log(err);
        }

        if (page > pages) {
            page = pages;
        }

        connection.query("SELECT * FROM items LIMIT ? OFFSET ?", [[itemsPerPage], [itemsPerPage * (page - 1)]], (err, data, fields) => {
            res.render('home', {
                'items': data,
                'currentPage': page,
                'totalPages': pages,
                'session': req.session.auth
            });
        });
    })
})

app.get('/items/:id', (req, res) => {
    connection.query("SELECT * FROM items WHERE id=?", [req.params.id],
        (err, data1, fields) => {


            connection.query("SELECT * FROM cat", (err, data_cat, fields) => {
                if (err) {
                    console.log(err);
                }

                connection.query("SELECT * FROM cat WHERE id in (SELECT cat_id FROM items_cat WHERE id = ?)", [[req.params.id]], (err, data_cat12, fields) => {
                    if (err) {
                        console.log(err);
                    }
                    // console.log(data_cat12);
                    res.render('item', {
                        'item': data1[0],
                        'cat': data_cat,
                        'cate': data_cat12
                    })

                });
            })
        })
})
app.get('/add', isAuth, (req, res) => {
    res.render('add')
})

app.post('/store', isAuth, (req, res) => {
    connection.query(
        "INSERT INTO items (title, image) VALUES (?, ?)",
        [[req.body.title], [req.body.image]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }

            res.redirect('/');
        }
    );
})

app.post('/delete', isAuth, (req, res) => {
    connection.query(
        "DELETE FROM items WHERE id=?", [[req.body.id]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
})

app.post('/update', isAuth, (req, res) => {
    connection.query(
        "UPDATE items SET title=?, image=? WHERE id=?", [[req.body.title], [req.body.image], [req.body.id]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            connection.query(
                "SELECT * FROM items_cat WHERE id=? AND cat_id = ?", [[req.body.id], [req.body.cat_id]], (err, data, fields) => {
                    if (err) {
                        console.log(err);
                    }
                    if (data.length == 0) {
                        connection.query(
                            'INSERT INTO items_cat (id, cat_id) VALUES (?, ?)', [[req.body.id], [req.body.cat_id]], (err, data, fields) => {
                                if (err) {
                                    console.log(err);
                                }

                            }
                        );
                    } res.redirect('/');
                });
        })
})
app.get('/auth', (req, res) => {
    res.render('auth');

});

app.post('/auth', (req, res) => {
    connection.query(
        "SELECT * FROM users WHERE name=? and password=?",
        [[req.body.name], [req.body.password]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            if (data.length > 0) {
                // console.log('auth');
                req.session.auth = true;
            }
            res.redirect('/');
        }
    );
})


app.get('/cat', isAuth, (req, res) => {
    res.render('cat')
})

app.post('/new_cat', isAuth, (req, res) => {
    connection.query(
        "INSERT INTO cat (title, description) VALUES (?, ?)",
        [[req.body.title], [req.body.description]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }

            res.redirect('/');
        }
    );
})

app.get('/categories', (req, res) => {
    connection.query("select * from cat", (err, data, fields) => {
        if (err) {
            console.log(err);
        }

        res.render('categories', {
            categories: data
        });
    });
});

app.get('/category-items/:id', (req, res) => {
    connection.query('select id from items_cat where cat_id=?', [[req.params.id]], (err, data, fields) => {
        if (err) {
            console.log(err);
        }
        let as =[]
        for(let i = 0; data.length > i; i++){
            as[i]=data[i].id
        }
        // console.log(as);
        connection.query('select * from items where id in ?', [[as]], (err, items, fields) => {
            if (err) {
                console.log(err);
            }
            // console.log(data);
            console.log(items);
            if (items == undefined) items == []
        res.render('category-items', {
            items: items,
        });
    });
});
});

app.post('/reg', (req, res) => {
    connection.query(
        "INSERT INTO users (name, password) VALUES (?, ?)",
        [[req.body.name], [req.body.password]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }

            res.redirect('/');
        }
    );
})

app.post('/not_log', (req, res) => {
    req.session.auth = false;
    res.redirect('auth');
})