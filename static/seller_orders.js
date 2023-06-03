function change_status(order_id,event) {
    let input=document.getElementById(order_id+"status");
    let save=document.getElementById(order_id+"st");
    input.style.display="block";
    save.style.display="block";
    event.target.style.display="none";
    
}
function save_status(order_id,event)
{ 
    let input=document.getElementById(order_id+"status");
    if(input.value.trim()){
        let request=new XMLHttpRequest();
    request.open("POST","/change_order_status");
    request.setRequestHeader("content-type","application/json");
    request.send(JSON.stringify({order_id:order_id,value:input.value}));
    request.addEventListener("load",function () {
        if(request.responseText=="success")
        {
            let status=document.getElementById(order_id+"stval");
    let edit=document.getElementById(order_id+"bt");
            status.innerText=input.value.trim();
            event.target.style.display="none";
            input.style.display="none";
            edit.style.display="block";
        }
        
    })
    }
    else
    alert("please enter status first");
}