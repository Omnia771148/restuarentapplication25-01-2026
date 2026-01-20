import mongoose from "mongoose";

const connectionToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MongoURL) // to make the connection to mangodb where url in .env 
        console.log("connected ")
    }
    catch (err) {
        console.log(err)
    }
}
export default connectionToDatabase
