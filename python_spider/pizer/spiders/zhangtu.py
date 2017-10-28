# -*- coding: utf-8 -*-

from scrapy.spiders import Spider,CrawlSpider, Rule,Request
from scrapy.selector import Selector
from scrapy.http import Request
import scrapy

from pizer.items import ZhangTuItem
import sys
import chardet

reload(sys)
sys.setdefaultencoding('utf8')

cityArrary = [u"北京",u"天津",u"石家庄",u"唐山",u"秦皇岛",u"张家口",u"承德",u"廊坊",u"邯郸",u"邢台",u"保定",u"沧州",u"衡水",u"太原",u"大同",u"阳泉",u"晋城",u"朔州",u"忻州",u"离石",u"榆次",u"临汾",u"运城",u"长治",u"呼和浩特",u"包头",u"乌海",u"集宁",u"东胜",u"临河",u"阿拉善左旗",u"赤峰",u"通辽",u"锡林浩特",u"海拉尔",u"乌兰浩特",u"沈阳",u"大连",u"鞍山",u"抚顺",u"本溪",u"锦州",u"营口",u"阜新",u"盘锦",u"铁岭",u"朝阳",u"锦西",u"丹东",u"长春",u"吉林",u"四平",u"辽源",u"浑江",u"白城",u"延吉",u"通化",u"哈尔滨",u"鸡西",u"鹤岗",u"双鸭山",u"伊春",u"佳木斯",u"七台河",u"牡丹江",u"绥化",u"齐齐哈尔",u"大庆",u"黑河",u"加格达奇",u"上海",u"南京",u"无锡",u"徐州",u"常州",u"苏州",u"南通",u"连云港",u"淮阴",u"盐城",u"扬州",u"镇江",u"杭州",u"宁波",u"温州",u"嘉兴",u"湖州",u"绍兴",u"金华",u"衢州",u"舟山",u"丽水",u"临海",u"合肥",u"芜湖",u"蚌埠",u"淮南",u"马鞍山",u"淮北",u"铜陵",u"安庆",u"黄山",u"阜阳",u"宿州",u"滁州",u"六安",u"宣州",u"巢湖",u"贵池",u"福州",u"厦门",u"莆田",u"三明",u"泉州",u"漳州",u"南平",u"宁德",u"龙岩",u"南昌",u"景德镇",u"赣州",u"萍乡",u"九江",u"新余",u"鹰潭",u"宜春",u"上饶",u"吉安",u"临川",u"济南",u"青岛",u"淄博",u"枣庄",u"东营",u"烟台",u"潍坊",u"济宁",u"泰安",u"威海",u"日照",u"滨州",u"德州",u"聊城",u"临沂",u"菏泽",u"郑州",u"开封",u"洛阳",u"平顶山",u"安阳",u"鹤壁",u"新乡",u"焦作",u"濮阳",u"许昌",u"漯河",u"三门峡",u"商丘",u"周口",u"驻马店",u"南阳",u"信阳",u"武汉",u"黄石",u"十堰",u"沙市",u"宜昌",u"襄樊",u"鄂州",u"荆门",u"黄州",u"孝感",u"咸宁",u"江陵",u"恩施",u"长沙",u"衡阳",u"邵阳",u"郴州",u"永州",u"大庸",u"怀化",u"吉首",u"株洲",u"湘潭",u"岳阳",u"常德",u"益阳",u"娄底",u"广州",u"深圳",u"汕尾",u"惠州",u"河源",u"佛山",u"清远",u"东莞",u"珠海",u"江门",u"肇庆",u"中山",u"湛江",u"茂名",u"韶关",u"汕头",u"梅州",u"阳江",u"南宁",u"梧州",u"玉林",u"桂林",u"百色",u"河池",u"钦州",u"柳州",u"北海",u"海口",u"三亚",u"成都",u"康定",u"雅安",u"马尔康",u"自贡",u"重庆",u"南充",u"泸州",u"德阳",u"绵阳",u"遂宁",u"内江",u"乐山",u"宜宾",u"广元",u"达县",u"西昌",u"攀枝花",u"黔江土家族苗族自治县",u"贵阳",u"六盘水",u"铜仁",u"安顺",u"凯里",u"都匀",u"兴义",u"毕节",u"遵义",u"昆明",u"东川",u"曲靖",u"楚雄",u"玉溪",u"个旧",u"文山",u"思茅",u"昭通",u"景洪",u"大理",u"保山",u"潞西",u"丽江纳西族自治县",u"泸水",u"中甸",u"临沧",u"拉萨",u"昌都",u"乃东",u"日喀则",u"那曲",u"噶尔",u"林芝",u"西安",u"铜川",u"宝鸡",u"咸阳",u"渭南",u"汉中",u"安康",u"商州",u"延安",u"榆林",u"兰州",u"白银",u"金昌",u"天水",u"张掖",u"武威",u"定西",u"成县",u"平凉",u"西峰",u"临夏",u"夏河",u"嘉峪关",u"酒泉",u"西宁",u"平安",u"门源回族自治县",u"同仁",u"共和",u"玛沁",u"玉树",u"德令哈",u"银川",u"石嘴山",u"吴忠",u"固原",u"乌鲁木齐",u"克拉玛依",u"吐鲁番",u"哈密",u"昌吉",u"博乐",u"库尔勒",u"阿克苏",u"阿图什",u"喀什",u"伊宁",u"台北",u"基隆",u"台南",u"高雄",u"台中",u"辽阳",u"和田",u"泽当镇",u"八一镇",u"澳门",u"香港",u"北京市",u"天津市",u"河北省",u"山西省",u"内蒙古自治区",u"辽宁省",u"吉林省",u"黑龙江省",u"上海市",u"江苏省",u"浙江省",u"安徽省",u"福建省",u"江西省",u"山东省",u"河南省",u"湖北省",u"湖南省",u"广东省",u"广西壮族自治区",u"海南省",u"重庆市",u"四川省",u"贵州省",u"云南省",u"西藏自治区",u"陕西省",u"甘肃省",u"青海省",u"宁夏回族自治区",u"新疆维吾尔自治区",u"台湾省",u"香港特别行政区",u"澳门特别行政区"]

class ZhangtuSpider(Spider):
	name = 'zhangtu'
	allowed_domains = ['http://www.zhangtu.com/']
	# start_urls = [u'http://www.zhangtu.com/searchresult?keyword='+cityArrary[cityNum]+'&p=%d' % d for d in range(1,20)]
	# start_urls = [];
	# for cityNum in range(1,len(cityArrary)):
	# 		for d in range(1,20):
	# 			start_urls.append('http://www.zhangtu.com/searchresult?keyword='+cityArrary[cityNum]+'&p='+str(d))
	# def __init__(self) :
		
	# 	for cityNum in range(1,len(cityArrary)):
	# 		for d in range(1,20):
	# 			start_urls.append('http://www.zhangtu.com/searchresult?keyword='+cityArrary[cityNum]+'&p='+str(d))

	def start_requests(self) :
		for cityNum in range(1,len(cityArrary)):
			for d in range(1,20):
				self.cityz = cityArrary[cityNum]
				yield Request(url = 'http://www.zhangtu.com/searchresult?keyword='+cityArrary[cityNum]+'&p='+str(d),callback=self.parse)

	def parse(self, response):
		zhangTuItems=[]
		sel=Selector(response)
		sites=sel.xpath('//ul[@class="scenic-card-list"]/li')
		for site in sites:
			zhangTuItem = ZhangTuItem()
			zhangTuItem['img']= site.xpath('.//div[@class="thumb"]/img[@src]/@src').extract()[0]
			zhangTuItem['city']= self.cityz
			zhangTuItem['url']= u'http://www.zhangtu.com' + site.xpath('.//a[@href]/@href').extract()[0]
			zhangTuItem['title']= site.xpath('.//div[@class="title"]/text()').extract()[0].replace(u'\xa0', u' ').replace(u'                    ',u'')

			items = site.xpath('.//div[@class="info-item"]')
			
			for d in range(0,len(items)):	
				label = items[d].xpath('.//label/text()').extract()
				p = items[d].xpath('.//p/text()').extract()	
 
				if u'门票' in label[0]:
					s1 = p[0].replace(u'\xa0', u' ').replace(u'                    ',u'')
					bar = s1[7:len(s1)]

					zhangTuItem['ticket'] = s1
				if u'景点' in label[0]:
					s2 = p[0].replace(u'\xa0', u' ').replace(u'                    ',u'')
					bar = s2[7:len(s2)]

					zhangTuItem['scenicSpot'] = s2
				if u'地点' in label[0]:
					s3 = p[0].replace(u'\xa0', u' ').replace(u'                    ',u'')
					bar = s3[7:len(s3)]
					zhangTuItem['location'] = s3
			zhangTuItems.append(zhangTuItem)
		return zhangTuItems
			# file_object = open('data.txt', 'w')
			# file_object.writelines(str(zhangTuItems).replace('                    ',''))
			# file_object.close( )

		

