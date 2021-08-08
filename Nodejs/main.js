var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
const https = require('https');

function templateHTML(title, list, body) {
    return `<!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      <a href="/create">create</a>
      <a href="/searchItem">Item search</a>
      ${body}
    </body>
  </html>
  `;
}

function templateList(filelist) {
    var list = '<ul>';
    var i = 0;

    while (i < filelist.length) {
        list = list + `<li><a href="/?id=${filelist[i]}"> ${filelist[i]} </a></li>`;
        i++;
    }

    list = list + '</ul>';
    return list;
}

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var title = queryData.id

    if (pathname === '/') {
        if (queryData.id === undefined) {
            fs.readdir('./data', function(error, filelist) {
                console.log(filelist);
                var title = 'Home';
                var description = 'Hello Here is my home';
                var list = templateList(filelist);
                var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);

                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readdir('./data', function(error, filelist) {
                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
                    console.log(filelist);
                    var title = queryData.id;
                    var list = templateList(filelist);
                    var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function(error, filelist) {
            var title = 'WEB - Create';
            var list = templateList(filelist);
            var template = templateHTML(title, list, `
            <form action="http://localhost:3000/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `);
            response.writeHead(200);
            response.end(template);
        });
    } else if (pathname === '/create_process') {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`./data/${title}`, qs.escape(description), 'utf8', function(err) {
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end();
            })
        });
    } else if (pathname === '/searchItem') {
        fs.readdir('./data', function(error, filelist) {
            var title = 'WEB - Search';
            var list = templateList(filelist);
            var template = templateHTML(title, list, `
            <form action="http://localhost:3000/cyphers" method="post">
              <p><input type="text" name="itemName" placeholder="itemName"></p>
              <p>
                <input type="submit">
              </p>
            </form>
          `);
            response.writeHead(200);
            response.end(template);
        });
    } else if (pathname === '/cyphers') {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.itemName;
            let url = `https://api.neople.co.kr/cy/battleitems?itemName=${qs.escape(title)}&wordType=<wordType>&limit=<limit>&q=characterId:<characterId>;slotCode:<slotCode>,rarityCode:<rarityCode>,seasonCode:<seasonCode>&apikey=FnaA38BJKLS69mQ9rDx6vEztIr8fbS3y`

            const rq = https.request(url, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data = data + chunk.toString();
                });

                response.on('end', () => {
                    const jsonData = JSON.parse(data);
                    console.log(jsonData);
                    const items = jsonData.rows;
                    console.log(items[0].itemName);

                    var itemName = items[0].itemName;
                    var description = items[0].characterName;
                    fs.writeFile(`./data/${itemName}`, description, 'utf-8', function(err) {
                        response.writeHead(302, { Location: `/?id=${title}` });
                        response.end();
                    })
                });
            });

            rq.on('error', (error) => {
                console.log(error);
            });
            rq.end();
        });
    } else {
        response.writeHead(404);
        response.end('Not Found');
    }
});
app.listen(3000);