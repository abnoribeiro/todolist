const express = require('express'); 
const { request, response } = express;
const {v4:uuid} = require('uuid');
const app = express();
const users = [];

app.use(express.json());

function verifyUserExist(request, response,next){
    const {username} = request.headers;
    const userSelected = users.find((users)=> users.username === username ) 

    if(!userSelected){
        return response.status(400).json({error: "User is not exists!"})
    }

    request.userSelected = userSelected;
    return next();
}

app.post("/user",(request,response) => {
    const {name, username} = request.body;
    const userAlreadyExists = users.some((users) => users.username === username)
    
    if(userAlreadyExists === true){
        response.status(400).json({error: "User already exists!"})
    }

    const user = {
        id: uuid(),
        name: name,
        username: username,
        toDo: []
    }

    users.push(user);

    return response.status(201).json({"User created":user})
});

app.get("/todos",verifyUserExist,(request,response) => {
    const {userSelected} = request;
    
    return response.status(201).json(userSelected)
});

app.post("/todos",verifyUserExist,(request,response)=>{
    const {userSelected} = request;
    const {title, deadline} = request.body;

    const todoUser = {
        id: uuid(),
        title: title,
        done: false,
        deadline: new Date(deadline+" 00:00"),
        created_at: new Date()
    }
    
    userSelected.toDo.push(todoUser);
    return response.status(201).json(todoUser)
});

app.put("/todos/:id",verifyUserExist,(request,response)=>{
    const { userSelected } = request;
    const { id } = request.params;
    const { title, deadline } = request.body;
    const toDo = userSelected.toDo.find((toDo)=> toDo.id == id);
    if(!toDo){
        return response.status(404).json({error: "To Do doesn't exist!"})
    }

    toDo.title = title;
    toDo.deadline = new Date(deadline+" 00:00");
    
    return response.status(201).json(toDo)
});

app.patch("/todos/:id/done",verifyUserExist,(request,response)=>{
    const { userSelected } = request;
    const { id } = request.params;
    
    const toDo = userSelected.toDo.find((toDo)=> toDo.id == id);
    if(!toDo){
        return response.status(404).json({error: "To Do doesn't exist!"})
    }
    toDo.done = true;
    
    return response.status(201).json(toDo)
});

app.delete("/todos/:id",verifyUserExist,(request,response)=>{
    const { userSelected } = request;
    const { id } = request.params;
    
    const toDo = userSelected.toDo.find((toDo)=> toDo.id == id);
    if(!toDo){
        return response.status(404).json({error: "To Do doesn't exist!"})
    }
    userSelected.toDo.splice(toDo,1)
    
    return response.status(204)
});

app.listen(3000)

