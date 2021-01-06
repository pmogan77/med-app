const http = require('http');
const fs = require('fs');
const url = require('url');
var Excel = require('exceljs');
var workbook = new Excel.Workbook();

var PORT = process.env.PORT||3000;
const positiveScore =  5;
const negativeScore = 1;

function locate(word, worksheet){

      
      var rowNum = 2;
      var foundRow = -1;

      while(worksheet.getRow(rowNum).getCell(1).value!=null)
      {
            var data = worksheet.getRow(rowNum).getCell(1).value;

            if(data.toLowerCase()==word.toLowerCase())
            {
                  foundRow=rowNum;
                  break;
            }
            
            rowNum++;
      }

      return foundRow;

};

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
            if(pathName=='/generalInfo')
            {
                  let body = [];
                  req.on('data', chunk => {
                        body.push(chunk);
                  });
                  req.on('end', () => {
                        var symptoms = JSON.parse(body.toString());
                        var severityScores = [];
                        
                        workbook.xlsx.readFile('./data/Symptom-severity.xlsx').then(()=>{
                              var worksheet = workbook.worksheets[0];
                              
                              symptoms.forEach(element => {
                                    
                                    var rowNum = locate(element,workbook.worksheets[0]);

                                    var severity = worksheet.getRow(rowNum).values[2];

                                    if(severity==undefined||severity==null)
                                    {
                                          severity = -1;
                                    }

                                    severityScores.push(severity);
                              });

                              //console.log(severityScores); 
                              
                              var diseasePrediction = [];

                              workbook.xlsx.readFile('./data/dataset.xlsx').then(()=>{
                                    var worksheet = workbook.worksheets[0];

                                    var rowNum = 2;

                                    while(worksheet.getRow(rowNum).getCell(1).value!=null)
                                    {
                                          var row = worksheet.getRow(rowNum).values;

                                          var rowScore = 0;

                                          var length = row.length;

                                          for(var i = 2;i<length;i++)
                                          {

                                                if(symptoms.includes(row[i])||symptoms.includes(row[i].substring(1)))
                                                {
                                                      rowScore+=positiveScore;
                                                }
                                                else{
                                                      rowScore-=negativeScore;
                                                }
                                          }

                                          diseasePrediction.push({condition: row[1], score: rowScore});

                                          rowNum++;
                                    }
                                    
                                    diseasePrediction.sort(function(a,b){return b.score-a.score});

                                    diseasePrediction = diseasePrediction.filter((first, index, self) =>
                                          index === self.findIndex((second) => (
                                                //Note: EDIT SIMILARITY CONDITION AS NEEDED
                                                second.condition === first.condition && second.score === first.score
                                          ))
                                    )


                                    
                                    var result = {severityScores: severityScores, diseasePrediction: diseasePrediction};
      
                                    res.writeHead(200, {'Content-type': 'application/json'});
                                    res.end(JSON.stringify(result));
                              });
                        });

                        
                  });
            }
            else if(pathName=='/additionalInfo')
            {
                  let body = [];
                  req.on('data', chunk => {
                        body.push(chunk);
                  });
                  req.on('end', () => {
                        const condition = body.toString();

                        console.log(condition);

                        workbook.xlsx.readFile('./data/symptom_Description.xlsx').then(()=>{
                              var worksheet = workbook.worksheets[0];

                              var rowNum = locate(condition,worksheet);

                              var diseaseDesc = worksheet.getRow(rowNum).values[2];

                              if(diseaseDesc==null||diseaseDesc==undefined)
                              {
                                    diseaseDesc='no record on file';
                              }

                              workbook.xlsx.readFile('./data/symptom_precaution.xlsx').then(()=>{
                                    var worksheet = workbook.worksheets[0];
      
                                    var rowNum = locate(condition,worksheet);
      
                                    var list = worksheet.getRow(rowNum).values;

                                    var result = {diseaseDesc: diseaseDesc, precautions: list.splice(2)};

                                    console.log(result);
      
                                    res.writeHead(200, {'Content-type': 'application/json'});
                                    res.end(JSON.stringify(result));
                              });
                        });
                       
                  });
            }
            else if(pathName==='/'||pathName==='/index.html'||pathName==='/index')
            {

                  fs.readFile(startPath+'/index.html', 'utf-8', (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404'});
                              res.end();
                        }
                        
                        res.writeHead(200, {'Content-type': 'text'});
                        res.end(data);
                        
                  });
            }
            else if(pathName==='/misc_controls_orbit.html'||pathName==='/misc_controls_orbit')
            {
                  fs.readFile(startPath+'/misc_controls_orbit.html', 'utf-8', (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404'});
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
                              res.writeHead(404, {'Location': '404'});
                              res.end();
                        }
                        res.writeHead(200, {'Content-type': 'text/css'});
                        res.end(data);
                  });
            }

            else if((/\.(jpg|jpeg|png|gif)$/i).test(pathName))
            {
                  fs.readFile(startPath+pathName, (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404'});
                              res.end();
                        }
                        res.writeHead(200, {'Content-type': 'image/png'});
                        res.end(data);
                  });
            }
            else if(pathName==='/404.html'||pathName==='/404')
            {
                  fs.readFile(startPath+'/404.html', 'utf-8', (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404'});
                              res.end();
                        }
                        res.writeHead(200, {'Content-type': 'text/html'});
                        res.end(data);
                  });
            }
                  
            else if((/\.(js)$/i).test(pathName)&&pathName!='/server.js'){
                  fs.readFile(startPath+pathName, (err, data) => {
                        
                        if(err)
                        {
                              console.log(err);
                              res.writeHead(404, {'Location': '404'});
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
                              res.writeHead(404, {'Location': '404'});
                              res.end();
                        }
                        res.writeHead(200, {'Content-type': 'application/javascript'});
                        res.end(data);
                  });
            }
            else{
                  res.writeHead(302, {'Location': '404'});
                  res.end();
            }
      }
});


server.listen(PORT, () => {
      console.log("Listening for reqests on port 3000.");
});
