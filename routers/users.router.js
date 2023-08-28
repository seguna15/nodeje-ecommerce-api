const express = require('express');
const { getUsers, createUser, getCount, getUser, login, deleteUser } = require('../controllers/user.controller')
const router = express.Router();

router
    .get(`/`, getUsers)
    .get(`/:id`, getUser)
    .delete('/:id', deleteUser)
    .get(`/get/count`, getCount)
    .post('/register', createUser)
    .post('/login', login)
    


module.exports = router
