

# Amazon Kendra - S3 document metadata tutorial

### What you'll learn in this tutorial:

1. Use Kendra to index your exported content from a CMS or other content source 
2. You will add metadata, additional information about a document, to documents in an Amazon S3 bucket using a metadata file. 
3. Create an Amazon Kendra index, Data source , Index fields and sync the data
4. Search indexed data

This tutorial takes about 30-45 minutes to complete.

## Concepts

Reference : https://docs.aws.amazon.com/kendra/latest/dg/s3-metadata.html

#### What is Amazon Kendra

Amazon Kendra is a highly accurate and easy to use enterprise search service that’s powered by machine learning. Kendra delivers powerful natural language search capabilities to your websites and applications so your end users can more easily find the information they need within the vast amount of content spread across your company.

When the source of your data is an Amazon S3 bucket or an Amazon S3 data source, you can apply custom attributes to your documents using metadata files. You can add metadata, additional information about a document, to documents in an Amazon S3 bucket using a metadata file. Each metadata file is associated with an indexed document. 

Your document metadata is defined in a JSON file. The file must be a UTF-8 text file without a BOM marker. The file name of the JSON file should be document.extension.metadata.json, where "document" is the name of the document that the metadata applies to and "extension" is the file extension for the document.

The content of the JSON file follows this template. All of the attributes are optional. If you don't specify the _source_uri, then the links returned by Amazon Kendra in search results point to the Amazon S3 bucket that contains the document. 

###### Below is an example from the developer documentations mentioned above

```
{
    "DocumentId": "document ID",
    "Attributes": {
        "_category": "document category",
        "_created_at": "ISO 8601 encoded string",
        "_last_updated_at": "ISO 8601 encoded string",
        "_source_uri": "document URI",
        "_version": "file version",
        "_view_count": number of times document has been viewed,
        "custom attribute key": "custom attribute value",
        additional custom attributes
    },
    "AccessControlList": [
         {
             "Name": "user name",
             "Type": "GROUP | USER",
             "Access": "ALLOW | DENY"
         }
    ],
    "Title": "document title",
    "ContentType": "HTML | MS_WORD | PDF | PLAIN_TEXT | PPT"
}


```

- You can add additional information to the Attributes field about a document that you use to filter queries or to group query responses. For more information, see Creating custom document attributes of Amazon Kendra's dev document.
- The AccessControlList field enables you to filter the response from a query so that only certain users and groups have access to documents. For more information, see Filtering on user context of Amazon Kendra's dev document. We will not be covering AccessControlList in this tutorial

## Background

You may have a situation where there is an existing CMS or content which you would like to export out in JSON and index it in Kendra. You can add metadata, additional information about a document, to documents in an Amazon S3 bucket using a metadata file. Each metadata file is associated with an indexed document. 

In this demo, we will export two files from sample webpages with our sample code

* A document with primary text/blob which you want to index. 
* Associated metadata, additional information about that document


Example

- quarantine-isolation.txt --> This will have main text (example *description*  which you want to index
- quarantine-isolation.txt.metadata.json --> This will have the meta data attributes which you want to export and associate with your document. 

Below is an example of what quarantine-isolation.txt.metadata.json would contain

```
{
    "DocumentId": "2",
    "Attributes": {
        "documentID": "2",
        "title": "Quarantine & Isolation",
        "description": "Quarantine after possible exposure to COVID-19 and stay home to monitor your health. Isolate when you have been infected with the virus and stay separated from others in your household.",
        "url": "https://www.cdc.gov/coronavirus/2019-ncov/your-health/quarantine-isolation.html",
        "_source_uri": "https://www.cdc.gov/coronavirus/2019-ncov/your-health/quarantine-isolation.html",
        "site_name": "Centers for Disease Control and Prevention",
        "image": "https://www.cdc.gov/coronavirus/2019-ncov/images/your-health/328871-quarantine-and-isolation-guidance-1200x675-1.jpg?_=31337",
        "icon": "/TemplatePackage/4.0/assets/imgs/favicon-32x32.png",
        "keywords": "quarantine, isolation, isolate, COVID-19, exposure, prevent spread, stay home, separate, monitor health, Coronavirus [CoV], Prevention & Infection Control, Distancing"
    },
    "Title": "Quarantine & Isolation",
    "ContentType": "PLAIN_TEXT"
}

```

## Architecture

We will be implementing below architecture for our demo. 

![](images/kendra-metadata.drawio.png)


Step 1 : Export your sample web pages into following files

- quarantine-isolation.txt --> This will have main text (example description which you want to index)
- quarantine-isolation.txt.metadata.json --> This will have the meta data attributes which you want to export and associate with your document.

Step 2 : Create following folders in your sample S3 bucket and upload the files as directed below

- **data/** : This will have main text (example *description* which you want to index e.g. *quarantine-isolation.txt*
- **metadata/data/** : This will have the meta data attributes which you want to export and associate with your document. e.g. *quarantine-isolation.txt.metadata.json*

Step 3 : Do the following in Amazon Kendra 

* Create Kendra index. 
* Create Datasource using S3 bucket as source and pointing to data and metadata folders. Reference : [Getting started with an Amazon S3 data source (console)](https://docs.aws.amazon.com/kendra/latest/dg/getting-started-s3.html) 
* Use the console or the [UpdateIndex API](https://docs.aws.amazon.com/kendra/latest/dg/API_UpdateIndex.html) to create the index fields. The supported field types are date, long, string, and string list. Reference : [Creating custom document attributes](https://docs.aws.amazon.com/kendra/latest/dg/custom-attributes.html)
* Sync the content

Once all the steps are done and verified, you can search your content. 

## Getting Started

### Step 1

##### Prerequisites

**Note** : *Any latest version of Node.js installed. At the time of writing this tutorial the version of Node is v12.16.1. Ensure its in your classpath. *

1. Create a folder 'KendraMetaData' on your local or [AWS Cloud9](https://aws.amazon.com/cloud9/) and download the 'exportDocumentsKendraMetadata.js' node.js file in it. Run 'npm install' to install the dependancies listed in 'package.json' file. 
2. Within 'KendraMetaData', create two more folders 'data/documents/' and 'data/metadata/'
3. The sample code will do the following 
   - Iterate through each of sample web urls and fetch basic info like 'title', 'description', 'keywords' etc.
   - Create 'fileName.txt' and put 'description' in it for indexing. Programme will store in folder 'data/documents/'
   - Create 'fileName.txt.metadata.json' with custom attributes/metadata about the document. Programme will store in folder 'data/metadata/'
7. Run the sample code by typing and verify the outputs and generated files in the folders

```
node exportDocumentsKendraMetadata.js
```

### Step 2 : Create S3 bucket

Create an S3 bucket in region of your choice. For the tutorial create in us-west-2 region. 

For basics of how to create S3 bucket refer [Creating a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)

Once the bucket is created, we will create two folders 

1. data/
2. metadata/
   - data/

For the uploads follow the process:

Upload the generated files from your local folder under *'data/documents/'* to S3 bucket's *data/*

![](images/s3Document.png)

Upload the generated files from your local folder under *'data/metadata/'* to S3 bucket's *metadata/data/*

![](images/s3DocumentMetadata.png)

### Step 3 : Create Kendra Index

Create Kendra Index as shown. Reference : [Creating an Index](https://docs.aws.amazon.com/kendra/latest/dg/create-index.html)

**Note** : Amazon Kendra requires permissions to access your CloudWatch log. Choose an existing IAM role or create a role for you.

After creation, your Index should be in an active state

![](images/createIndex.png)

### Step 4 : Create Kendra S3 Data source

Create a data source using S3 as data source where you have uploaded the files. 

[Getting started with an Amazon S3 data source (console)](https://docs.aws.amazon.com/kendra/latest/dg/getting-started-s3.html) 

While creating the data source, point to the correct data and metadata folders in your S3 bucket created in Step 2 above. 

**Note** : 

1. Amazon Kendra requires permissions for other services (S3 bucket in this case) to create this data source. Choose an existing IAM role or create a role for you.
2. Select On-Demand for run schedule 

![](images/createDS1.png)

After creation, your data source should be in an active state

![](images/createDS2.png)


### Step 5 : Create Facet definition

In order to enable an attribute to be returned in the query result , you need to enable faceting for that specific field on the Facets definition page.

On the Facet definition page in the Amazon Kendra console, you will find 4 options:

* **Facetable**: Indicates that the field can be used to create search facets, a count of results for each value in the field. The default is false .
* **Searchable**: Determines whether the field is used in the search. If the Searchable field is true, you can use relevance tuning to manually tune how Amazon Kendra weights the field in the search. The default is true for string fields and false for number and date fields.
* **Displayable**: Determines whether the field is returned in the query response. The default is true.
* **Sortable**: Determines whether the field can be used to sort the results of a query. If you specify sorting on a field that does not have Sortable set to true, Amazon Kendra returns an exception. The default is false.

![](images/addFacet1.png)

![](images/addFacet2.png)

Repeat above steps with below fields adding the data type and index usage types. 

| Fields  | Details (Data Type & Index Type) |
| ------------- | ------------- |
| documentID  | String - Searchable, Displayable |
| title  | String - Searchable, Displayable  |
| description  | String - Searchable, Displayable |
| url  | String - Searchable, Displayable  |
| site_name  | String - Facetable, Searchable, Displayable  |
| image  | String - Searchable, Displayable  |
| icon  | String - Searchable, Displayable  |
| keywords  | String - Searchable, Displayable  |

**Note** : Amazon Kendra has 15 reserved fields, which you can map to your document attributes. For more information, please refer [Index](https://docs.aws.amazon.com/kendra/latest/dg/hiw-index.html). One of them we are using in our metadata.json file is *_source_uri* which override defaults and points to the actual sample web page rather than S3 Object path. Since *_source_uri* is a reserved field in Kendra, we don't have to add to add it definition. 


### Step 6 : Sync/Index your Data source. 

With all set up, we will now On-Demand sync our data source in Step 4 above. 

#### Select the data source and click Sync now

![](images/syncNow.png)

#### Once sync starts, it will show an in progress message above. 

![](images/syncStatus.png)

#### Once sync completes, you will see a success message as shown below. 

![](images/syncCompleted.png)

#### You can look into the sync details by click on the data source and going on the details page. You will see total number of documents added. If there are errors, you can inspect the cloudwatch logs. 

![](images/syncDetails.png)

### Step 7 : Search indexed content

With our content indexed, lets search indexed content

#### Select Search indexed content

![](images/searchIndex1.png)

#### Search the content

![](images/searchIndex2.png)

## Conclusion and Clean Up

In this tutorial we saw how we can use in Kendra the S3-metadata option to apply custom attributes to your documents using metadata files. With this base you can now scale your architecture according to your requirements. 

In these last steps we will clean up our environment we need to delete a few things so we don't end up with unnecessary charges.

1. First step is to remove our Amazon Kendra index.
   - Click on "Services" on the top menu bar and search for Kendra to get to the Amazon Kendra homepage
   - Click "Indexes" on the sidebar menu to get to our list of indexes
   - Check the box next to our index we created in this tutorial
   - Click on Actions, then Delete

2. Next we will delete our S3 bucket
   - Click on "Services" on the top menu bar and search for S3 to get to the S3 homepage
   - Find your S3 bucket created in this tutorial and check the box next to it
   - In the menu near the top click on "Delete"
   - You will be prompted with some information about deleting your bucket. This will delete the bucket and all of its contents. Enter your bucket name here and click "Confirm".

Your index and bucket we used in this tutorial should now be deleted.

