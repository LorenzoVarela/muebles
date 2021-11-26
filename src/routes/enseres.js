const express = require('express');
//const editorServer = require('datatables.net-editor-server');
const router = express.Router();
const upload = require('../lib/storage')

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');



router.get('/enseres/', isLoggedIn, async(req, res) => {
    const enseres = await pool.query('SELECT * FROM muebles');
    console.log({ enseres });
    res.render('enseres/list', { enseres });
});

router.get('/enseres/adds/', isLoggedIn, (req, res) => {
    console.log('________________________________/enseres/add');
    res.render('enseres/adds');
});

router.post('/enseres/add/', isLoggedIn, async(req, res) => {
    const { mueblesNombre, mueblesDescripcion, mueblesImagen } = req.body;
    const newsEnser = {
        mueblesNombre,
        mueblesDescripcion,
        mueblesImagen
    };
    try {
        await pool.query('insert into muebles set ?', [newsEnser]);
        req.flash('success', 'Mueble insert');
    } catch (err) {
        console.log(err);
    }
    console.log(newsEnser);
    res.redirect('/enseres/');
})


router.get('/enseres/edit/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;

    console.log('ID:' + id.length);

    if (id.length >= 1) {
        const enseres = await pool.query('SELECT * FROM muebles WHERE id = ?', [id]);
        const historia = await pool.query('SELECT * FROM historiaMuebles where muebles_id = ? and historiaActivo = 1', [id]);
        if (!enseres) {
            console.log('Error id no válido');
        }
        res.render('enseres/edit', { enser: enseres[0], historia });
    } else {
        console.log('Entrando de forma erronea');
        res.redirect('/');
    }

});

router.post('/enseres/update/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const { mueblesNombre, mueblesDescripcion, mueblesImagen } = req.body;
    const edEnser = {
        mueblesNombre,
        mueblesDescripcion,
        mueblesImagen
    };
    try {
        await pool.query('UPDATE muebles SET ? WHERE id = ?', [edEnser, id]);
        req.flash('success', 'Mueble update');
    } catch (err) {
        console.log(err);
    }
    res.redirect('enseres/');
});



module.exports = router;