let login_mail = document.getElementById("login_mail");
let login_password = document.getElementById("login_password");
let login_type_admin = document.getElementById("login_type_admin");
let login_type_user = document.getElementById("login_type_user");
let login_empty = document.getElementById("login_empty");
let signup_empty = document.getElementById("signup_empty");
let login_form = document.getElementById("login_form");
let signup_name=document.getElementById("signup_name");
let signup_mail=document.getElementById("signup_mail");
let signup_mobile=document.getElementById("signup_mobile");
let signup_password=document.getElementById("signup_password");

function sign() {
    window.location.href = "/signup";
}
function log() {
    window.location.href = "/login";
}


function login_validation() {
    if (login_mail.value && login_password.value.trim() && (login_type_user.checked || login_type_admin.checked))
        return true;
    login_empty.style.display = "block";
    return false;

}

function signup_validation() {
    if (signup_password.value.trim() && signup_name.value.trim() && signup_mobile.value && signup_mail.value&&(signup_type_seller.checked||signup_type_user.checked))
        return true;
    return false;

}

function forgotpassword() {
    // write code for forgot password
    var link = "/forgot_password";
    window.location.href = link;
}

function login_send() {
    if (login_validation()) {
        let obj;
        if (login_type_admin.checked)
            obj = { "who": "1", "mail": login_mail.value, "password": login_password.value };
        else
            obj = { "who": "0", "mail": login_mail.value, "password": login_password.value };

        let request = new XMLHttpRequest();
        request.open("POST", "/login");
        request.setRequestHeader("content-type", "application/json");
        request.send(JSON.stringify(obj));
        request.addEventListener("load", function () {
            console.log(request.responseText);
            switch (request.responseText) {
                case "admin login":
                    window.location.href = "/admin";
                    break;
                case "login success":
                    window.location.href = "/";
                    break;
                default:
                    login_empty.innerText ="*"+request.responseText;
                    login_empty.style.display = "block";
            }
        })
    }
    else {
        login_empty.style.display = "block";
    }
}

function signup_send(){
    if(signup_validation()){
    let obj={};
   if(signup_type_seller.checked)
   obj={"who":"admin","name":signup_name.value,"mail":signup_mail.value,"mobile":signup_mobile.value,"password":signup_password.value};
   else if(signup_type_user.checked)
   obj={"who":"user","name":signup_name.value,"mail":signup_mail.value,"mobile":signup_mobile.value,"password":signup_password.value};
   let request = new XMLHttpRequest();
   request.open("POST", "/signup");
   request.setRequestHeader("content-type", "application/json");
   request.send(JSON.stringify(obj));
   request.addEventListener("load", function () {
       switch (request.responseText) {               
                case "verify_mail":
                    window.location.href="/verify_mail";
                    break;
           default:
               signup_empty.innerText ="*"+request.responseText;
               signup_empty.style.display = "block";
       }
    
   })   
}
   else{
signup_empty.style.display="block";
   }
}