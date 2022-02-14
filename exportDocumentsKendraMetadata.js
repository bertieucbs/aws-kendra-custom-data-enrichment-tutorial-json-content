
const express = require('express');
const app = express();
app.set("json spaces", 2);
const fetch = require("node-fetch")
const cheerio = require('cheerio');
const fs = require('fs');

//Folders on local machine where to save the outputs
let DOCUMENT_PATH = 'data/documents/'
let METADATA_PATH = 'data/metadata/'

//Sample urls to crawl. 
urls = ['https://www.cdc.gov/coronavirus/2019-ncov/community/index.html', 
'https://www.cdc.gov/coronavirus/2019-ncov/your-health/quarantine-isolation.html',
'https://www.cdc.gov/coronavirus/2019-ncov/variants/omicron-variant.html',
'https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/use-n95-respirator.html',
'https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/types-of-masks.html']

/*
    1. Iterate through each of sample web urls and fetch basic info like title, description, keywords etc.
    2. Create <<fileName>>.txt and put 'description' in it for indexing. Store in folder 'data/documents/'
    3. Create <<fileName>>.txt.metadata.json with custom attributes/metadata about the document. Store in folder 'data/metadata/'

*/

documentID = 0;
var documentToIndex = {}

urls.forEach(element => {
  console.log(element);
  
  fetch(element)
  .then(result => result.text())
  .then(page => {
    const $ = cheerio.load(page);
    var title = $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="title"]').attr('content')
    var description = $('meta[name="description"]').attr('content')
    var url = $('meta[property="og:url"]').attr('content') || $('link[rel="canonical"]').attr('href')
    var site_name = $('meta[property="og:site_name"]').attr('content')
    var image = $('meta[property="og:image"]').attr('content') || $('meta[property="og:image:url"]').attr('content')
    var icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
    var keywords = $('meta[property="og:keywords"]').attr('content') || $('meta[name="keywords"]').attr('content')
    
    documentID = documentID + 1;
    documentToIndex = { documentID: documentID.toString(), title: title, description: description, url: url, _source_uri: url, site_name: site_name, image: image, icon: icon, keywords: keywords };
    console.log(documentToIndex)

    webFileName = element.substring(element.lastIndexOf("/")+1)
    fileNameTxt = webFileName.replace(".html",".txt")
    
    fs.writeFileSync(DOCUMENT_PATH + fileNameTxt, description);

    let s3Metadata = {
      DocumentId: documentID.toString(),
      Attributes: {
      },
      Title: title,
      ContentType: 'PLAIN_TEXT'
    }
    
    s3Metadata.Attributes = documentToIndex;

    let dataMeta = JSON.stringify(s3Metadata,null, 4);
    fileNameMetaJson = fileNameTxt + ".metadata.json";
    fs.writeFileSync(METADATA_PATH+fileNameMetaJson, dataMeta);


  }).catch(err => {
    console.log(err);
  })

});