var app = function() {

	var todos = [];
	var el;
	var obj = this;


	//utility functions
	function getTodoIndex(id) {
		console.log(id);
		for(var i = 0; i < todos.length; i++)
			if("todo-" + todos[i].id === id)
				return i;
	}

	function getMaxId() {
		var max = -1;
		for( var i = 0; i < todos.length; i++)
			if(todos[i].id > max)
				max = todos[i].id;

		return max;
	}

	//keyevent handler for new-todo
	function newTodoEvent( event ) {
		if ( event.keyCode === 13 ) {
			obj.createTodo( {text: document.getElementById( 'new-todo' ).value});
			this.value = '';
		}
	}

	var todo = function (params) {

		this.id = params.id || getMaxId() + 1;
		this.done = params.done || false;
		this.text = params.text || 'This is a new todo!';

		return this;
	}

	this.initialize = function (obj) {
		el = document.getElementById("todo-list");
		document.getElementById("new-todo").addEventListener("keypress", newTodoEvent, false);
	};

	this.renderList = function() {

		//Render todo-list
		var doneCount = 0;
		el.innerHTML = '';

		for( var i = 0; i < todos.length; i++ ) {
			var li = document.createElement('li');
			li.setAttribute('id', 'todo-' + todos[i].id);
			li.className = "todo" + ((todos[i].done) ? ' done' : '');

			var text = document.createElement('div');
			text.innerHTML = todos[i].text;
			li.appendChild(text);

			var btn = document.createElement('button');
			btn.className = "todo-done";
			btn.addEventListener('click', function (e) { obj.toggleDone(e.target.parentElement.id); });
			btn.innerHTML = '&#x2713';
			li.appendChild(btn);

			btn = document.createElement('button');
			btn.className = "todo-remove";
			btn.addEventListener('click', function (e) { obj.removeTodo(e.target.parentElement.id); });
			btn.innerHTML = 'X';

			li.appendChild(btn);
			el.appendChild(li);

			if(todos[i].done)
				doneCount++;
		}
		console.log(doneCount)
		document.getElementById('todo-count').innerHTML = "<strong>" + todos.length + "</strong> items. <strong>" + (doneCount/(todos.length != 0 ? todos.length : 1)  * 100).toFixed(2) + "%</strong> complete.";
	}

	this.createTodo = function(params) {
		var t = new todo(params);
		todos.push(t);
		this.renderList();
	}

	this.removeTodo = function(id) {
		var index = getTodoIndex(id);
		todos.splice(index, 1);
		this.renderList();
	}

	this.toggleDone = function(id) {
		var index = getTodoIndex(id);
		todos[index].done = !todos[index].done;
		this.renderList();
	}

	return this;
}

var a = new app();
a.initialize(a);