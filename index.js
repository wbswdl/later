const express = require('express');
const bodyParser = require('body-parser');
const read = require('node-readability');
const app = express();
const Article = require('./db').Article;

app.set('port',process.env.PORT || 3000);	//const port = process.env.PORT || 3000;
app.set('view engine','ejs');

//支持编码为JSON的消息请求体
app.use(bodyParser.json());
//支持编码为表单的请求消息体
app.use(bodyParser.urlencoded({extended:true}));



//获取所以文章
app.get('/articles',(req,res,next) => {
	Article.all((err,articles) => {
		if(err) return next(err);
		
		res.format({
			html:() => {
				res.render('articles.ejs',{articles:articles});
			},
			json:() => {
				res.send(articles);
			}
		});
	});
	
});

//创建一篇文章
app.post('/articles',(req,res,next) => {
	const url = req.body.url;

	read(url,(err,result) => {
	
		if(err || !result) res.status(500).send('Error downloading article');

		const data = [result.title,result.content];
		Article.create(data,(err,article) => {
			
			if(err) return next(err);
			
			console.log('[INSERT] -',article.insertId);
			console.log(result.title);
			console.log(result.content);
			res.send('OK');
		});

	});
});

//获取指定文章
app.get('/articles/:id',(req,res,next) =>{
	const id = [req.params.id];

	Article.find(id,(err,article)=>{

		if(err)return next(err);

		console.log('[SELECT] -', article[0]);
		res.format({
			html:() => {
				res.render('article.ejs',{article:article[0]});
			},
			json:() => {
				res.send(article);
			}
		});
		
	});
		
});

//删除指定文章
app.delete('/articles/:id',(req,res,next) => {
	const id = [req.params.id];
	Article._delete(id,(err,article)=>{
		if(err) return next(err);
		console.log('[DELECT] -',article);
		res.send({message:'Deleted'});
	});
});

app.listen(app.get('port'),() => {
	console.log('App start on port',app.get('port'));
});

module.exports = app;