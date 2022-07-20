const personals = require(__dirname + "/personals.js");
const express = require("express");         // importing all the required packages.
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");


const app = express();      // creating object of express package


// below use method is for accessing static files within our project & we are saying that all the files are 
//  located in public folder & hence all file addresses are w.r.t. this public folder (eg. "css/styles.css").
app.use(express.static("public"));


app.use(bodyParser.urlencoded({extended: true}));   // this u   rlencoded() is used when we are dealing with html forms


// whenever clients make request to home route (at port: process.env.PORT || 5000), then send signup.html to them.
app.get("/", function(req, res){      
    res.sendFile(__dirname + "/signup.html");
});


// this post method is for processing the form data given by client and also for sending that data to mailchimp 
//  servers via API.
app.post("/", function(req, res){

    const firstName = req.body.firstName;   // using body-parser package to get the form data.
    const lastName = req.body.lastName;
    const email = req.body.email;
    
    const data = {      // making the data obejct which is compatible with mailchimp servers.
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);    // above data is converted into stringified json data.


    // Now below code is for sending client's information (jsonData) to mailchimp with the 
    //   help of https package (using request method)

    // https.request() has three parameters: url, options and callback function

    const url = "https://"+personals.mailchimpServerID+".api.mailchimp.com/3.0/lists/"+personals.audienceID;      // 1st parameter
    const options = {                                                       // 2nd parameter
        method: "POST",
        auth: "hello1:"+personals.apikey
    }

                                                // 3rd paramter
    const request = https.request(url, options, function(response){

        if(response.statusCode === 200){        // if everything went ok, then send this success page
            res.sendFile(__dirname + "/success.html");
        }
        else{
            res.sendFile(__dirname + "/failure.html");
        }

        // response.on("data", function(data){
        //     console.log(JSON.parse(data));
        // })
    });

    // below code represents the way we send our data to mailchimp server i.e. by storing output of 
    //  https.request into a variable and then using write() method to send the data
    request.write(jsonData);
    request.end(); 

});


// below post method is for handling post request from client through that "try again" button
//   which simply redirects to the home route.
app.post("/failure", function(req, res){
    res.redirect("/");
})
 
// NOTE: we didn't made any post() method for success route because success.html doesn't take any input.
//  hence we don't have to process the post request but on the failure route, there is a button to try again
//  so we need a post method to process that request.



// server is listening on two ports i.e. process.env.PORT (heroku) & 5000.
app.listen(process.env.PORT || 5000, function(){    
    console.log("Server is running on port 5000.");
});