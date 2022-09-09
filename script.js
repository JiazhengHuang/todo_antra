// * ~~~~~~~~~~~~~~~~~~~ Api ~~~~~~~~~~~~~~~~~~~
const Api = (() => {
    // const baseUrl = "https://jsonplaceholder.typicode.com";
    const baseUrl = "http://localhost:3000";
    const todopath = "todos";

    const getTodos = () =>
        fetch([baseUrl, todopath].join("/")).then((response) =>
            response.json()
        );

    const deleteTodo = (id) =>
        fetch([baseUrl, todopath, id].join("/"), {
            method: "DELETE",
        });

    const editTodo = (id) =>
        fetch([baseUrl, todopath, id].join("/"), {
            method: "PUT",
        });

    const addTodo = (todo) =>
        fetch([baseUrl, todopath].join("/"), {
            method: "POST",
            body: JSON.stringify(todo),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }).then((response) => response.json());

    return {
        getTodos,
        deleteTodo,
        addTodo,
        editTodo,
    };
})();

// * ~~~~~~~~~~~~~~~~~~~ View ~~~~~~~~~~~~~~~~~~~
const View = (() => {
    const domstr = {
        todocontainer: "#todolist_container",
        pendingContainer: ".pending-container",
        completedContainer: ".completed-container",
        inputbox: ".todolist__input",
        submitbtn: ".btn-submit",
        deletebtn: ".delete-btn",
        editbtn: ".edit-btn",
        moveRightbtn: ".moveRight-btn",
        moveLeftbtn: ".moveLeft-btn",
    };

    const render = (ele, tmp) => {
        ele.innerHTML = tmp;
    };
    const createTmp = (arr) => {
        let tmp = "";
        arr.forEach((todo) => {
            tmp += `
        <li>
          <span class="lspanSwitch-${todo.id}">${todo.title}</span>
          <input style="display:none"/>
          <button class="editLeft-btn" id="${todo.id}">edit</button>
          <button class="delete-btn" id="${todo.id}">X</button>
          <button class="moveRight-btn" id="${todo.id}">-></button>
        </li>
      `;
        });
        return tmp;
    };
    const createCompletedTmp = (arr) => {
        let tmp = "";
        arr.forEach((todo) => {
            tmp += `
      <li>
        <button class="moveLeft-btn" id="${todo.id}"><-</button>
        <span class="rspanSwitch-${todo.id}">${todo.title}</span>
        <input style="display:none"/>
        <button class="editRight-btn" id="${todo.id}">edit</button>
        <button class="delete-btn" id="${todo.id}">X</button>
      </li>
    `;
        });
        return tmp;
    };

    return {
        render,
        createTmp,
        domstr,
        createCompletedTmp,
    };
})();

// * ~~~~~~~~~~~~~~~~~~~ Model ~~~~~~~~~~~~~~~~~~~
const Model = ((api, view) => {
    const { getTodos, deleteTodo, addTodo, editTodo } = api;

    class Todo {
        constructor(title) {
            this.title = title;
            this.completed = false;
        }
    }

    class CPTodo {
        constructor(title) {
            this.title = title;
            this.completed = true;
        }
    }

    class State {
        #todolist = [];

        get todolist() {
            return this.#todolist;
        }
        set todolist(newtodolist) {
            this.#todolist = newtodolist;

            const todocontainer = document.querySelector(
                view.domstr.pendingContainer
            );
            const tmp = view.createTmp(this.#todolist);
            view.render(todocontainer, tmp);
        }
    }

    class CPState {
        #todolist = [];

        get todolist() {
            return this.#todolist;
        }
        set todolist(newtodolist) {
            this.#todolist = newtodolist;

            const todocontainer = document.querySelector(
                view.domstr.completedContainer
            );
            const tmp = view.createCompletedTmp(this.#todolist);
            view.render(todocontainer, tmp);
        }
    }

    return {
        getTodos,
        deleteTodo,
        addTodo,
        editTodo,
        State,
        CPState,
        Todo,
        CPTodo,
    };
})(Api, View);

// * ~~~~~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~~~~~~
const Controller = ((model, view) => {
    const state = new model.State();
    const cpstate = new model.CPState();

    const deleteTodo = () => {
        const todocontainer = document.querySelector(
            view.domstr.pendingContainer
        );
        const cptodocontainer = document.querySelector(
            view.domstr.completedContainer
        );
        todocontainer.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                state.todolist = state.todolist.filter(
                    (todo) => +todo.id !== +event.target.id
                );
                model.deleteTodo(event.target.id);
            }
        });
        cptodocontainer.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                cpstate.todolist = cpstate.todolist.filter(
                    (todo) => +todo.id !== +event.target.id
                );
                model.deleteTodo(event.target.id);
            }
        });
    };

    const addTodo = () => {
        const inputbox = document.querySelector(view.domstr.inputbox);
        const submitbtn = document.querySelector(view.domstr.submitbtn);

        submitbtn.addEventListener("click", (event) => {
            const inputstr = inputbox.value;
            if (inputstr.trim() !== "") {
                const todo = new model.Todo(inputstr);
                model.addTodo(todo).then((todofromBE) => {
                    console.log(todofromBE);
                    state.todolist = [todofromBE, ...state.todolist];
                });
                event.target.value = "";
            }
        });
    };

    const moveRightTodo = () => {
        const todocontainer = document.querySelector(
            view.domstr.pendingContainer
        );
        todocontainer.addEventListener("click", (event) => {
            if (event.target.className === "moveRight-btn") {
                const objIndex = state.todolist.findIndex(
                    (obj) => +obj.id === +event.target.id
                );
                console.log(objIndex);
                // add cptodo to right
                const cptodo = new model.CPTodo(state.todolist[objIndex].title);
                model.addTodo(cptodo).then((todofromBE) => {
                    console.log(todofromBE);
                    cpstate.todolist = [todofromBE, ...cpstate.todolist];
                });
                // delete todo from left
                state.todolist = state.todolist.filter(
                    (todo) => +todo.id !== +event.target.id
                );
                model.deleteTodo(event.target.id);
            }
        });
    };

    const moveLeftTodo = () => {
        const todocontainer = document.querySelector(
            view.domstr.completedContainer
        );
        todocontainer.addEventListener("click", (event) => {
            if (event.target.className === "moveLeft-btn") {
                const objIndex = cpstate.todolist.findIndex(
                    (obj) => +obj.id === +event.target.id
                );
                console.log(objIndex);
                // add cptodo to right
                const todo = new model.Todo(cpstate.todolist[objIndex].title);
                model.addTodo(todo).then((todofromBE) => {
                    console.log(todofromBE);
                    state.todolist = [todofromBE, ...state.todolist];
                });
                // delete todo from left
                cpstate.todolist = cpstate.todolist.filter(
                    (todo) => +todo.id !== +event.target.id
                );
                model.deleteTodo(event.target.id);
            }
        });
    };

    const editTodo = () => {
        const todocontainer = document.querySelector(
            view.domstr.pendingContainer
        );
        const cptodocontainer = document.querySelector(
            view.domstr.completedContainer
        );

        todocontainer.addEventListener("click", (event) => {
            if (event.target.className === "editLeft-btn") {
                const txt = state.todolist.filter(
                    (todo) => +todo.id === +event.target.id
                )[0].title;
                const cn = "lspanSwitch-" + event.target.id;
                // console.log("span classname: " + cn);
                const ele = document.getElementsByClassName(cn);
            }
        });

        todocontainer.addEventListener("click", (event) => {});
    };

    const init = () => {
        model.getTodos().then((todos) => {
            state.todolist = todos
                .reverse()
                .filter((todo) => todo.completed === false);
        });

        model.getTodos().then((todos) => {
            cpstate.todolist = todos
                .reverse()
                .filter((todo) => todo.completed === true);
        });
    };

    const bootstrap = () => {
        init();
        deleteTodo();
        addTodo();
        editTodo();
        moveRightTodo();
        moveLeftTodo();
    };

    return { bootstrap };
})(Model, View);

Controller.bootstrap();
