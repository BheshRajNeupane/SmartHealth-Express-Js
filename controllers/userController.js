//inital
const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync') 
const AppError = require('../utils/appError')

const multer = require('multer');


// Storage::Destination
const multerStorage = multer.diskStorage({
   destination: (req , file , cb)=>{ 
      cb(null , 'public/img/users') 
   },  
filename: (req,file,cb)=>{ 
   const ext = file.mimetype.split('/')[1] 
   cb(null , `user-${req.user.id}-${Date.now()}.${ext}`)
   }
   
})


const multerFilter = (req , file , cb)=>{
   if(file.mimetype.startsWith('image')){
      cb(null , true);
   }
   else{
      cb(new AppError('Not an image ! Please upload only images ', 400) , false)
   }
}

const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter
})

exports.uploadUserPhoto= upload.single('photo');


const filterObj = (obj , ...allowedFields)=>{
const newObj = {};
Object.keys(obj).forEach(el =>{
  // console.log(Object.keys(obj));
 
   if(allowedFields.includes(el)) { newObj[el]=obj[el]}
})
return newObj;
}

//getting Current User
exports.getMe = (req , res , next)=>{
 req.params.id = req.user.id;
 next();
}


 

exports.updateMe = catchAsync(async (req,res, next)=>{
   
 // 1)Create error i user POSTED password data
       if(req.body.password || req.body.passwordConfirm){
          return next(new AppError('This route is not for password update',400));
       }
 // 2)Filtered Out unwandted fields name that are not allowed to updated
 const filteredBody = filterObj(req.body , 'name' , 'email' );

  //saveing img name to DB
  if(req.file) filteredBody.photo = req.file.filename


 // 3.Update User
 const updatedUser = await User.findByIdAndUpdate(req.user.id , filteredBody , {
     new:true,
     runValidator:true
  })

res.status(200).json({
   status:"success",
   data:{
      user:updatedUser
   }
})

 })

exports.deleteMe = catchAsync(async(req, res, next)=>{
  await User.findByIdAndUpdate(req.user.id , {active:false});
 
  res.status(204).json({
     status:"success",
     data:null
  })
})
