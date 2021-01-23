const Order = require('../../../modals/order');
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_KEY);
function orderController()
{
    return{
        store(req,res)
        {
           
            const {address, phone ,token, paymentType} = req.body;
            if(!address || !phone)
            {
                return res.status(400).json({message:"all fields are required"})
           
            
            }
            const order = new Order({
                customerId: req.user._id,
                Items: req.session.cart.items,
                phone,
                address,
                paymentType

            })
          
            order.save().then(result=>{
                Order.populate(result,{path:'customerId'},(err,placedOrder)=>{
                
                    if(paymentType ==='card')
                    {
                       
                         stripe.charges.create({
                             amount: req.session.cart.totalPrice*100,
                             source:token,
                             currency: 'inr',
                             description: `orderId: ${placedOrder._id}`,
                         }).then(()=>{
                             placedOrder.paymentStatus = true;
                             placedOrder.save().then((ord)=>{
                                const emitter = req.app.get('eventEmitter')
                                emitter.emit('adminOrderUpdated',ord)
                                delete req.session.cart;
                                return res.json({success:'order placed successfully'})
                             }).catch(err=>console.log(err))  
                         }).catch(err=>{
                            delete req.session.cart;
                            console.log(err)
                            return res.json({success:'order placed but payment failed, you can pay at delivery time'})
                         })
                    }else{
                        delete req.session.cart;
                        return res.json({success:'order placed successfully'})
                    }
               
              // req.flash('success','order placed successfully')
              
               
              
              // return res.redirect('/customer/orders')
             
            })
            }).catch(err=>{
                return req.status(400).json({message:'something went wrong'})
                
            })
        },
        async index(req,res)
        {
           const orders = await Order.find({customerId: req.user._id}
            ,null,{sort:{'createdAt':-1}});
            res.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0')
           
           return res.render('customers/orders',{orders:orders,moment:moment});
        },
        async show(req,res)
        {
         const order = await Order.findById(req.params.id)
         if(req.user._id.toString() === order.customerId.toString())
         {
           return res.render('customers/singleOrder',{order:order});
         }
         else{
            return res.redirect('/');
         }
        }
    }
}
module.exports = orderController;