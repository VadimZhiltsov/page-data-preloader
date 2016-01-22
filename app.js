'use strict';

const jsdom = require("jsdom");
const fs = require("fs");
const jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.js", "utf-8");
const url = require('url');
const http = require('http');
const Iconv = require('iconv').Iconv;
const charsetRegex = /charset=(\S+)$/;
const log = console.log;

http.createServer(async function(req, res) {

	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;
	if(!query.url) {
		return respondJSON(res, 400, {
			error: "URL has to be provided"
		});
	}

	try{
		var content = await getPageContent(query.url);
	} catch(e) {
		respondJSON(res, 400, {
			error: e
		});
	}

	let data = parse(content, query);

	respondJSON(res, 200, data);

}).listen(8080);


function respondJSON(res, status, data) {
	res.writeHead(status, { 
		'Content-Type': 'application/json;charset=utf-8	', 
		'Access-Control-Allow-Origin':'*' 
	});
	res.write(JSON.stringify(data));
	res.end();
}

function getPageContent (url) {
  return new Promise(function(resolve, reject){
	jsdom.env({
		url: url,
		src: [jquery],
		done(err, window) {
			
			if(err) {
			   	reject(err);
			}

			resolve(window);			
		}
	});
  });
}


function parse(window, query) {

	let $ = window.$;

	const charsetStr = $('meta[http-equiv="content-type"]').attr('content');
	const charsetFindings = charsetRegex.exec(charsetStr);
	const encoding = charsetFindings && charsetFindings.length ? charsetFindings[1] : 'utf-8';
	const translator = new Iconv(encoding,'utf-8');

    let description = translator.convert($('meta[name="description"]').attr('content')).toString();
    let img = $('meta[property="og:image"]').text();
    let title = translator.convert($('title').text()).toString();

    if(!img) {
    	img = $('img[rel="image_src"]').attr('src');
    }
    if(!img) {	
    	img = $('link[rel="shortcut icon"]').attr('href');
    }
    if(!img) {	
    	img = $('link[rel="image_src"]').attr('href');
    }
    if(!img) {
    	img = $('link[rel="icon"]').attr('href');
    }

    if(typeof img === 'string' && img.indexOf('http') !== 0) {
    	if(img[img.length -1] !== '/'){
    		img = query.url + '/' + img;
    	} else {
    		img = query.url + img;
    	}
    	
    }
    
    return {
    	description: description,
    	img: img,
    	title: title
    }
}