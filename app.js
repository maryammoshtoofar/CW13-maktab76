const API_URL = "https://62ac4e7dbd0e5d29af1fac5b.mockapi.io";
const DEFAULT_PAGE_COUNT = 10;
const TodoTable = document.querySelector(".tableBody");
const TodoForm = document.querySelector("#create-todo");
let currentPage = 1;
// const AddBtn = TodosForm.querySelector("button");

document.addEventListener("DOMContentLoaded", () => {
  readTodoList();
});

const readTodoList = () => {
  TodoTable.innerHTML = "";
  fetch(`${API_URL}/todosList${generateQueryParams(currentPage)}`)
    .then((res) => res.json())
    .then((data) => {
      const { todosList, count } = data;
      createPagination(count);
      todosList.forEach(AddToDOM);
    });
};

document.querySelector("ul.pagination").addEventListener("click", (event) => {
  currentPage = Number(event.target.innerHTML);
  readTodoList();
  const lis = document.querySelectorAll(".page-link");
  lis.forEach((li) => li.classList.remove("active"));
  event.target.classList.add("active");
});

const generateQueryParams = (page = 1) => {
  return `?page=${page}&limit=${DEFAULT_PAGE_COUNT}`;
};

const AddToDOM = (todo) => {
  const TodoRow = document.createElement("tr");
  TodoRow.dataset.id = todo.id;
  const { statusCell, todoCell, actionCell } = generateTableCells(todo);

  TodoRow.appendChild(statusCell);
  TodoRow.appendChild(todoCell);
  TodoRow.appendChild(actionCell);

  TodoTable.appendChild(TodoRow);
};

const generateTableCells = (todo) => {
  const statusCheckBox = document.createElement("input");
  statusCheckBox.type = "checkbox";
  if (todo.status) statusCheckBox.checked = true;
  statusCheckBox.addEventListener("click", (e) => {
    checkTodo(todo, e.target, todoCell);
  });
  const statusCell = document.createElement("td");
  statusCell.appendChild(statusCheckBox);

  const todoCell = document.createElement("td");
  if (todo.status) todoCell.innerHTML = `<del>${todo.todos}</del>`;
  else todoCell.innerHTML = todo.todos;

  const DelBtn = document.createElement("button");
  DelBtn.dataset.id = todo.id;
  DelBtn.innerHTML = "delete";
  DelBtn.className = "btn bg-red text-white";
  DelBtn.addEventListener("click", () => {
    deleteTodo(todo.id);
  });
  const actionCell = document.createElement("td");
  actionCell.appendChild(DelBtn);

  return { statusCell, todoCell, actionCell };
};

// Create
TodoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  createNewTodo();
});
const createNewTodo = () => {
  const newTodo = gatherFormData();
  fetch(`${API_URL}/todosList`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTodo),
  })
    .then((res) => res.json())
    .then((todo) => AddToDOM(todo));
};

const gatherFormData = () => {
  const newTodo = TodoForm.querySelector("#addTodoInput").value;
  return { status: false, todos: newTodo };
};

// Delete

const deleteTodo = (todoId) => {
  const TodoRow = TodoTable.querySelector(`[data-id="${todoId}"]`);
  fetch(`${API_URL}/todosList/${todoId}`, {
    method: "DELETE",
  }).then((res) =>
    res.json().then(() => {
      TodoRow.remove();
    })
  );
};

//Check

const checkTodo = (todo, checkbox, todoCell) => {
  if (checkbox.checked) {
    todo.status = true;
    todoCell.innerHTML = `<del>${todo.todos}</del>`;
  } else {
    todo.status = false;
    todoCell.innerHTML = todo.todos;
  }

  fetch(`${API_URL}/todosList/${todo.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  }).then((res) => res.json());
};

// Create Pagination

const createPagination = (todoCount) => {
  const pageCount = Math.ceil(todoCount / DEFAULT_PAGE_COUNT);
  let lis = "";
  for (let i = 1; i <= pageCount; i++) {
    lis += `<li class="page-item ${
      i === currentPage ? "active" : ""
    }"><a href="#" class="page-link">${i}</a></li>`;
  }
  document.querySelector("ul.pagination").innerHTML = lis;
};
