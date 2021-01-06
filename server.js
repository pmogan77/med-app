const http = require('http');
const fs = require('fs');
const url = require('url');

var PORT = process.env.PORT||3000;


const server = http.createServer((req,res) => {
      const pathName = url.parse(req.url,true).pathname;
      const queries = url.parse(req.url,true).query;

      const startPath = `${__dirname}`;

      if(req.method==='POST'){
            
                  
      }

      else if(req.method==='PUT')
      {
        
      }
      else if(req.method==='DELETE')
        {
        
        
        
      }

      else{
            if(pathName==='/'||pathName==='/index.html'||pathName==='/index')
            {

                  fs.readFile(`${__dirname}/index.html`, 'utf-8', (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404.html'});
                              res.end();
                        }
                        
                        res.writeHead(200, {'Content-type': 'text'});
                        res.end(data);
                        
                  });
            }
            else if((/\.(css)$/i).test(pathName))
            {
                  fs.readFile(startPath+pathName, 'utf-8', (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404.html'});
                              res.end();
                        }
                        res.writeHead(200, {'Content-type': 'text/css'});
                        res.end(data);
                  });
            }

            else if((/\.(jpg|jpeg|png|gif)$/i).test(pathName))
            {
                  fs.readFile(__dirname+pathName, (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404.html'});
                              res.end();
                        }
                        res.writeHead(200, {'Content-type': 'image/png'});
                        res.end(data);
                  });
            }
            else if(pathName==='/404.html'||pathName==='/404')
            {
                  fs.readFile(`${__dirname}/404.html`, 'utf-8', (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404.html'});
                              res.end();
                        }
                        res.writeHead(200, {'Content-type': 'text/html'});
                        res.end(data);
                  });
            }
                  
            else if((/\.(js)$/i).test(pathName)){
                  fs.readFile(__dirname+pathName, (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404.html'});
                              res.end();
                        }
                        res.writeHead(200, {'Content-type': 'application/javascript'});
                        res.end(data);
                  });
            }
            else if((/\.(bin)$/i).test(pathName)||(/\.(gltf)$/i).test(pathName)||(/\.(glb)$/i).test(pathName)){
                  fs.readFile('./'+pathName, (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404.html'});
                              res.end();
                        }
                        res.writeHead(200, {'Content-type': 'application/javascript'});
                        res.end(data);
                  });
            }
            else{
                  res.writeHead(302, {'Location': '404.html'});
                  res.end();
            }
      }
});


server.listen(PORT, () => {
      console.log("Listening for reqests on port 3000.");
});
