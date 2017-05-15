var http = require('https');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

// var phantom = require('phantom');
// console.log("opened google? ");
// phantom.create(function(ph) {
//   return ph.createPage(function(page) {
//     return page.open("http://www.google.com", function(status) {
//       console.log("opened google? ", status);
//       return page.evaluate((function() {
//         return document.title;
//       }), function(result) {
//         console.log('Page title is ' + result);
//         return ph.exit();
//       });
//     });
//   });
// });


var url = "http://www.mafengwo.cn/i/6896180.html#replylist"; 
var urlD = "http://www.mafengwo.cn/note/__pagelet__/pagelet/bottomReplyApi?callback=jQuery18105397269231275077_1494576143559&params=%7B%22iid%22%3A%226896180%22%2C%22page%22%3A%221%22%7D&_=1494576143681"; 

var ss = "https://www.zhihu.com/search?type=content&q=%E6%B1%82%E8%81%8C%E5%B9%B2%E8%B4%A7";

var title = [];
var content = [];
var image = [];
var contentListss = [];
var comment = [];
var info = [];
var htmlR = "";


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
        // console.log(chunk) 
            html += chunk;
        });
    	//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {

          //解码代码
          // var iconv=require('iconv-lite');
          // // var a = htmlR;
          // // a=a.replace(/%([a-zA-Z0-9]{2})/g,function(_,code){
          // //     return String.fromCharCode(parseInt(code,16));
          // // });
          // var buff=new Buffer(htmlR,'binary');
          // var result=iconv.decode(buff,'gbk');
          // console.log("result====",result);
             
	         var $ = cheerio.load(html); //采用cheerio模块解析html

            $('.item, .clearfix').each(function(i,ele){

                if( $(this).find('.title').text() != "" ){
                    info.push({
                      "title" : $(this).find('.title').text(),
                      "content" : $(this).find('.summary').text(),
                      "url" : $(this).find('.summary').find('.toggle-expand, .inline').attr('href')
                    })
                }
            });
           
            
            //控制刷新的页数
            for(let x = 0; x< 10; x++){
              var urlZhiHu = "https://www.zhihu.com/r/search?q=%E6%B1%82%E8%81%8C%E5%B9%B2%E8%B4%A7&correction=0&type=content&offset="+10*(0+1);
              http.get(urlZhiHu, function (res) {     
                var html = '';        //用来存储请求网页的整个html内容
                var titles = [];        
                res.setEncoding('utf-8'); //防止中文乱码

               //监听data事件，每次取一块数据
                res.on('data', function (chunk) {  
                // console.log(chunk) 
                    html += chunk;
                });
              //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
                res.on('end', function () {
                  fs.writeFile('./bobo'+x+'.json', html , function (err) {
                      if (err) throw err;
                      console.log("write Success!");
                  });  
                  
                  if(html != ""){
                  
                    for(let s=0;s<JSON.parse(html).htmls.length;s++){
                        htmlR = htmlR+JSON.parse(html).htmls[s]
                        // console.log(htmlR)
                    } 
                    // console.log(htmlR)
                    fs.writeFile('./bobo'+x+'.html', htmlR , function (err) {
                        if (err) throw err;
                        console.log("write Success!");
                    });  

                    var $ = cheerio.load(htmlR);

                    $('.item, .clearfix').each(function(i,ele){
                      var urlInfo;

                      if( $(this).find('.title').text() != "" ){
                          if($(this).find('.summary').find('.toggle-expand, .inline').attr('href') == undefined){
                              urlInfo = "https://www.zhihu.com";
                          }else{
                            if($(this).find('.summary').find('.toggle-expand, .inline').attr('href').indexOf("https://www.zhihu.com") == -1){
                              urlInfo = "https://www.zhihu.com"+$(this).find('.summary').find('.toggle-expand, .inline').attr('href')
                            }else{
                              urlInfo = $(this).find('.summary').find('.toggle-expand, .inline').attr('href')
                            }                            
                          }

                          info.push({
                            "title" : $(this).find('.title').text(),
                            "content" : $(this).find('.summary').text(),
                            "url" : urlInfo
                          })
                          // console.log(info)
                          fs.writeFile('./info.json', JSON.stringify(info) , function (err) {
                              if (err) throw err;
                              console.log("write Success!");
                          });  
                      }
                    })   
                  }

                })
              })

            }

        });

    }).on('error', function (err) {
        console.log(err);
    });

}
