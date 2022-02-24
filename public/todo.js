//code for the to do app
"use strict";

/**
 * Insert a todo item into the DOM
 * @param {Todo Object} data 
 */
function addTodoToTable(data){
    //Accessing the div for storing the todo list
    const todo = document.querySelector("#todo")

    //Check if table exists
    if(!todo.querySelector("#todo-table")){
        //Add the table in the first time
        //create a dom parser object to convert a table string to dom nodes
        const parser = new DOMParser();

        //parse.parseFromString takes a string and a format and converts/parses
        //that string into a tree of dom nodes
        const table = parser.parseFromString(`<table class="table" id="todo-table">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Description</th>
                                                            <th scope="col">Priority</th>
                                                            <th scope="col">Due Date</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="todo-body">
                                                    </tbody>
                                                </table>`, "text/html");
        
        //add this in as a child of the todo dom node
        //When we parse a string of html, we only care about the "body"
        todo.appendChild(table.firstElementChild);

    }   //end of if

    //grab the table body to manipulate
    const tableBody = todo.querySelector("#todo-body");
    
    //add the event (table row)
    //alternate way to add a chunk of html to the dom
    //Note: "old school" way of doing this (prefer DOMParser over this)
    //create a dom element
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${data.desc}</td>
        <td>${data.priority}</td>
        <td class="todo-date">${new Date(data.due)}</td>
        <td><a href="" class="remove"><i class="bi bi-x-lg"></i></a></td>
    `;

    row.id = `id${data._id}`;

    //append to the table body
    tableBody.appendChild(row);

    //Removes a row 
    row.querySelector(".remove").addEventListener("click", async (evt) => {
        //Stops browser from opening link
        evt.preventDefault();

        const response = await fetch(data.url, {
            method: "DELETE"
        });

        if(!response.ok){
            alert("Failed to remove")
            return;
        }

        //tell tableBody to remove the row node
        tableBody.removeChild(row);
    });
}

/**
 * To add a to do item to our list
 * Create the list if there is no list
 * 
 * @param {string} description 
 * @param {string} dueDate 
 * @param {string} priority 
 */
async function insertTodo(description, dueDate, priority){
    
    //Send the todo to the api
    const response = await fetch("/api/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            desc: description,
            due: dueDate,
            priority: priority
        })
    });

    if(!response.ok){
        alert("The add failed");
        return;
    }

    const data = await response.json();
    addTodoToTable(data);
}

//set a timeout function to check all due dates every second
setInterval( () => {
    document.querySelectorAll(".todo-date").forEach( (item) => {
        //are we overdue?
        const date = new Date(item.innerText);
        const now = new Date();

        //Date came closer to 1970 (overdue)
        if(date < now){
            //To highlight we are going to set the background as bg-danger
            //Select the row that contains this date
            item.closest("tr").classList.add("bg-danger", "text-light");
        }
    });
}, 1000 );

//Set a timeout function to check for new/deleted ToDo items
setInterval( async () => {
    const data = await (await fetch("/api/todo")).json();
    const ids = data.map( (item) => `id${item._id}`);
    const tableBody = document.querySelector("#todo-body");

    //Check todos to remove
    document.querySelectorAll("#todo-body tr").forEach( (item) => {
        if(ids.indexOf(item.id) === -1){
            //Remove the table body, this todo no longer exists
            tableBody.removeChild(item);
        }
    });

    //Check for todos to add
    data.forEach( (item) => {
        if(!tableBody.querySelector(`#id${item._id}`)){
            addTodoToTable(item);
        }
    });
}, 5000);

//Register a function to run once the DOM has finished loading
//Wait to run some code until we know the page has loaded
//Register an event on a dom node by using the addEventListener method
window.addEventListener("load", () => {
    //This code will run once the web page is fully loaded

    //Add a click event listener
    document.querySelector("#add").addEventListener("click", (evt) => {
        //A call to prevent the browser from doing default actions
        evt.preventDefault();
        
        //Grabbing the form DOM node
        const form = document.querySelector("form");
        
        //Using the form DOM node, we are grabbing the information
        const description = form.querySelector("#description");
        const due = form.querySelector("#due");
        const priority = form.querySelector("#priority");

        //Make values
        const dueDataValue = (new Date(due.value)).valueOf();
        
        //Check if the due data is actually a date
        if(isNaN(dueDataValue)){
            due.setCustomValidity("Must be a valid date");
        } else {
            //Resesting the validation on the form item
            due.setCustomValidity("");
        }

        //validate the form input
        if(!(form.checkValidity())){
            //add bootstrap class for validity check
            form.classList.add("was-validated");
            //Leave function
            return;
        }

        //Add todo item
        insertTodo(description.value, new Date(due.value), priority.value);
    });

    //fetch the server todo items
    fetch("/api/todo").then(response => response.json()).then(data => {
        //data is an array of todo items to add into our todo list
        data.forEach(addTodoToTable);
    });
});