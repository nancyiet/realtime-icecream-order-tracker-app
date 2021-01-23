const Menu = require('../../modals/menu')
function homeController(){
    return{
        async index(req,res){
            

           const icecreams = await Menu.find();
           //console.log(icecreams)
           return res.render('home',{icecreams:icecreams});
          
    }
}
}

module.exports = homeController;