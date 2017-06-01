"use strict";

var http = require('http');
var https = require('https');
var fs = require('fs');
var cheerio = require('cheerio');
var moment = require('moment');
const superagent = require('superagent')
require('superagent-charset')(superagent)
const MongoClient = require('mongodb').MongoClient;
const mongo = require('./lib/mongodb');


let init = async() => {
    return new Promise(async(resolve, reject) => {
        MongoClient.connect('mongodb://chuxiaoyu:cxy19931006@115.159.92.249:27017/school', {
            server: {
                auto_reconnect: true,
                poolSize: 200
            },
            promiseLibrary: require('bluebird'),
        }, function(err, db) {
            if (err == null) {
                console.log("======== mongodb connected success=======");
                mongo.SetDb(db);
                resolve();
            } else {
                console.log("======== mongodb connected error =======");
                console.log(err);
                reject(null);
            }
        });
    });
}

//去掉字符串中的特殊字符
var excludeSpecial = function(s) {    
    // 去掉转义字符    
    s = s.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');    
    // 去掉特殊字符    
    s = s.replace(/[\@\#\$\%\^\&\*\{\}\:\"\L\<\>\? ]/);    
    return s;    
 };  

//解析html
function htmlInfo(htmlUrl,title,address,createTime,type){
	return new Promise(async function (resolve, reject) {
		
		let objectInfo = {
			"title" : title,
			"address" : address,
			"url" : htmlUrl,
			"companyType" : type,
			"companyName" : "",
			"companyHeadImg" : "",
			"companyInfo" : "",
			"companyHeadquarters" : "",
			"companyPost" : "",
			"companyPostRequirementText" : "",
			"companyPostRequirementHtml" : "",
			"createTime" : moment(createTime).utcOffset("+08:00")._d
		}

		//牛客
		if(htmlUrl.indexOf('https://www.nowcoder.com') != -1){
			https.get(htmlUrl, function (res) {	
			        var jshtml = '';        //用来存储请求网页的整个html内容
			        res.setEncoding('utf-8'); //防止中文乱码

			        //监听data事件，每次取一块数据
			        res.on('data', function (chunk) {
			            jshtml += chunk;
			        });
			     	//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
			        res.on('end', async function () {
			        	var $ = cheerio.load(jshtml); //采用cheerio模块解析html
						
						//解析公司信息
						objectInfo.companyType.push($('.com-type').text())
						objectInfo.companyHeadquarters = $('.com-lbs').text()
						objectInfo.companyInfo = excludeSpecial($('.com-detail').text())
						objectInfo.companyName = excludeSpecial($('.rec-com').text())
						objectInfo.companyHeadImg = $('.module-body').find('img').attr('src')
						objectInfo.companyPost = $('.rec-job').find('h2').text()
						objectInfo.companyPostRequirementHtml = $('.rec-job>dl').html()
						objectInfo.companyPostRequirementText = excludeSpecial($('.rec-job>dl').text())
					
						resolve(objectInfo);
			        })
			})
		}

		//应届生求职网 
		if(htmlUrl.indexOf('http://www.yingjiesheng.com') != -1){
			superagent.get(htmlUrl)
		    .charset('gbk')
		    .end(function (err, sres) {
			    var html = sres.text;
			    var $ = cheerio.load(html, {decodeEntities: false});

			    objectInfo.companyPost = $('.info.clearfix>ol>li').children().last().text()
			    objectInfo.companyName = $('.mleft>h1').text()
			    
			    $('div>.jobIntro').each(function(i,ele){
			    	if(i == 0){
			    		objectInfo.companyPostRequirementText = excludeSpecial($(this).text())
			    		objectInfo.companyPostRequirementHtml = $(this).html()
			    	}
			    	if(i == 1){
			    		objectInfo.companyInfo = $(this).text()
			    	}
		        	
			    })
			    resolve(objectInfo);
		    });
		}
		
	})
}

//解析js
function jsGetInfo(page,url){
	try{
		return new Promise(async function (resolve, reject) {

			//读取表model
	        const {
				InternshipInfo
			} = require('./lib/mongoModel')

			//牛客
			if(url.indexOf('https://www.nowcoder.com') != -1){
				https.get(url, function (res) {
			        var jshtml = '';        //用来存储请求网页的整个html内容
			        res.setEncoding('utf-8'); //防止中文乱码

			        //监听data事件，每次取一块数据
			        res.on('data', function (chunk) {
			            jshtml += chunk;
			        });
			     	//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
			        res.on('end', async function () {	
			        	jshtml = JSON.parse(jshtml)

		        		if(jshtml.data.jobList.length != 0){
			        		for(let s=0;s<jshtml.data.jobList.length;s++){

			        			let htmlUrl = "https://www.nowcoder.com/recommend-intern/"+jshtml.data.jobList[s].internCompanyId+"?jobId="+jshtml.data.jobList[s].id
			        			let result = await htmlInfo(htmlUrl,jshtml.data.jobList[s].title,jshtml.data.jobList[s].address,jshtml.data.jobList[s].createTime,[])
			        			InternshipInfo.update({url: result.url}, {$set: result}, {upsert: true})   			
			        		}
			        	}
			        	resolve(1);  
			        })
			    })
		    }
		    //应届生求职网 
		    if(url.indexOf('http://www.yingjiesheng.com') != -1){
		    	superagent.get(url)
			    .charset('gbk')
			    .end(function (err, sres) {
			      var html = sres.text;
			      var $ = cheerio.load(html, {decodeEntities: false});
			      
			      $('#tb_job_list>tr').each(async function(ia,ele){
			      	//只要上海地区的
			      	if( $(this).find('.item1>a').text().indexOf('[上海]') != -1){
			      		
			      		let typeAll = [];
			      		$(this).find('.item1>b>a').each(function(i,ele){
			      			typeAll.push($(this).text())
			      		})
			      		// console.log(i,">>>>>>>>>>>",moment('2017-06-01').utcOffset("+08:00")._d) ,address,createTime,type
			      		let urlY = "http://www.yingjiesheng.com"+$(this).find('a').attr('href')
			      		let titleY = ($(this).find('.item1>a').text().substring(4,$(this).find('.item1>a').text().length))
			      		let addressY = ($(this).find('.item1>a').text().substring(1,3))
			      		let createTimeY = ($(this).find('.cols2').text())
			      		//获取该工作的详细信息
			      		let result = await htmlInfo(urlY,titleY,addressY,createTimeY,typeAll)
			      		InternshipInfo.update({url: result.url}, {$set: result}, {upsert: true}) 
			      	}
			      })
			    });  
			    resolve(1);      		
        	}
        	
		})
	}catch(err){
		console.log("err===",err)
	}
}

//主函数
(async() => {

	try {
        await init();
        
    } catch (e) {
        console.log(e);
    }
    console.log("初始化完成");

    //开始爬取牛客网（上海实习） 
	for(let page = 1;page<10;page++){

		let urlC = "https://www.nowcoder.com/recommend-intern/list?token=&page="+page+"&address=%E4%B8%8A%E6%B5%B7&_=1496279558639"

		//爬取主页信息		
		console.log("爬取牛客>>",page)
		await jsGetInfo(page,urlC)
	}
	console.log("爬取牛客完毕")

	//开始爬取应届生求职网 

	for(let page = 1;page<10;page++){

		let urlC = "http://www.yingjiesheng.com/zhuanye/jisuanji/shanghai/list_"+page+".html"

		//爬取主页信息		
		console.log("爬取应届生求职网>>",page)
		await jsGetInfo(page,urlC)
	}
	console.log("爬取应届生求职网完毕")
})();




