"use strict";
var http = require('https');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

//爬取所有关键词的数据
var mustString = ["求职"] //,"干货","IT","工作","大学生职业"
//爬取控制页面的页数
var pages = 20;
try{
	//扫描关键字查询记录
	mustString.map(async function(x) {
	    console.log(">>>",x)
	    var info = []; 
	    //查询第一页
	    var urlS = encodeURI("https://www.zhihu.com/search?type=content&q="+x);
	    //查询动态数据
	    var url = encodeURI("https://www.zhihu.com/r/search?type=content&correction=1&q="+x);
	    //开始爬取
	    info = await startRequest(urlS,info) 
	    fs.writeFile('./info'+x+'.json', JSON.stringify(info) , function (err) {
		    if (err) throw err;
		    // console.log("write Success!");
		}); 

		try{			
			for(var index=0;index<pages;index++){
				var infos = await jsGetInfo(url, index);
			    //写入文件
			    if(infos != []){
			    	//读出文件然后填充
			    	fs.readFile('./info'+x+'.json', function(err, data) {
					 	if (err) throw err;
					 	// console.log(index,">>>>>1==",infos.length,"2==",JSON.parse(data).length)
					  	let dadada = JSON.parse(data).concat(infos);
					  	console.log("asdsa>>>",dadada.length)
					 	fs.writeFile('./info'+x+'.json', JSON.stringify(dadada) , function (err) {
						    if (err) throw err;
						    // console.log("write Success!");
						}); 
					});
			    }	
			}	
		}catch(err){
			console.log("err===",err)
		}

	});
}catch(err){
	console.log("err===",err)
}

//开始爬取
function startRequest(urlS,info) {	    
	return new Promise(function (resolve, reject) {
		//爬取主页信息   
	    http.get(urlS, function (res) {     
	        var html = '';        //用来存储请求网页的整个html内容       
	        res.setEncoding('utf-8'); //防止中文乱码

	  	   //监听data事件，每次取一块数据
	        res.on('data', function (chunk) {  
	        // console.log(chunk) 
	            html += chunk;
	        });
	    	//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
	        res.on('end', async function () {
	        	console.log("html.length>>>",html.length)
	        	//爬取第一页
	        	info = await htmlInfo(html,info);
	        	resolve(info)
	        })
	    }).on('error', function (err) {
	        reject(err)
	    });

	})
    
}

//解析html
function htmlInfo(html){
	return new Promise(async function (resolve, reject) {
		let urlInfo,info=[];
		var $ = cheerio.load(html); //采用cheerio模块解析html
		//解析首页内容
		$('.item, .clearfix').each(await function(i,ele){

		    if( $(this).find('.title').text() != "" ){
		      if($(this).find('.title').find('a').attr('href') == undefined){
		          urlInfo = "无，自行查找: https://www.zhihu.com/search";
		      }else{
		        if($(this).find('.title').find('a').attr('href').indexOf("zhihu.com") == -1){
		          urlInfo = "https://www.zhihu.com"+$(this).find('.title').find('a').attr('href')
		        }else{
		          urlInfo = $(this).find('.title').find('a').attr('href')
		        }                            
		      }
		      //信息存入数组
		      info.push({
		        "title" : $(this).find('.title').text(),
		        "content" : $(this).find('.summary').text(),
		        "url" : urlInfo
		      })
		    }
		});
		resolve(info);
	})
}

//解析动态数据
function jsGetInfo(url,x,info){
	return new Promise(async function (resolve, reject) {
		let htmlR = "";
		let urlZhiHu = url+"&offset="+10*(x);

		http.get(urlZhiHu, function (res) {     
	        var jshtml = '';        //用来存储请求网页的整个html内容     
	        res.setEncoding('utf-8'); //防止中文乱码

	        //监听data事件，每次取一块数据
	        res.on('data', function (chunk) {  
	            jshtml += chunk;
	        });
	     	//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
	        res.on('end', async function () {
	        	//获取到js动态数据 jshtml
	        	if(jshtml != ""){      
	                for(let s=0;s<JSON.parse(jshtml).htmls.length;s++){
	                    htmlR = htmlR+JSON.parse(jshtml).htmls[s]                    
	                }
	                console.log(x,">>>htmlR.length>>>",htmlR.length)
	                info = await htmlInfo(htmlR);
	                resolve(info);
	            }else{
	            	// console.log(x+1,">>>我的天")
	            }
	        })
	    })
	})
}