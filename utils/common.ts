import multer from "multer";
export function storageFiles(){
    let fileStorage = multer.diskStorage({
        destination:"uploadsImages",
        filename: (req,file,cb)=>{
         let fileName = file.originalname;
         fileName = fileName.substr(0, fileName.indexOf(".")) + "_" + Date.now() + "." + fileName.substr(fileName.indexOf(".") + 1);
         cb(null,fileName);
        }
 })
 let fileUpload = multer({storage:fileStorage});
 return fileUpload;
}



export class APIResponse {
    status: any;
    message: any;
    data: any;
    constructor(status=200, message='success', data=[]) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
