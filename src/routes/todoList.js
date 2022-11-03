const express = require('express');
const router = express.Router();

const TodoListController = require('../controllers/TodoListController');
const {AuthVerifyMiddleware} = require("../middleware/AuthVerifyMiddleware");


router.post('/todo-list', AuthVerifyMiddleware, TodoListController.create);
router.get('/todo-list', AuthVerifyMiddleware, TodoListController.getTodoList);


module.exports = router;