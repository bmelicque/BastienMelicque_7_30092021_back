const express = require('express')
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');

router.get('/:id', userCtrl.userInfo);
router.get('/', auth, userCtrl.getAllUsers);
router.put('/:id', auth, userCtrl.updateUser);
router.put('/', auth, userCtrl.updatePassword);
router.delete('/', auth, userCtrl.deleteUser);

module.exports = router;