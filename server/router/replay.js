const app = require('express');
const router = app.Router();
const fs = require('fs');

router.route('/replay')
    .get((req, res, next) => {
        res.render('./replay', { userName: req.body.userName ,pdfname:req.body.pdfName});
    })
    .post((req, res, next) => {
        res.render('./replay', { userName: req.body.userName, pdfname: req.body.pdfName });
    })
module.exports = router;