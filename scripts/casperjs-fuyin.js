var casper = require("casper").create({
    verbose: true
});

// 保存所有专辑URL，如 http://mp3.fuyin.tv/index.php/content/view/movid/2380/
var links = [];

var currentLink = 0;

// 添加某专辑页面上所有讲道MP3链接
function addLinks(link) {
    this.then(function() {
        var found = this.evaluate(searchLinks);
        var information = this.evaluate(getInformation);
        information.items = found;
        console.log(JSON.stringify(information));
    });
}

// 取专辑名，讲员，出处
function getInformation() {
    var information = {};
    information.name = document.querySelector('span.h18').textContent;

    var filter, map;
    filter = Array.prototype.filter;
    map = Array.prototype.map;
    var liArray = map.call(filter.call(document.querySelectorAll("li[style='border-bottom:1px  dotted #CCCCCC;']"), function(a) {
        return true;
    }), function(a) {
        return a.textContent;
    });

    for(var i=0; i<liArray.length; i++) {
        var matchSpeaker = liArray[i].match(/^\[讲员\]:\s+(.*)$/);
        if(matchSpeaker) {
            information.speaker = matchSpeaker[1];
        }

        var matchSource = liArray[i].match(/^\[出处\]:\s+(.*)$/);
        if(matchSource) {
            information.source = matchSource[1];
        }
    }

    return information;
}

// 寻找讲道MP3链接
function searchLinks() {
    var filter, map;
    filter = Array.prototype.filter;
    map = Array.prototype.map;
    return map.call(filter.call(document.querySelectorAll("a"), function(a) {
        return (/.*mp3$/i).test(a.getAttribute("href"));
    }), function(a) {
        return a.getAttribute("href");
    });
}

// 获取所有专辑URL，保存到links
function getAllLinks() {
    this.then(function() {
        var found = this.evaluate(searchAllLinks);
        links = links.concat(found);
    });
}

// 查找专辑URL
function searchAllLinks() {
    var filter, map;
    filter = Array.prototype.filter;
    map = Array.prototype.map;
    return map.call(filter.call(document.querySelectorAll("a"), function(a) {
        return (/\/index.php\/content\/view\/movid/i).test(a.getAttribute("href"));
    }), function(a) {
        return a.getAttribute("href");
    });
}

// Just opens the page and prints the title
function start(link) {
    this.start(link, function() {
    });
}

// As long as it has a next link, and is under the maximum limit, will keep running
function check() {
    if (links.length === 0) {
        start.call(this, 'http://mp3.fuyin.tv/index.php/content/');
        getAllLinks.call(this);
        this.run(check);
    } else if (links[currentLink]) {
        start.call(this, 'http://mp3.fuyin.tv' + links[currentLink]);
        addLinks.call(this, links[currentLink]);
        currentLink++;
        this.run(check);
    } else {
        this.exit();
    }
}

casper.start().then(function() {
});

casper.run(check);