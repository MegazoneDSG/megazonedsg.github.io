'use strict';

let fs = require('fs');
let Parser = require('rss-parser');
let parser = new Parser();

let AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    api_version: '2012-08-10',
    region: 'ap-northeast-2'
});

let tableName = 'blog-post-list';

module.exports.hello = async event => {

    let feed = await parser.parseURL('https://megazonedsg.github.io/feed.xml');
    console.log(feed.title);

    for (var i = 0; i < feed.items.length; i++) {
        var item = feed.items[i];
        console.log(item.title + ':' + item.link);

        //get post
        var search = {
            TableName: tableName,
            Key: {
                "link": item.link
            }
        };
        var exist;
        try {
            exist = await dynamoDb.get(search).promise();
        }
        catch (error) {
            console.log('search error', error);
        }

        if (exist && exist.Item) {
            console.log('exist', exist.Item.link);
            continue;
        }

        //save item
        var params = {
            TableName: 'blog-post-list',
            Item: item
        };

        try {
            const data = await dynamoDb.put(params).promise();
        } catch (error) {
            console.log('put error', error);
        }

        //send email
        var emailJson = fs.readFileSync('emails.json', 'utf8');
        var emails = JSON.parse(emailJson);
        console.log('Send To', emails);

        var emailParams = {
            Destination: {
                /* required */
                CcAddresses: [],
                ToAddresses: emails
            },
            Message: {
                /* required */
                Body: {
                    /* required */
                    Html: {
                        Charset: "UTF-8",
                        Data:
                        '<h1>새 글이 작성되었습니다.</h1><br>' +
                        '<h2>작성자: ' + item.creator + '</h2><br>' +
                        '<div>' + item.content + '</div><br>' +
                        '<a href="' + item.link + '">글 보러가기</a><br>'
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: item.title
                }
            },
            Source: 'blog@atomyops.com', /* required */
        };

        // Create the promise and SES service object
        try {
            var emailData = await new AWS.SES({
                apiVersion: '2010-12-01',
                region: 'us-west-2'
            }).sendEmail(emailParams).promise();

            console.log('email send complete');
        } catch (error) {
            console.log('email error', error);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'Go Serverless v1.0! Your function executed successfully!',
                input: event
            },
            null,
            2
        ),
    };

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
