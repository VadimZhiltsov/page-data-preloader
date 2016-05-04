'use strict';

import jsdom from 'jsdom';
import fs from 'fs';
import url from 'url';
import http from 'http';
import Parser from './parser/parser';
import minimist from 'minimist';

var argv = minimist(process.argv.slice(2));

const port = argv.port || '8080';
const jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.js", "utf-8");

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
			error: e.toString()
		});
	}

	let parser = new Parser(content);

	let data = parser.data;


	respondJSON(res, 200, data);

}).listen(port);


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
			} else {
				resolve(window);
			}
		}
	});
  });
}
