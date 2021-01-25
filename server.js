const express = require('express');
const app = express();
const fs = require("fs");
const url = require("url");
var Excel = require("exceljs");
var workbook = new Excel.Workbook();
const diff = require('dialogflow-fulfillment');

var PORT = process.env.PORT || 3000;
const positiveScore = 5;
const negativeScore = 1;
const chatPredSize = 3;

function locate(word, worksheet) {
      var rowNum = 2;
      var foundRow = -1;

      while (worksheet.getRow(rowNum).getCell(1).value != null) {
            var data = worksheet.getRow(rowNum).getCell(1).value;

            if (data.toLowerCase() == word.toLowerCase()) {
                  foundRow = rowNum;
                  break;
            }

            rowNum++;
      }

      return foundRow;
}

function check(x) {
      return x.every((i) => typeof i === "string");
}

// const pathName = url.parse(req.url, true).pathname;
// const queries = url.parse(req.url, true).query;

const startPath = `${__dirname}`;

app.post('/', express.json(), (req,res)=>{
      const agent = new diff.WebhookClient({
            request:req,
            response:res
      });

      function convertArray(array)
      {
            if(array.length==2)
            {
                  return (array[0]+" and "+array[1]).toString();
            }
            else{

                  var result = "";

                  for (let i = 0; i < array.length; i++) {
                        const element = array[i];
                        if(i==array.length-1)
                        {
                              result+=("and "+element); 
                        }
                        else
                        {
                             result+=(element+", "); 
                        }
                  }

                  return result;
            }
      }

      function noSeverityData(array)
      {
            for (let i = 0; i < array.length; i++) {
                  const element = array[i];
                  if(element!=-1)
                  {
                        return false;
                  }
            }

            return true;
      }

      async function information(agent){

            await workbook.xlsx.readFile("./data/symptom_Description.xlsx")
            var condition = req.body.queryResult.parameters.disease;

            var worksheet = workbook.worksheets[0];

            var rowNum = locate(condition, worksheet);

            var diseaseDesc = worksheet.getRow(rowNum).values[2];

            if (diseaseDesc == null || diseaseDesc == undefined) {
                  diseaseDesc = "No record on file for "+condition+".";
            }

            console.log(diseaseDesc);
            
            agent.add(diseaseDesc);
      }

      async function precaution(agent){
          
            var condition = req.body.queryResult.parameters.disease;

            await workbook.xlsx.readFile("./data/symptom_precaution.xlsx")
            var worksheet = workbook.worksheets[0];

            var rowNum = locate(condition, worksheet);

            if(rowNum==-1)
            {
                  agent.add("No Disease precaution information found for "+condition+".");
            }

            var list = worksheet.getRow(rowNum).values.slice(2).map(element => element.toLowerCase());

            var output = "";

            if(list.length==1)
            {
                  output = "The main precaution for "+condition+" is to "+list[0]+".";
            }
            else{
                  output = "Precautions for "+condition+" are to "+convertArray(list)+".";
            }
            
            agent.add(output);
            
      }

      async function predict(agent){
            var symptoms = req.body.queryResult.parameters.symptoms.map(el=>el.replace(/ /g,"_"));

            var diseasePrediction = [];

            await workbook.xlsx.readFile("./data/dataset.xlsx");
            var worksheet = workbook.worksheets[0];

            var rowNum = 2;

            while (worksheet.getRow(rowNum).getCell(1).value != null) {
                  var row = worksheet.getRow(rowNum).values;

                  var rowScore = 0;

                  var length = row.length;

                  for (var i = 2; i < length; i++) {
                        if (symptoms.includes(row[i]) ||symptoms.includes(row[i].substring(1))) {
                              rowScore += positiveScore;
                        } else {
                              rowScore -= negativeScore;
                        }
                  }

                  diseasePrediction.push({ condition: row[1], score: rowScore });

                  rowNum++;
            }

            diseasePrediction.sort(function (a, b) {
                  return b.score - a.score;
            });

            diseasePrediction = diseasePrediction.filter(
                  (first, index, self) =>
                        index ===
                        self.findIndex(
                              (second) =>
                                    //Note: EDIT SIMILARITY CONDITION AS NEEDED
                                    second.condition === first.condition
                        )
            );
            
            var items = diseasePrediction.slice(0, chatPredSize).map(el => el.condition);
            var accuracy = diseasePrediction.slice(0, chatPredSize).map(el => el.score);
            
            var output = "The top " +chatPredSize+" diseases which best match your symptoms are "+convertArray(items)+". Our respective score for each is "+convertArray(accuracy)+".";

            agent.add(output);
      }

      async function severity(agent){

            var symptoms = req.body.queryResult.parameters.symptoms.map(el=>el.replace(/ /g,"_"));
            
            var severityScores = [];

            await workbook.xlsx.readFile("./data/Symptom-severity.xlsx");
            var worksheet = workbook.worksheets[0];

            symptoms.forEach((element) => {
                  var rowNum = locate(element, workbook.worksheets[0]);

                  var severity = worksheet.getRow(rowNum).values[2];

                  if (severity == undefined || severity == null) {
                        severity = -1;
                  }

                  severityScores.push(severity);
            });

            var output = "";

            if(severityScores.length==0||noSeverityData(severityScores))
            {
                  output = "There is no data for any of the symptoms mentioned."
            }
            else 
            {
                  var havedataNames = [];
                  var havedataSeverity = [];
                  var nodata = [];

                  for(var i =0;i<severityScores.length;i++)
                  {
                        if(severityScores[i]!=-1)
                        {
                              havedataNames.push(symptoms[i]);
                              havedataSeverity.push(severityScores[i]);
                        }
                        else{
                              nodata.push(symptoms[i]);
                        }
                  }

                  var result = "";

                  if(nodata.length==0)
                  {

                  }
                  else if(nodata.length==1)
                  {
                        result+="There is no data for "+nodata[0]+". ";
                  }
                  else{
                        result+="There is no data for "+convertArray(nodata)+". ";
                  }

                  if(havedataNames.length==1)
                  {
                        result+="The severity of "+havedataNames[0]+" is "+havedataSeverity[0]+"."
                  }
                  else if(havedataNames.length>1){
                        result+="The severity of "+convertArray(havedataNames)+" is "+convertArray(havedataSeverity)+", respectively."
                  }
                  output = result;
            }

            agent.add(output);
      }

      function demo(agent){
            agent.add("webhook success");
      }

      var intentMap = new Map();

      intentMap.set('Disease Information', information);
      intentMap.set('Disease Prediction', predict);
      intentMap.set('Disease Precautions', precaution);
      intentMap.set('Symptom Severity', severity);

      agent.handleRequest(intentMap);  
})

app.put('*', (req,res)=>{
      res.end('No put pathway created.');  
})

app.delete('*', (req,res)=>{
      res.end('No put pathway created.');  
})

app.get('/generalInfo', (req,res)=>{
      let body = [];
      req.on("data", (chunk) => {
            body.push(chunk);
      });
      req.on("end", () => {
            var symptoms;

            if(body.length==0)
            {
                  res.statusCode = 404;
                  res.end("No Body Attached or Incorrect Format."); 
            }
            else
            {
                  try {
                        if(body.length>0)
                        {
                              symptoms = JSON.parse(body.toString());
                        }
                        else{
                              res.statusCode = 404;
                              res.end("No Body Attached or Incorrect Format.");
                        }
                  } catch (err) {
                        console.log(err);
                        res.statusCode = 404;
                        res.end("No Body Attached or Incorrect Format.");
                  }

                  if (!Array.isArray(symptoms) || !symptoms || !check(symptoms)) {
                        res.end("All elements must be a string.");
                  }

                  try {
                        var severityScores = [];

                        workbook.xlsx.readFile("./data/Symptom-severity.xlsx").then(() => {
                              var worksheet = workbook.worksheets[0];

                              symptoms.forEach((element) => {
                                    var rowNum = locate(element, workbook.worksheets[0]);
                                    if(rowNum==-1){
                                          rowNum = locate(element.substring(1), workbook.worksheets[0]);
                                    }

                                    var severity = worksheet.getRow(rowNum).values[2];

                                    if (severity == undefined || severity == null) {
                                          severity = -1;
                                    }

                                    severityScores.push(severity);
                              });

                              //console.log(severityScores);

                              var diseasePrediction = [];

                              workbook.xlsx.readFile("./data/dataset.xlsx").then(() => {
                                    var worksheet = workbook.worksheets[0];

                                    var rowNum = 2;

                                    while (worksheet.getRow(rowNum).getCell(1).value != null) {
                                          var row = worksheet.getRow(rowNum).values;

                                          var rowScore = 0;

                                          var length = row.length;

                                          for (var i = 2; i < length; i++) {
                                                if (
                                                      symptoms.includes(row[i]) ||
                                                      symptoms.includes(row[i].substring(1))
                                                ) {
                                                      rowScore += positiveScore;
                                                } else {
                                                      rowScore -= negativeScore;
                                                }
                                          }

                                          diseasePrediction.push({ condition: row[1], score: rowScore });

                                          rowNum++;
                                    }

                                    diseasePrediction.sort(function (a, b) {
                                          return b.score - a.score;
                                    });

                                    diseasePrediction = diseasePrediction.filter(
                                          (first, index, self) =>
                                                index ===
                                                self.findIndex(
                                                      (second) =>
                                                            //Note: EDIT SIMILARITY CONDITION AS NEEDED
                                                            second.condition === first.condition &&
                                                            second.score === first.score
                                                )
                                    );

                                    var result = {
                                          severityScores: severityScores,
                                          diseasePrediction: diseasePrediction,
                                    };

                                    res.writeHead(200, { "Content-type": "application/json" });
                                    res.end(JSON.stringify(result));
                              });
                        });
                  } catch (err) {
                        console.log("broken");
                        console.log(err);
                        res.statusCode = 404;
                        res.end("An error occured while processing your request.");
                  }
            }
      });
})

app.get('/additionalInfo', (req,res)=>{
      let body = [];
      req.on("data", (chunk) => {
            body.push(chunk);
      });
      req.on("end", () => {
            const condition = body.toString();

            console.log(condition);

            workbook.xlsx.readFile("./data/symptom_Description.xlsx").then(() => {
                  var worksheet = workbook.worksheets[0];

                  var rowNum = locate(condition, worksheet);

                  var diseaseDesc = worksheet.getRow(rowNum).values[2];

                  if (diseaseDesc == null || diseaseDesc == undefined) {
                        diseaseDesc = "no record on file";
                  }

                  workbook.xlsx.readFile("./data/symptom_precaution.xlsx").then(() => {
                        var worksheet = workbook.worksheets[0];

                        var rowNum = locate(condition, worksheet);

                        var list = worksheet.getRow(rowNum).values;

                        var result = {
                              diseaseDesc: diseaseDesc,
                              precautions: list.splice(2),
                        };

                        console.log(result);

                        res.writeHead(200, { "Content-type": "application/json" });
                        res.end(JSON.stringify(result));
                  });
            });
      });
})

app.get('/symptomDescriptionData',(req,res)=>{
      var tableData = [];

      workbook.xlsx.readFile("./data/symptom_Description.xlsx").then(() => {
            var worksheet = workbook.worksheets[0];

            var rowNum = 2;

            while (worksheet.getRow(rowNum).getCell(1).value != null) {
                  var row = worksheet.getRow(rowNum).values.splice(1);

                  tableData.push(row);

                  rowNum++;
            }

            res.writeHead(200, { "Content-type": "application/json" });
            res.end(JSON.stringify(tableData));

      });
})

app.get('/symptomPrecautionData',(req,res)=>{
      var tableData = [];

      workbook.xlsx.readFile("./data/symptom_precaution.xlsx").then(() => {
            var worksheet = workbook.worksheets[0];

            var rowNum = 2;

            while (worksheet.getRow(rowNum).getCell(1).value != null) {
                  var row = worksheet.getRow(rowNum).values.splice(1);

                  tableData.push(row);

                  rowNum++;
            }

            res.writeHead(200, { "Content-type": "application/json" });
            res.end(JSON.stringify(tableData));

      });
})

app.get('/symptomSeverityData',(req,res)=>{
      var tableData = [];

      workbook.xlsx.readFile("./data/Symptom-severity.xlsx").then(() => {
            var worksheet = workbook.worksheets[0];

            var rowNum = 2;

            while (worksheet.getRow(rowNum).getCell(1).value != null) {
                  var row = worksheet.getRow(rowNum).values.splice(1);

                  tableData.push(row);

                  rowNum++;
            }

            res.writeHead(200, { "Content-type": "application/json" });
            res.end(JSON.stringify(tableData));

      });
})

app.get('/diseasePredictionData',(req,res)=>{
      var tableData = [];

      workbook.xlsx.readFile("./data/dataset.xlsx").then(() => {
            var worksheet = workbook.worksheets[0];

            var rowNum = 2;

            while (worksheet.getRow(rowNum).getCell(1).value != null) {
                  var row = worksheet.getRow(rowNum).values.splice(1);

                  tableData.push(row);

                  rowNum++;
            }

            res.writeHead(200, { "Content-type": "application/json" });
            res.end(JSON.stringify(tableData));

      });
})

app.get(["/","/index.html","/index"], (req,res)=>{
      fs.readFile(startPath + "/index.html", "utf-8", (err, data) => {
            if (err) {
                  console.log(err);
                  res.redirect('/404');
            }
            else
            {
                  res.writeHead(200, { "Content-type": "text" });
                  res.end(data);
            }
      });
})

app.get(["/misc_controls_orbit.html", "/misc_controls_orbit"], (req,res)=>{
      fs.readFile(startPath + "/misc_controls_orbit.html","utf-8",(err, data) => {
                  if (err) {
                        console.log(err);
                        res.redirect('/404');
                  }
                  else
                  {
                        res.writeHead(200, { "Content-type": "text" });
                        res.end(data);
                  }
            }
      );
})

app.get(["/404.html", "/404"], (req,res)=>{
      fs.readFile(startPath + "/404.html", "utf-8", (err, data) => {
            if (err) {
                  console.log(err);
                  res.redirect('/404');
            }
            else{
                  res.writeHead(200, { "Content-type": "text/html" });
                  res.end(data);
            }
      });
})

app.get(/\.(css)$/i, (req,res)=>{
      fs.readFile(startPath + req.originalUrl, "utf-8", (err, data) => {
            if (err) {
                  console.log(err);
                  res.redirect('/404');
            }
            else
            {
                  res.writeHead(200, { "Content-type": "text/css" });
                  res.end(data);
            }
      }); 
})

app.get(/\.(jpg|jpeg|png|gif)$/i, (req,res)=>{
      fs.readFile(startPath + req.originalUrl, (err, data) => {
            if (err) {
                  console.log(err);
                  res.redirect('/404');
            }
            else{
                  res.writeHead(200, { "Content-type": "image/png" });
                  res.end(data);
            }
      });
})

app.get(/\.(js)$/i, (req,res)=>{
      fs.readFile(startPath + req.originalUrl, (err, data) => {
            if (err||req.originalUrl === "/server.js") {
                  console.log(err);
                  res.redirect('/404');
            }
            else{
                  res.writeHead(200, { "Content-type": "application/javascript" });
                  res.end(data);
            }
      });
})

app.get([/\.(bin)$/i,/\.(gltf)$/i,/\.(glb)$/i], (req,res)=>{
      fs.readFile("./" + req.originalUrl, (err, data) => {
            if (err) {
                  console.log(err);
                  res.redirect('/404');
            }
            else
            {
                  res.writeHead(200, { "Content-type": "application/javascript" });
                  res.end(data);
            }
      }); 
})

app.get('*', function(req, res){
      res.writeHead(302, { Location: "404" });
      res.end();
});


app.listen(PORT, () => {
      console.log("Listening for reqests on port 3000.");
});
