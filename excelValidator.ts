import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs/promises";
import { APIResponse, storageFiles } from "./utils/common";
import { Schema } from "./MongoDBSchemas/schema";
const app = express();

app.listen(3000, () => {
  console.log("Server Started : 3000");
});
const upload = multer({ dest: "uploads/" }); //Storing Uploaded files in UPLOADS folder

app.post("/test", (req, res) => {
  return res.send("Hello World");
});

app.post("/excelValidation", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      //Check if the file is uploaded
      return res.send({ status: 400, message: "No File Uploaded" });
    }
    const filePath = req.file.path; //Getting the file path
    const workbook = xlsx.readFile(filePath); //Reading the file
    const sheetName = workbook.SheetNames[0]; //Getting the sheet name
    const sheet = workbook.Sheets[sheetName]; //Getting the sheet Object

    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (jsonData.length < 2) {
      return res.send({
        status: 400,
        message: "Atleast One Record Should Be Present!",
      });
    }

    const validationResult: any = [];
    const validData = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const name = row[0];
      const address = row[1];
      const phoneNumber = row[2];
      const email = row[3];
      let validationErrors = [];

      if (!name || !address || !phoneNumber) {
        validationErrors.push("Name, Address, PhoneNumber fields are Required");
      } else {
        if (!/^[a-zA-Z]+ [a-zA-Z]+$/.test(name)) {
          validationErrors.push("Invalid Name Format");
        }
        if (!/^[^,]+, [^,]+, [^,]+$/.test(address)) {
          validationErrors.push(
            "Invalid address format (should be street, city, state)"
          );
        }
        if (!/^\d{3}-\d{3}-\d{4}$/.test(phoneNumber)) {
          validationErrors.push(
            "Invalid phone number format (should be XXX-XXX-XXXX)"
          );
        }
      }

      if (
        email &&
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
      ) {
        validationErrors.push("Invalid Email Format");
      }
      if (validationErrors.length > 0) {
        validationResult.push({
          row: i,
          errors: validationErrors,
        });
      } else {
        validData.push(row);
      }
    }
    if (validationResult.length > 0) {
      return res.send(validationResult);
    } else {
      return res.send(validData);
    }
  } catch (error) {
    return res.send({ status: 400, err: error.message });
  }
});

app.post("/uploadImage", storageFiles().single("pic"), (req, res) => {
  try {
    return res.send({ status: 200, message: "Success" });
  } catch (error) {
    return res.send({ status: 400, err: error.message });
  }
});

app.post("/uploadMultipleImage", storageFiles().array("pic"), (req, res) => {
  try {
    return res.send({ status: 200, message: "Success" });
  } catch (error) {
    return res.send({ status: 400, err: error.message });
  }
});

app.post('/saveImageMongoDB',storageFiles().single("pic"),async (req,res)=>{
  try {
    let imagePath = req.file.path;
    let body = req.body;
    body.imagepath = imagePath;
    await Schema.find({empno: body.empno}).then(async (result)=>{
      if(result.length>0){
      await fs.unlink(imagePath);
      res.send({ status: 400, message:"Already Exist and Uploaded image has been deleted" });
      }else{
        let empObj = new Schema(body);
      await empObj.save().then((response:any)=>{
        if(Object.keys(response).length>0){
          let resObj = new APIResponse();
          resObj.data = response;
          res.send(resObj);
        }else{
          res.send({ status: 400, message:"Not Inserted" });
        }
      }).catch((error:any)=>{
        res.send({ status: 400, err: error.message });
      })
      }
    })

    } catch (error) {
    return res.send({ status: 400, err: error.message });

  }

})

app.post("/saveImageMongoDB1",storageFiles().single("pic"),async (req, res) => {
    try {
      let imagePath = req.file.path;
      let body = req.body;
      body.imagepath = imagePath;

      let result = await Schema.find({ empno: body.empno });
      if (result.length > 0) {
        await fs.unlink(imagePath);
        return res.send({
          status: 200,
          message:
            body.empno + " Already Exists and Uploaded image has been deleted",
        });
      } else {
        let empObj = new Schema(body);
        let response = await empObj.save();
        if (Object.keys(response).length > 0) {
          let resObj = new APIResponse();
          resObj.data = response;
          return res.send(resObj);
        } else {
          return res.send({ status: 400, message: "Not Inserted" });
        }
      }
    } catch (error) {
      return res.send({ status: 400, err: error.message });
    }
  }
);
