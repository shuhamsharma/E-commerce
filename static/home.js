let load_more = document.getElementById("load_more");
let parent = document.getElementById("parent");
let pop_up = document.getElementById("pop_up");
let body = document.getElementsByTagName("body")[0];
var no = 5;
let out_of_stock=document.createElement("p");
out_of_stock.innerText="* OUT OF STOCK";
out_of_stock.className="out_of_stock";


load_more.addEventListener("click", function (event) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/getproducts", true)
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(JSON.stringify({ "no": no }));

    xhr.addEventListener("load", function () {
        let i = 0;
        var data = (JSON.parse(xhr.responseText));
        for (i = 0; i < data.length; i++) {
            let div = document.createElement("div");
            div.className = "product_card";
            div.id = data[i].product_id;
            let image = document.createElement("img");
            image.className = "product_image";
            image.src = data[i].path;
            let h5 = document.createElement("h5");
            h5.className = "product_title";
            h5.innerText = data[i].name;
            let button = document.createElement("button");
            let button2 = document.createElement("button");
            let button3 = document.createElement("button");
            button.setAttribute("class", "crt");
            button2.setAttribute("class", "crt");
            button3.setAttribute("class", "delcrt");
            button3.innerText = "Remove From Cart";
            button2.innerText = "Add To Cart";
            button.innerText = "View More";
            button2.setAttribute("key", data[i].product_id);
            button3.setAttribute("key", data[i].product_id);
            button3.style.display="none";
            button3.addEventListener("click", (event) => {delete_from_cart(event.target.getAttribute("key"),event.target) });
            button2.addEventListener("click", (event) => {add_to_cart(event.target.getAttribute("key"),event.target) });
            button.setAttribute("key", data[i].product_id);
            let div2 = document.createElement("div");
            button.addEventListener("click", (event) => { showpop(event.target.getAttribute("key")) });
            div.appendChild(image);
            div2.appendChild(h5);
            let div3 = document.createElement("div");
            div3.appendChild(button3);
            div3.appendChild(button2);
            div3.appendChild(button);
            if(data[i].quantity>0)
            div2.appendChild(div3);
            else
             div2.appendChild(out_of_stock);
            div.appendChild(div2);
            parent.append(div);
            if (i == data.length - 1) {
                load_more.innerText = "No More Products";
                break;
            }
        }
        if (i == 0)
            load_more.innerText = "No More Products";
        no += 5;
    })
})

function showpop(x) {
    let request = new XMLHttpRequest();
    request.open("POST", "/getproductinfo");
    request.setRequestHeader("content-type", "application/json");
    request.send(JSON.stringify({ id: x }));
    request.addEventListener("load", function () {
        let pop_title=document.getElementById("pop_title");
        let pop_price=document.getElementById("pop_price");
        let pop_description=document.getElementById("pop_description");
        let pop_image=document.getElementById("pop_image");
        let pop_close=document.getElementById("pop_close");
        let data = JSON.parse(request.responseText);
        pop_up.style.display = "block";
        pop_title.innerText = data[0].name;
        pop_image.setAttribute("src", data[0].path);
        pop_price.innerText = "₹" + data[0].price;
        pop_description.innerText = data[0].description;
        pop_close.addEventListener("click", function () {
            pop_up.style.display = "none";
        })
    })
}

function add_to_cart(product_id,target) {
    let request = new XMLHttpRequest();
    request.open("GET", "/islog_in");
    request.send();
    request.addEventListener("load", function () {
        if (request.responseText == "yes") {
            let request = new XMLHttpRequest();
            request.open("POST", "/addtocart");
            request.setRequestHeader("content-type", "application/json");
            request.send(JSON.stringify({ "product_id": product_id }));
            request.addEventListener("load", function () {
                let status = request.responseText;
                if (status == "success") {
                    target.style.display="none";
                    target.parentNode.children[0].style.display="inline";
                }
                else {
                    console.log("failure");
                }
            })
        }
        else
        {
            window.location.href="/login";
        }
    })
}

function delete_from_cart(product_id,target)
{
    let request = new XMLHttpRequest();
    request.open("POST", "/deletefromcart");
    request.setRequestHeader("content-type","application/json");
    request.send(JSON.stringify({"product_id":product_id}));
    request.addEventListener("load",function(){
if(request.responseText=="success"){
    target.style.display="none";
    target.parentNode.children[1].style.display="inline";
}
else
console.log("failure");
    })
    
}