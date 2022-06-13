const express = require('express');
const app = express();
const session = require('express-session');
const bp = require('body-parser')
const database =  require('./database');
let db;

app.use(bp.urlencoded({ extended: false }))
app.use(bp.json())
app.use(require('cors')())
app.set('trust proxy', 1)

app.post('/signup', async (req, res) => { 
	let params = req.body;
	if(params.password == params.confirmpassword){
		params = {
			username: params.name,
			email: params.email,
			password: params.password
		}
		db = await database.connect();
		let result = await db.collection("eliyaz").findOne({email: params.email});
		if(!result){
			db.collection('eliyaz').insert(params);
			res.status(200).send({status: "successfully registered"});
		}
		else{
			res.send({status: "user already exist"});
		}
	}
	else{
		res.send({message: "invalid details"});
	}
});

app.get('/login', async (req, res) => { 
	db = await database.connect();
	let result = await db.collection("eliyaz").findOne(req.query);
	if(result){
		session.user = req.query.email;
		session.password = req.query.password;
		res.send({status: "valid"});
	}
	else{
		res.send({status: "invalid details"});
	}
});

app.use((req, res,next) => {
	if(session.user!= null && session.password != null){
		next();
	}
	else{
		res.send({"message": "session expired"});
	}
})

app.get('/logout', (req, res) => {
	session.user = null;
	session.password = null;
	res.send({status: "done"});
});

app.put('/todoadd', async(req, res) => {
	let data = {
		key: database.key(),
		task: req.query.task,
		status: "pending"
	}
	let result = await db.collection("eliyaz").updateOne({ email: session.user }, { $push: { todo: data } });
	if(result.modifiedCount){
		res.send({status: "todo task added"});
	}
	else{
		res.status(400).send({status: "unable todo added"});
	}
});

app.put('/todoupdate', async(req, res) => {
	let key = req.query.key;
	let result = await db.collection("eliyaz").updateOne({todo: {$elemMatch: { key: key}}}, { $set: { "todo.$.status": "done"}})
	console.log(result);
	if(result.modifiedCount){
		res.send({status: "completed"});
	}
	else{
		res.status(400).send({status: "task updated failed"});
	}
})

app.delete('/tododel', async(req, res) => {
	let key = req.query.key;
	let result = await db.collection("eliyaz").updateOne({ email: session.user }, { $pull: { todo: { key: key } } });
	if(result.modifiedCount){
		res.send({status: "task deleted"});
	}
	else{
		res.status(400).send({status: "task delete failed"});
	}
})

app.get('/todolist', async(req, res) => {
	let result = await db.collection("eliyaz").findOne({ email: session.user});
	if(result){
		res.send({todolist: result.todo});
	}
	else{
		res.status(400).send({status: "unable fetch data"});
	}
});



app.put('/textadd', async(req, res) => {
	let data = {
		key: database.key(),
		task: req.query.task,
	}
	let result = await db.collection("eliyaz").updateOne({ email: session.user }, { $push: { text: data } });
	if(result.modifiedCount){
		res.send({status: "text added"});
	}
	else{
		res.status(400).send({status: "unable to add text"});
	}
});

app.delete('/textdel', async(req, res) => {
	let key = req.query.key;
	let result = await db.collection("eliyaz").updateOne({ email: session.user }, { $pull: { text: { key: key } } });
	if(result.modifiedCount){
		res.send({status: "text deleted"});
	}
	else{
		res.status(400).send({status: "text delete failed"});
	}
})

app.get('/textlist', async(req, res) => {
	let result = await db.collection("eliyaz").findOne({ email: session.user });
	if(result){
		res.send({textlist: result.text});
	}
	else{
		res.status(400).send({status: "textlist fetch failed"});
	}
});


app.listen(3000, () => { console.log(" listening at port 3000 ") } );