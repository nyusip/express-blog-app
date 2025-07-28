const { validateToken } = require("../services/authentication");
const cookieName="token";
function checkForAuthenticationCookie(){
    return (req,res,next)=>{
       const tokenCookieValue=req.cookies[cookieName]
       if(!tokenCookieValue){
        return next();
       }
       try{
         const userPayLoad=validateToken(tokenCookieValue);
         req.user=userPayLoad;
         res.locals.user=null;
         
       } catch(error){
        res.locals.user=null;
       }
      
      return next();
    }
}
module.exports={
    checkForAuthenticationCookie,
}