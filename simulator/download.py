import urllib.request
opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')]
urllib.request.install_opener(opener)
urllib.request.urlretrieve('https://pbs.twimg.com/profile_images/1458925506041208846/BpxvM2Qo_400x400.jpg', 'img/beluga.jpg')
urllib.request.urlretrieve('https://pbs.twimg.com/media/FEs2nZ6XsAEfB8T.jpg', 'img/hecker.jpg')
