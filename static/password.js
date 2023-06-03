input_mail=document.getElementById("input_mail");
function forgot_password()
 {

  let xml=new XMLHttpRequest();
    xml.open("POST","/forgot_password");
    xml.setRequestHeader("content-type", "application/json");
    xml.send(JSON.stringify({"mail":input_mail.value}));
    xml.addEventListener("load",function(){
        console.log(xml.responseText);
        if(xml.responseText=="sent")
        {
       window.location.href = "/login";
        }
        else if(xml.responseText=="activate")
        {
window.location.href="/login";
        }
        else if(xml.responseText=="no account")
        {
window.location.href="/forgot_password";
        }
    })
}