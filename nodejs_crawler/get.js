var http = require('https');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var url = "http://www.mafengwo.cn/i/6896180.html#replylist"; 
var urlD = "http://www.mafengwo.cn/note/__pagelet__/pagelet/bottomReplyApi?callback=jQuery18105397269231275077_1494576143559&params=%7B%22iid%22%3A%226896180%22%2C%22page%22%3A%221%22%7D&_=1494576143681"; 
var urlZhiHu = "https://www.zhihu.com/search?type=content&q=求职干货";
var ss = "https://www.zhihu.com/search?type=content&q=%E6%B1%82%E8%81%8C%E5%B9%B2%E8%B4%A7";

var title = [];
var content = [];
var image = [];
var contentListss = [];
var comment = [];
var info = [];


//开始爬取
startRequest(ss)
                    
function startRequest(x) {

    //采用http模块向服务器发起一次get请求      
    http.get(x, function (res) {     
        var html = '';        //用来存储请求网页的整个html内容
        var titles = [];        
        res.setEncoding('utf-8'); //防止中文乱码

  	   //监听data事件，每次取一块数据
        res.on('data', function (chunk) {   
            html += chunk;
        });
    	//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
        	// console.log(html)
          fs.writeFile('./lala.txt', html , function (err) {
              if (err) throw err;
              console.log("write Success!");
          });
	         var $ = cheerio.load(html); //采用cheerio模块解析html

           $('.item, .clearfix').each(function(i,ele){
              // $('.toggle-expand, .inline').onclick();   //获取元素div

              if( $(this).find('.title').text() != "" ){
                  info.push({
                    "title" : $(this).find('.title').text(),
                    "content" : $(this).find('.summary').text(),
                    "url" : $(this).find('.summary').find('.toggle-expand, .inline').attr('href')
                  })
              }

           });
           console.log(info,info.length)
        });

    }).on('error', function (err) {
        console.log(err);
    });

}
