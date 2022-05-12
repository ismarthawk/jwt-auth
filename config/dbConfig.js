const mongoose = require("mongoose");

exports.connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("DataBase Connected");
  } catch (error) {
    console.log("Error in connecting the DataBase");
    console.log(error);
  }
};
