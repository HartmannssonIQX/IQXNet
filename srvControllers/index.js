var router = require('express').Router()

router.use('/api/maint', require('./apiMaint'))
router.use('/api/document', require('./apiDocument'))
router.use('/api/auth', require('./apiAuth'))
router.use('/api/register', require('./apiRegister'))
router.use('/api/jobs', require('./apiJobs'))
router.use('/api', require('./api'))
router.use('/', require('./static'))

module.exports = router
