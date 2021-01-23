import Noty from 'noty';
import axios from 'axios';
import {loadStripe} from '@stripe/stripe-js';

export async function initStripe ()
{
    const stripe =  await loadStripe('pk_test_51H46wOIvFtdwmMI2ZedZKpkFDxTyJkxwi5IhvWPvguUjgpgf4ZMZ5wX3WhA7vg0Nvu4qJXl29kbrzliZTLgFl7nW00Iv6CYI5J');
    let card = null;
    function showWidget()
    {
       
        const elements = stripe.elements(); 
        let style={
            base:{
                color:'#32325d',
                fontFamily:'"Helvetica Neue",Helvetica, sans-serif',
                fontSmoothing:'antialiased',
                fontSize:'16px',
                '::placeholder':{
                    color:'#aab7c4'
                }
            },
            invalid:{
                color:'#fa755a',
                iconColor:'#fa755a'
            }
        }
        card = elements.create('card',{style,hidePostalCode:true})
        card.mount('#card-element');
    
    }
    const paymentType = document.querySelector('#paymentType');
    if(!paymentType)
    {
        return;
    }
paymentType.addEventListener('change',async(e)=>{
    console.log(e.target.value);
   
     if(e.target.value==='card')
     {
         showWidget();
     }
     else
     {
            card.destroy();
     }
})
const payment = document.querySelector('#payment');
if(payment)
{


payment.addEventListener('submit',(e)=>{
    e.preventDefault();
    let formData = new FormData(payment);
    let formObj = {};
    for(let [key,value] of formData.entries())
    {
        formObj[key]=value;

    }
    if(!card )
    {
       console.log("reach")
        axios.post('/orders',formObj).then((res)=>{
            new Noty({
                type:'success',
                timeout:'1000',
                progressBar: false,
                text: res.data.success,
            }).show();
            setTimeout(()=>{
                window.location.href = '/customer/orders';
    
            },2000);
        }).catch(err=>{
            console.log("err",err.message);
        })
    }
    else
    {
       //verify card
    stripe.createToken(card).then(res=>{
        console.log(res);
        formObj.token = res.token.id;
        
        axios.post('/orders',formObj).then((res)=>{
            new Noty({
                type:'success',
                timeout:'1000',
                progressBar: false,
                text: res.data.success,
            }).show();
            setTimeout(()=>{
                window.location.href = '/customer/orders';
    
            },2000);
        }).catch(err=>{
            console.log(err);
        })
    }).catch(err=>console.log(err));
    }
    
    
})
}
}