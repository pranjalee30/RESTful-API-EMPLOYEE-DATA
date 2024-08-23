const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");
const app = express();
const PORT = 8000;

//Middleware - Pluggin
app.use(express.urlencoded({extended:false}));
app.use((req,res,next)=>{
    console.log("Hello from middleware 1");
    next();
});

app.use((req,res,next)=>{
    console.log("Hello from middleware 2");
    next();
});
//Routes

app.get("/users",(req,res)=>{
    const html =
    `<ul>
        ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>`;
    res.send(html);
});
app.get("/api/users",(req,res)=>{
    return res.json(users);
});


app.route("/api/users/:id")
.get((req,res)=>{
    const id= Number(req.params.id);
    const user = users.find((user)=> user.id === id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
})
.patch((req,res)=>{
    const id = Number(req.params.id);
    const index = users.findIndex((user) => user.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = { ...users[index], ...req.body };
    users[index] = updatedUser;

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err,data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to update user" });
        }
        return res.json(updatedUser);
    });
})
.delete((req,res)=>{
    const id = Number(req.params.id);
    const filteredUsers = users.filter((user) => user.id !== id);

    if (filteredUsers.length === users.length) {
        return res.status(404).json({ error: "User not found" });
    }

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(filteredUsers), (err,data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to delete user" });
        }
        return res.json({ status: "success", id });
    });
});


app.post("/api/users",(req,res)=>{
    const body = req.body;
    users.push({ id:users.length + 1,...body});
    fs.writeFile("./MOCK_DATA.json",JSON.stringify(users),(err,data)=>{
        return res.json({ status: "success", id: users.length});
    });
});


app.listen(PORT,()=>console.log(`Server Started at Port : ${PORT}`));
