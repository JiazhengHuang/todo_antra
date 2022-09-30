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

    const updateTodo = (id) =>
        fetch([baseUrl, todopath, id].join("/"), {
            method: "PUT",
            body: JSON.stringify(todo),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }).then((response) => response.json());

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
        updateTodo,
    };
})();

// * ~~~~~~~~~~~~~~~~~~~ View ~~~~~~~~~~~~~~~~~~~
const View = (() => {
    const domstr = {
        pendingContainer: "#pending-todolist-container",
        completedContainer: "#completed-todolist-container",
        inputbox: ".todolist__input",
        submitbtn: ".btn-submit",
        deletebtn: ".delete-btn",
        editbtn: ".edit-btn",
        moveRightbtn: ".moveRight-btn",
        moveLeftbtn: ".moveLeft-btn",

        // editIcon: `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>`,
        // deleteIcon: `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`,
        // arrowLeftIcon: `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowBackIcon" aria-label="fontSize small"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>`,
        // arrowRightIcon: `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>`,
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
            <input class="linput-${todo.id}" style='display:none;'/>
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
            <input class="rinput-${todo.id}" style="display:none"/>
            <button class="editRight-btn" id="${todo.id}">edit</button>
            <button class="delete-btn" id="${todo.id}">X</button>
        </li>
        `;
        });
        return tmp;
    };

    return {
        domstr,
        render,
        createTmp,
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
        #cptodolist = [];

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

        get cptodolist() {
            return this.#cptodolist;
        }
        set cptodolist(newcptodolist) {
            this.#cptodolist = newcptodolist;

            const todocontainer = document.querySelector(
                view.domstr.completedContainer
            );
            const tmp = view.createCompletedTmp(this.#cptodolist);
            view.render(todocontainer, tmp);
        }
    }

    return {
        getTodos,
        deleteTodo,
        addTodo,
        editTodo,
        State,
        Todo,
        CPTodo,
    };
})(Api, View);

// * ~~~~~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~~~~~~
const Controller = ((model, view) => {
    const state = new model.State();

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
                state.cptodolist = state.cptodolist.filter(
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
                    state.todolist = [todofromBE, ...state.todolist];
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
                const objIndex = state.cptodolist.findIndex(
                    (obj) => +obj.id === +event.target.id
                );
                console.log(objIndex);
                // add cptodo to right
                const todo = new model.Todo(state.cptodolist[objIndex].title);
                model.addTodo(todo).then((todofromBE) => {
                    console.log(todofromBE);
                    state.todolist = [todofromBE, ...state.todolist];
                });
                // delete todo from left
                state.cptodolist = state.cptodolist.filter(
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
                const currid = event.target.id;
                const txt = state.todolist.filter(
                    (todo) => +todo.id === +event.target.id
                )[0].title;
                const cn = "lspanSwitch-" + event.target.id;
                console.log("span classname: " + cn);
                const ele = document.getElementsByClassName(cn);
                ele[0].style.display = "none";
                const cn2 = "linput-" + event.target.id;
                const ele2 = document.getElementsByClassName(cn2)[0];
                ele2.style.display = "block";
                ele2.value = txt;

                ele2.addEventListener("keyup", (event) => {
                    if (
                        event.key === "Enter" &&
                        event.target.value.trim() !== ""
                    ) {
                        const newInputTxt = event.target.value;
                        console.log(newInputTxt);

                        // add
                        const todo = new model.Todo(newInputTxt);
                        model.addTodo(todo).then((todofromBE) => {
                            state.todolist = [todofromBE, ...state.todolist];
                        });

                        // delete todo from left
                        state.todolist = state.todolist.filter(
                            (todo) => +todo.id !== +currid
                        );
                        model.deleteTodo(currid);
                    }
                });
            }
        });

        cptodocontainer.addEventListener("click", (event) => {
            if (event.target.className === "editRight-btn") {
                const currid = event.target.id;
                const txt = state.cptodolist.filter(
                    (todo) => +todo.id === +event.target.id
                )[0].title;
                const cn = "rspanSwitch-" + event.target.id;
                console.log("span classname: " + cn);
                const ele = document.getElementsByClassName(cn);
                ele[0].style.display = "none";
                const cn2 = "rinput-" + event.target.id;
                const ele2 = document.getElementsByClassName(cn2)[0];
                ele2.style.display = "block";
                ele2.value = txt;

                ele2.addEventListener("keyup", (event) => {
                    if (
                        event.key === "Enter" &&
                        event.target.value.trim() !== ""
                    ) {
                        const newInputTxt = event.target.value;

                        // add
                        const todo = new model.CPTodo(newInputTxt);
                        model.addTodo(todo).then((todofromBE) => {
                            state.cptodolist = [
                                todofromBE,
                                ...state.cptodolist,
                            ];
                        });

                        // delete todo from left
                        state.cptodolist = state.cptodolist.filter(
                            (todo) => +todo.id !== +currid
                        );
                        model.deleteTodo(currid);
                    }
                });
            }
        });
    };

    const init = () => {
        model.getTodos().then((todos) => {
            state.todolist = todos
                .reverse()
                .filter((todo) => todo.completed === false);
        });

        model.getTodos().then((todos) => {
            state.cptodolist = todos
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
