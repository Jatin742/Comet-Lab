const Question=require("../Models/questionModel");
const catchAsyncErrors=require("../Middlewares/catchAsyncErrors");
const sendToken=require("../utils/jwtToken");
const ErrorHander = require("../utils/errorhander");
require("dotenv").config();
const ACCESS_TOKEN=process.env.ACCESS_TOKEN;
const END_POINT=process.env.END_POINT;
const request=require("request");
const ApiFeatures=require("../utils/apifeatures");

exports.createQuestion=catchAsyncErrors(async (req,res)=>{
    let question={
        title:req.body.title,
        description:req.body.description,
    };

    var problemData = {
        name: req.body.title,
        body: req.body.description,
        masterjudgeId: 1001
    };
    
    // send request
    request({
        url: END_POINT + '/api/v4/problems?access_token=' + ACCESS_TOKEN,
        method: 'POST',
        form: problemData
    },async function (error, response, body) {
        
        if (error) {
            console.log('Connection problem');
        }
        
        // process response
        if (response) {
            if (response.statusCode === 201) {
                const data=JSON.parse(response.body);
                question.sphereId=data.id;
                console.log(data); // problem data in JSON
                const newQuestion = await Question.create(question);
            
                res.status(201).json({
                  success: true,
                  newQuestion
                });
            } else {
                if (response.statusCode === 401) {
                    console.log('Invalid access token');
                } else if (response.statusCode === 400) {
                    var body = JSON.parse(response.body);
                    console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                }
            }
        }
    });

})

exports.getAllQuestions=catchAsyncErrors(async (req,res,next)=>{
    const questionsCount=await Question.countDocuments();
    const questionPerPage=req.query.limit||5;
    const apiFeature=new ApiFeatures(Question.find(), req.query).pagination(questionsCount);
    const questions=await apiFeature.query;
    const filteredQuestions=questions.length;
    res.status(200).json({
        success:true,
        questions,
        questionsCount,
        questionPerPage,
        filteredQuestions
    })
})

exports.editQuestion=catchAsyncErrors(async (req,res,next)=>{
    let question=await Question.findById(req.params.id);
    if(!question){
        return next(new ErrorHander("Question not found",404));
    }
    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    const problemId=question.sphereId;
    let problemData={
        name:question.title,
        body:question.description,
    };
    request({
        url: END_POINT +'/api/v4/problems/' + problemId +  '?access_token=' + ACCESS_TOKEN,
        method: 'PUT',
        form: problemData
    }, function (error, response, body) {
        
        if (error) {
            console.log('Connection problem');
        }
        
        // process response
        if (response) {
            if (response.statusCode === 200) {
                console.log('Problem updated');
            } else {
                if (response.statusCode === 401) {
                    console.log('Invalid access token');
                } else if (response.statusCode === 403) {
                    console.log('Access denied');
                } else if (response.statusCode === 404) {
                    console.log('Problem does not exist');
                } else if (response.statusCode === 400) {
                    var body = JSON.parse(response.body);
                    console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                }
            }
        }
    });
    
    res.status(200).json({
        success: true,
        question,
    });
})

exports.deleteQuestion=catchAsyncErrors(async (req,res,next)=>{
    const question=await Question.findById(req.params.id);
    if(!question){
        return next(new ErrorHander("Question not found",404));
    }
    const problemId=question.sphereId;
    request({
        url: END_POINT + '/api/v4/problems/' + problemId + '?access_token=' + ACCESS_TOKEN,
        method: 'DELETE'
    }, function (error, response, body) {
        
        if (error) {
            console.log('Connection problem');
        }
        
        // process response
        if (response) {
            if (response.statusCode === 200) {
                console.log('Problem deleted');
            } else {
                if (response.statusCode === 401) {
                    console.log('Invalid access token');
                } else if (response.statusCode === 403) {
                    console.log('Access denied');
                } else if (response.statusCode === 404) {
                    console.log('Problem not found');
                }
            }
        }
    });
    
    await Question.deleteOne(question);
    res.status(200).json({
        success:true,
    })
})

exports.addTestCase=catchAsyncErrors(async (req,res,next)=>{
    let question=await Question.findById(req.params.id);
    if(!question){
        return next(new ErrorHander("Question not found",404));
    }
    let uploadCases=[];
    if(typeof req.body.testCases==="object"){
        question.testCases.push(req.body.testCases);
        uploadCases.push(req.body.testCases);
    }
    else{
        for(let i=0;i<req.body.testCases.length;i++){
            question.testCases.push(req.body.testCases[i]);
            uploadCases.push(req.body.testCases[i]);
        }
    }
    question=await Question.findByIdAndUpdate(req.params.id, question,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    const problemId=question.sphereId;
    for(let i=0;i<uploadCases.length;i++){
        const testcaseData={
            input:`${uploadCases[i].input}`,
            output:`${uploadCases[i].expectedOutput}`,
            judgeId: 1
        }
        request({
            url: END_POINT + '/api/v4/problems/' + problemId +  '/testcases?access_token=' + ACCESS_TOKEN,
            method: 'POST',
            form: testcaseData
        }, function (error, response, body) {
            
            if (error) {
                console.log('Connection problem');
            }
            
            // process response
            if (response) {
                if (response.statusCode === 201) {

                    console.log(JSON.parse(response.body)); // testcase data in JSON
                }
                else {
                    if (response.statusCode === 401) {
                        console.log('Invalid access token');
                    } else if (response.statusCode === 403) {
                        console.log('Access denied');
                    } else if (response.statusCode === 404) {
                        console.log('Problem does not exist');
                    } else if (response.statusCode === 400) {
                        var body = JSON.parse(response.body);
                        console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                    }
                }
            }
        });
    }
    

    res.status(200).json({
        success:true,
        question,
    })
})

exports.submitSolution = catchAsyncErrors(async (req,res,next)=>{
    const question=await Question.findById(req.params.id);
    if(!question){
        return next(new ErrorHander("Question not found",404));
    }
    // let submissionIds;
    var submissionData = {
        problemId: question.sphereId,
        compilerId: req.body.languageCode,
        source: req.body.code,
        
    };
        
        // send request
        request({
            url: END_POINT + '/api/v4/submissions?access_token=' + ACCESS_TOKEN,
            method: 'POST',
            form: submissionData
        }, function (error, response, body) {
            
            if (error) {
                console.log('Connection problem');
            }
            
            // process response
            if (response) {
                if (response.statusCode === 201) {
                    const data=JSON.parse(response.body);
                    // console.log(data);
                    let submissionId=data.id;
                    req.body.submissionId=submissionId;
                    console.log("Done Over Here");
                    setTimeout(() => {
                        console.log("Delayed for 1 second.");
                        next();
                      }, "5000");
                } else {
                    if (response.statusCode === 401) {
                        console.log('Invalid access token');
                    } else if (response.statusCode === 402) {
                        console.log('Unable to create submission');
                    } else if (response.statusCode === 400) {
                        var body = JSON.parse(response.body);
                        console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                    }
                }
            }
        });  
})

exports.sendSubmissionResult=catchAsyncErrors(async (req,res,next)=>{
// send request
console.log("Hello There");
request({
    url: END_POINT + '/api/v4/submissions/'+req.body.submissionId+'?access_token='+ACCESS_TOKEN,
    method: 'GET'
}, function (error, response, body) {
    
    if (error) {
        console.log('Connection problem');
    }
    
    // process response
    if (response) {
        if (response.statusCode === 200) {
            const data=JSON.parse(response.body);
            // console.log(data); // list of submissions in JSON
            let result=data.result.status.name;
            if(result==="accepted"){
                result="success";
            }
            else if(result=="wrong answer"){
                result="wrong";
            }
            else{
                console.log(result);
                result="error";
            }
            res.json({
                result
            });
        } else {
            if (response.statusCode === 401) {
                console.log('Invalid access token');
            } else if (response.statusCode === 400) {
                var body = JSON.parse(response.body);
                console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
            }
        }
    }
});

    
})