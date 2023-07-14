const ErrorHandler = require("./errorhander");

class ApiFeatures {
  constructor(query, queryStr,next) {
    this.query = query;
    this.queryStr = queryStr;
    this.next=next;
  }


  pagination(questionsCount) {
    // const currentPage = Number(this.queryStr.page) || 1;

    const questionCount=questionsCount;
    const limit=Number(this.queryStr.limit)||8;
    const currentPage=Number(this.queryStr.page)||1;
    console.log(limit, currentPage);
    const skip = limit * (currentPage - 1);
    if(this.queryStr.page){
      if(questionCount<skip){
        throw new ErrorHandler("The page does not exist");
      }
    }
    this.query = this.query.limit(limit).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;


