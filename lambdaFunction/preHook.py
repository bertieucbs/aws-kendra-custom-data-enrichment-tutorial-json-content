import json
import boto3
import json
     
s3 = boto3.client('s3')
     
def lambda_handler(event, context):
    s3_bucket = event.get("s3Bucket")
    print('s3_bucket-->')
    print(s3_bucket)
    s3_object_key = event.get("s3ObjectKey")
    print('s3ObjectKey-->')
    print(s3_object_key)
    content_object_before_CDE = s3.get_object(Bucket = s3_bucket, Key = s3_object_key)
    print('content_object_before_CDE')
    print(content_object_before_CDE)
    #get the json from each document
    content_before_CDE = content_object_before_CDE['Body'].read().decode('utf-8');
    print('content_before_CDE')
    print(content_before_CDE)
    
    #convert string to  json object
    json_object = json.loads(content_before_CDE)
    
    #extract the key/value from json 
    #put object with the document name
    #extract the meta fields and populate metadataUpdates
    _document_id = json_object["documentID"]
    _document_title = json_object["title"]
    description = json_object["description"]
    _source_uri = json_object["_source_uri"]
    site_name = json_object["site_name"]
    image = json_object["image"]
    keywords = json_object["keywords"]

    content_after_CDE = description
    
    res = s3_object_key.rindex('/')
    fileNameJson = s3_object_key[res+1:]
    fileNameTxt = fileNameJson.replace('.json','.txt')
    
    s3_document_key = fileNameTxt
    
    s3.put_object(Bucket = s3_bucket, Key = s3_document_key, Body=content_after_CDE)
    return {
        "version" : "v0",
        "s3ObjectKey": s3_document_key,
        "metadataUpdates": [
            {"name":"_document_title", "value":{"stringValue":_document_title}},
            {"name":"_document_id", "value":{"stringValue":_document_id}},
            {"name":"description", "value":{"stringValue":description}},
            {"name":"_source_uri", "value":{"stringValue":_source_uri}},
            {"name":"site_name", "value":{"stringValue":site_name}},
            {"name":"keywords", "value":{"stringValue":keywords}},
            {"name":"image", "value":{"stringValue":image}},
        ]
    }