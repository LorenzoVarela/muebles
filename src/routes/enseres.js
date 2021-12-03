const express = require('express');
const MimeTypes = require('mime-types');
//const editorServer = require('datatables.net-editor-server');
const router = express.Router();
//const upload = require('../lib/storage')

const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'src/public/storage/imgs/',
    filename: function(req, file, cb) {
        cb("", MimeTypes.extension(file.filename) + Date.now() + "." + MimeTypes.extension(file.mimetype));
    }
})
const upload = multer({
    storage: storage
});

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const { route } = require('./authentication');



router.get('/enseres/', isLoggedIn, async(req, res) => {
    const enseres = await pool.query('SELECT * FROM muebles where mueblesActivo = 1');

    res.render('enseres/list', { enseres });
});

router.get('/enseres/adds/', isLoggedIn, (req, res) => {

    res.render('enseres/adds');
});

router.post('/enseres/add/', isLoggedIn, upload.single('mueblesImagen'), async(req, res) => {
    var { mueblesNombre, mueblesDescripcion, autor, materiales, unidadesInicio, unidadesActuales } = req.body;
    var mueblesImagen = 'ejemplo.jpeg';
    if (typeof req.file !== "undefined") {
        var mueblesImagen = req.file.filename;
    }


    if (unidadesActuales.length == 0) {
        unidadesActuales = 1;
    }
    if (unidadesInicio.length == 0) {
        unidadesInicio = 1;
    }
    const newsEnser = {
        mueblesNombre,
        mueblesDescripcion,
        autor,
        materiales,
        unidadesInicio,
        unidadesActuales,
        mueblesImagen
    };


    try {
        console.log(newsEnser);
        await pool.query('insert into muebles set ?', [newsEnser]);
        req.flash('success', 'Mueble insert');
    } catch (err) {
        console.log(err);
    }
    console.log(newsEnser);
    res.redirect('/enseres/');
});

router.post('/enseres/update/:id', isLoggedIn, upload.single('mueblesImagen'), async(req, res) => {
    const { id } = req.params;

    var { mueblesNombre, mueblesDescripcion, autor, materiales, unidadesInicio, unidadesActuales, mueblesImagen } = req.body;


    if (typeof req.file !== "undefined") {
        var mueblesImagen = req.file.filename;
    }

    if (unidadesActuales.length == 0) {
        unidadesActuales = 0;
    }
    if (unidadesInicio.length == 0) {
        unidadesInicio = 0;
    }
    const edEnser = {
        mueblesNombre,
        mueblesDescripcion,
        mueblesImagen,
        autor,
        materiales,
        unidadesInicio,
        unidadesActuales
    };



    try {
        console.log({ edEnser });
        await pool.query('UPDATE muebles SET ? WHERE id = ?', [edEnser, id]);
        req.flash('success', 'Mueble update');
    } catch (err) {
        console.log(err);
    }
    res.redirect('/enseres');
});

router.get('/enseres/edit/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;


    if (id.length >= 1) {
        const enseres = await pool.query('SELECT * FROM muebles WHERE id = ?', [id]);
        const historia = await pool.query('SELECT * FROM historiaMuebles where muebles_id = ? and historiaActivo = 1 order by historiaFecha', [id]);
        if (!enseres) {
            console.log('Error id no válido');
        }
        res.render('enseres/edit', { enser: enseres[0], historia });
    } else {
        console.log('Entrando de forma erronea');
        res.redirect('/');
    }

});


router.post('/enseres/addHistoria/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const { historiaFecha, historiadescripcion } = req.body;

    const newHistoria = {
        historiaFecha,
        historiadescripcion,
        muebles_id: id
    };
    try {
        await pool.query('insert into historiaMuebles set ?', [newHistoria]);
        req.flash('success', 'Mueble insert');
    } catch (err) {
        console.log(err);
    }
    res.redirect(`/enseres/edit/${id}`);
});

router.get('/enseres/delHistoria/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;

    const delHistoria = {
        id,
        historiaActivo: '0'
    };
    try {
        const enseres = await pool.query('SELECT muebles_id FROM historiaMuebles where id = ?', [id]);
        console.log({ enseres });
        console.log(enseres[0].muebles_id);
        var enser = enseres[0].muebles_id;
        await pool.query('UPDATE historiaMuebles SET ? WHERE id = ?', [delHistoria, id]);
        req.flash('success', 'Historia elimianda');
    } catch (err) {
        console.log(err);
    }

    res.redirect('/enseres/edit/' + enser);
})

router.post('/enseres/delete/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const { causaBaja } = req.body;

    const deleteEneseres = {
        mueblesActivo: 0,
        causaBaja
    };


    console.log({ deleteEneseres });
    try {
        await pool.query('UPDATE muebles SET ? WHERE id = ?', [deleteEneseres, id]);
        req.flash('success', 'Mueble update');
    } catch (err) {
        console.log('Error en borrar muebles: ' + err);
    }
    res.redirect('/enseres');
})







module.exports = router;