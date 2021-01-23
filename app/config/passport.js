const LocalStrategy = require('passport-local').Strategy;
const User = require('../modals/user');
const bcrypt = require('bcrypt');

function init(passport){
  passport.use(new LocalStrategy({usernameField:'email'},async (email,password,done)=>{
       
  const user =  await User.findOne({email:email});
       if(!user)
       {
           return done(null,false,{message:'no user with this email'});
       }
       bcrypt.compare(password, user.password).then((match)=>{
           console.log(match)
           if(match)
           {
            return done(null,user,{message:'Logged in successfully'});
              
           }
           return done(null,false,{message:'incorrect password or email'});
       }).catch(err=>{
        return done(null,false,{message:'something went wrong'});
       })
      
   
  }))
  passport.serializeUser((user,done)=>{
      done(null,user._id);
  })
  passport.deserializeUser((id,done)=>{
        User.findById(id,(err,user)=>{
               
            done(err,user);
        })
  })
  
}
module.exports = init;