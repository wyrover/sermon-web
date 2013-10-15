#-*-coding:utf-8-*- 
from bs4 import BeautifulSoup 
import urllib.request
import re 
import sqlite3
import uuid
import sys

conn = sqlite3.connect('sermon.sqlite')
cursor = conn.cursor()

def processPage(url,title):

	match = re.compile(r'^/content/view/movid/(\d+)').match(url)
	id = match.group(1)

	detailPage = urllib.request.urlopen('http://mp3.fuyin.tv/index.php/content/downurl/movid/'+id)
	data = detailPage.read().decode('gbk').encode('utf8')

	match = re.compile(r'^document.write\(\'(.*)\'\)').match(data)
	content = match.group(1).replace('\\\"','')

	downurlSoup = BeautifulSoup(content)

	downUrls = downurlSoup.find_all('a')

	subPage = urllib2.urlopen('http://mp3.fuyin.tv'+url)
	subSoup = BeautifulSoup(subPage)  
	headers = subSoup.findAll('li',{'style' : 'border-bottom:1px  dotted #CCCCCC;'})

	organization = ''
	paster = ''
	area = ''
	category = ''

	for header in headers:

		if organization == '':
			match = re.compile(r'\[导演\]:  (.*)').match(unicode(header.string))
			if match != None:
				organization = match.group(1)
				continue

		if paster == '':
			match = re.compile(r'\[主演\]:  (.*)').match(unicode(header.string))
			if match != None:
				paster = match.group(1)
				continue

		if category == '':

			if header.a != None:
				category = header.a.string.strip()
				continue

		if area == '':
			match = re.compile(r'\[地区\]:  (.*)').match(unicode(header.string))
			if match != None:
				area = match.group(1)
				break

	if any(category in s for s in [u'福音电影',u'宋大叔教音乐',u'圣乐教室',u'福音写真',u'野地百合',u'诗歌MTV',u'向生命致敬系列',u'音乐崇拜',u'赞美敬拜',u'请听我说',u'耶希亚',u'福音见证',u'科学信仰']):
		status = 0
	else:
		status = 1

	if paster==category:
		category = ''

	if u'于宏' in category:
		category = u'于宏洁'

	paster = paster.replace(u'牧师','').replace(u'博士','').replace(u'长老','').replace(u'老师','')

	#title = title.replace(paster % u'牧师' , paster).replace(paster % u'长老' , paster).replace(paster % u'博士' , paster).replace(paster % u'弟兄' , paster).replace(paster % u'老师' , paster).replace(paster ,'').replace(u'-','')

	if paster == u'远':
		paster = u'远志明'
	elif paster==u'张':
		paster = u'张伯笠'
	elif paster==u'唐':
		paster = u'唐崇荣'


	cursor.execute("insert into organization(name,description,status) values(?,?,?)",(organization,'',status))
	conn.commit()




	cursor.execute("insert into paster(name,description,status,imageUrl) values(?,?,?,'')",(paster,'',status))
	conn.commit()



	cursor.execute("insert into category(name,status) values(?,?) ",(category,status))
	conn.commit()

	cursor.execute("insert into sermonSeries(id,name,count,category,paster,organization,description,status) values(?,?,?,?,?,?,'',?)",(str(uuid.uuid1()),title,len(downUrls),category,paster,organization,status))
	conn.commit()


	cursor.execute("select id from sermonSeries where name=? and paster=?",(title,paster))
	seriesId = cursor.fetchone()[0]


	for downUrl in downUrls:
		print(downUrl['href'])
		url = downUrl['href']

		url = url[:url.find('?')]
		match = re.compile(r'.*/(.*)\.mp3.*').match(downUrl['href'])
		sermonName = match.group(1)
		#sermonName = sermonName.replace(paster % u'牧师' , paster).replace(paster % u'长老' , paster).replace(paster % u'博士' , paster).replace(paster % u'弟兄' , paster).replace(paster % u'老师' , paster).replace(paster ,'').replace(u'-','')


		cursor.execute("insert into sermon(id,name,seriesId,url,status) values(?,?,?,?,?)",(str(uuid.uuid1()),sermonName,seriesId,url,status))
		conn.commit()

	print('----------')
	print(organization)
	print(paster)
	print(category)
	print(area)

page = urllib.request.urlopen('http://mp3.fuyin.tv/index.php/content/')
soup = BeautifulSoup(page)  
aArray = soup.find_all('a',href=re.compile(r"^/content/view"))  
for a in aArray :
	print(a['href'])
	print(a.string)

	try:
		processPage(a['href'],a.string)
	except :
		pass

cursor.close()
conn.close()

