const TodoList = require('../models/todoListModel');

exports.createService = async (todoListData)=>{
 	return await TodoList.create(todoListData);
}