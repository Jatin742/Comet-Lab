const Product=require("../Models/productModel");
const ErrorHandler = require("./errorhander");

class ApiFeatures {
  constructor(query, queryStr,next) {
    this.query = query;
    this.queryStr = queryStr;
    this.next=next;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
        name: {
          $regex: this.queryStr.keyword,
          $options: "i",
        },
      }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    //   Removing some fields for category
    const removeFields = ["keyword", "page", "limit", "sort", "fields"];

    removeFields.forEach((key) => delete queryCopy[key]);
    
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    }
    else {
      this.query = this.query.sort("-createdAt");
    }
    if(this.queryStr.fields){
      const fields=this.queryStr.fields.split(",").join(" ");
      this.query=this.query.select(fields);
    }
    else{
      this.query=this.query.select('-__v');
    }

    // Filter For Price and Rating

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));


    return this;
  }

  pagination(filteredProductsCount) {
    // const currentPage = Number(this.queryStr.page) || 1;

    const productCount=filteredProductsCount;
    const limit=Number(this.queryStr.limit)||8;
    const currentPage=Number(this.queryStr.page)||1;
    console.log(limit, currentPage);
    const skip = limit * (currentPage - 1);
    if(this.queryStr.page){
      if(productCount<skip){
        throw new ErrorHandler("The page does not exist");
      }
    }
    this.query = this.query.limit(limit).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;


