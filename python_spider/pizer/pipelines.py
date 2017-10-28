# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

import json
import sys 
from pymongo import MongoClient
reload(sys)
sys.setdefaultencoding('utf8')  

class JsonWriterPipeline(object):

	def __init__(self):
		client = MongoClient('mongodb://chuxiaoyu:cxy19931006@115.159.92.249:27017/jiajiaTeam?authMechanism=SCRAM-SHA-1')
		db_name = 'jiajiaTeam'
		db = client[db_name]
		self.collection_pythonCrawle = db['pythonCrawle']
	def process_item(self, item, spider):
		item = dict(item)

		# self.collection_pythonCrawle.insert(item)
		# self.collection_pythonCrawle.update({"title":item.get('title')},{"$set":item}, upsert=True)
		self.collection_pythonCrawle.update({"title":item.get('title')},{"$set":{
			"city" : item.get('city') if item.get('city') != None else "",
		    "img" : item.get('img') if item.get('img') != None else "",
		    "title" : item.get('title') if item.get('title') != None else "",
		    "url" : item.get('url') if item.get('url') != None else "",
		    "scenicSpot" : item.get('scenicSpot') if item.get('scenicSpot') != None else "",
		    "location" : item.get('location') if item.get('location') != None else "",
		    "ticket" : item.get('ticket') if item.get('ticket') != None else ""
		}}, upsert=True)
		return item