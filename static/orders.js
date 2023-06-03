let parent=document.getElementById("full_details");
function fulldetails(event)
{
let request=new XMLHttpRequest();
request.open("POST","/full_order_details_date_wise");
request.setRequestHeader("content-type","application/json");
request.send(JSON.stringify({date:event}));
request.addEventListener("load",function(){
    let data=JSON.parse(request.responseText);
    console.log(parent);
    parent.style.display="block";
    parent.innerText="";
    for(let i=0;i<data.length;i++)
    {
      console.log(data[i]);
      let box=document.createElement("div");
      let box1=document.createElement("div");
      let box2=document.createElement("div");
      let name=document.createElement("h1");
      let img=document.createElement("img");
      let price=document.createElement("p");
      let quantity=document.createElement("p");
      let seller_name=document.createElement("p");
      img.setAttribute("src",data[i].path);
      name.innerText=data[i].product_name;
      price.innerText="price: "+data[i].price;
      quantity.innerText="Quantity: "+data[i].quantity;
      seller_name.innerText="Sold By: "+data[i].seller_name;
      
      //applying css
      box.className="main_box";
      box1.className="image_box";
      box2.className="details_box";
      img.className="image";
      
      //appending child
      box1.append(img);
      box2.append(name);
      box2.append(price);
      box2.append(quantity);
      box2.append(seller_name);
      box.append(box1);
      box.append(box2);

      parent.append(box);
    }
})

}