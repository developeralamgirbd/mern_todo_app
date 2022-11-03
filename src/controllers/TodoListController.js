const TodoListService = require('../services/TodoListService');
const TodoListModel = require('../models/todoListModel');
exports.create = async (req, res)=>{
    try {
        const {subject, description} = req.body;

        const userName = req.auth.userName;

        const todoListData = {
            subject,
            description,
            userName
        }

        const todoList = await TodoListService.createService(todoListData);

        res.status(200).json({
            status: 'success',
            message: 'Successfully create todo list',
            data: todoList
        });
    }catch (error) {
        res.status(500).json({
            status: 'fail',
            error
        });
    }

};

exports.getTodoList = async (req, res)=>{
    try {
        const userName = req.auth.userName;
        const result = await TodoListModel.find({userName}, {_id:0}).sort({_id: -1});

        if (result.length === 0){
            res.status(404).json({
                status: 'fail',
                message: 'Data not found',
                data: result
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Successfully get all todo list data',
            data: result
        });
    }catch (error) {
        res.status(500).json({
            status: 'fail',
            error
        });
    }
}

exports.update = async (req, res)=>{
    try {

    }catch (error) {
        res.status(500).json({
            status: 'fail',
            error
        });
    }
}

