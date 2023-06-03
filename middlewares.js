const fs = require('fs');
var file = require('./methods/readfile');
var database = require('./methods/mysql');
var send_mail = require("./methods/sendmail");
const { conn } = require('./methods/mysql');
module.exports = {
  homepage: function (req, res) {
    database.conn().then(function (connection) {
      let stat = 'select * from products where product_id<=5';
      return database.getdata(connection, stat)
    }).then(function (data) {
      if (req.session.is_log) {
        let data2 = data;
        database.conn().then(function (connection) {
          let stat = `select role from person where person_id=${req.session.sellerid}`;
          return database.getdata(connection, stat)
        }).then(function (data) {
          if (data[0].role == 2 || data[0].role == 0) {
            res.render("home", { is_log: true, username: req.session.name, product_details: data2 });
          }
          else
            res.redirect("/admin");
        })
      } else
        res.render("home", { is_log: false, username: null, product_details: data });
    }).catch(function (err) {
      console.log(err);
    })

  },
  login_get: function (req, res) {
    if (req.session.is_log) {
      res.redirect('/');
    }
    else
      res.render("login", { error: null, value: "login" });
  },
  login_post: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `select *from person where mail='${req.body.mail}' and password='${req.body.password}' and role IN(2,${req.body.who})`;
      return database.getdata(connection, stat)
    }).then(function (data) {
      if (data.length) {
        if (data[0].is_verified == 1) {
          req.session.is_log = true;
          req.session.name = data[0].name;
          req.session.mail = data[0].mail;
          req.session.role=data[0].role;
          req.session.sellerid = data[0].person_id;
          if (req.body.who == "0") {
            // res.redirect("/");
            res.send("login success");
          }
          else {
            // res.redirect("/admin");
            res.send("admin login");
          }
        }
        else {
          res.send(" Please activate your account first before login");
          // res.render("login", { error: "please activate your account first before login", value: "login" })
        }

      }
      else {
        // res.render("login", { error: "Account doesn't exist", value: "login" });
        res.send("Account doesn't exist");
      }
    }).catch(function (err) {
      console.log(err);
      res.send("Something Went Wrong");
    })
  },
  signup_get: function (req, res) {
    if (req.session.is_log) {
      res.redirect('/');
      return;
    }
    else {
      res.render("login", { error: null, value: "signup" });
    }
  },
  signup_post: function (req, res) {
    database.conn().then(function (connection) {
      return database.getdata(connection, `select * from person where mail='${req.body.mail}'or phone='${req.body.mobile}'`)
    }).then(function (data) {
      if (data.length) {
        let role;
        if (req.body.who == "admin")
          role = 1;
        else role = 0;
        if (role == data[0].role || data[0].role == 2) {
          res.send("Account already exist");
          // res.render("login", { error: "Account already exist", value: "signup" });
        }
        else {
          update_account(req, res, data);
        }
      }
      else {
        mail_send(req, res);
      }
    }).catch(function (err) {
      console.log(err);
      res.send("something went wrong");
    })
  },
  logout: function (req, res) {
    req.session.destroy();
    res.redirect("/login");
  },
  admin: function (req, res) {
    if (req.session.is_log) {
      database.conn().then(function (connection) {
        let stat = `select role from person where person_id=${req.session.sellerid}`;
        return database.getdata(connection, stat)
      }).then(function (data) {
        if (data[0].role == 2 || data[0].role == 1) {
          database.conn().then(function (connection) {
            let stat = `select * from products where seller_id=${req.session.sellerid} and status1=1`;
            return database.getdata(connection, stat);
          }).then(function (data) {
            res.render("admin", { "products": data });
          }).catch(function (err) {
            console.log(err);
            res.redirect("/*");
          })
        }
        else
          res.redirect("/");
      })
    }
    else
      res.redirect("/login");
  },
  save_products: function (req, res) {
    database.conn().then(function (connection) {    
     let stat = `insert into products values('${req.body.name}','${req.body.description}',${req.body.price},${req.body.quantity},'${req.file.filename}',${req.session.sellerid},1)`;
      return database.add_data(connection, stat);
    }).then(function () {
      // res.render("admin", { message: "Product added to hammer server successfully" });
      res.send("successs");
    }).catch(function (err) {

      console.log(err);
      res.send("failure");
      // res.render("admin", { message: "Something went wrong, please try again after sometime" });
    })
  },
  get_product_post: function (req, res) {
    database.conn().then(function (connection) {
      // let stat = `select * from products where product_id between ${req.body.no} and ${req.body.no + 5}`;
      let stat = `select * from products order by product_id offset ${req.body.no} rows fetch next 5 row only`;
      return database.getdata(connection, stat)
    }).then(function (data) {
      res.json(data);
    }).catch(function (error) {
      console.log(error);
    })
  },
  change_password_get: function (req, res) {
    if (req.session.is_log)
      res.render("password", { value: "change_password", error: null })
    else
      res.redirect("/login");
  },
  change_password_post: function (req, res) {
    database.conn().then(function (connection) {
      if (req.body.new_pass != req.body.cnew_pass) {
        res.render("password", { value: "change_password", error: " Both password doesn't match" })
        return;
      }
      let stat = `update person set password='${req.body.new_pass}' where mail='${req.session.mail}'`;
      return database.add_data(connection, stat)
    }).then(function () {
      send_mail(req.session.mail, req.session.name, "Password Changed", "<h1>Your Hammer Account password has been changed successfully</h1>", function (err) {
        console.log(err);
        res.render("password", { value: "change_password", error: "password change successfully" })
      })
    }).catch(function (err) {
      console.log(err);
      res.render("password", { value: "change_password", error: "Something Went Wrong" });
    })
  },
  forgot_password_get: function (req, res) {
    if (!req.session.is_log)
      res.render("password", { value: "forgot_password", error: null });
    else res.redirect("/");
  },
  forgot_password_post: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `select * from person where mail='${req.body.mail}'`
      return database.getdata(connection, stat)
    }).then(function (data) {
      if (data.length) {
        if (data[0].is_verified == 1) {
          send_mail(data[0].mail, data[0].name, "Forgot password link", `click on the following button for change your Hammer password <a href="http://localhost:3000/forgot_password1?token=${data[0].token}">Change Password</a>`, function (err, data) {
            res.render("login", { value: "login", error: "Mail has been sent to your registered mail" })
            // res.send("sent");
          })
        }
        else
          res.render("login", { value: "login", error: "Please Activate Your account first" });
        // res.send("activate");
      }
      else
        res.render("password", { value: "forgot_password", error: "No account is linked with such mail" });
      // res.send("no account");
    }).catch(function (err) {
      console.log("error in forgot-password");
    })
  },
  forgot_password1_get: function (req, res) {
    let token = req.query.token;
    database.conn().then(function (connection) {
      let stat = `select * from person where token=${token}`;
      return database.getdata(connection, stat)
    }).then(function (data) {
      if (data.length) {
        req.session.token = data[0].token;
        res.render("verify_mail", { value: "forgot", error: null });
      }
    }).catch(function () {
      console.log("something went wrong");
    })
  },
  forgot_password1_post: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `update person set password='${req.body.password}' where token='${req.session.token}'`;
      return database.add_data(connection, stat)
    }).then(function () {
      res.render("login", { value: "login", error: "password changed successfully" });
    })
  },
  verify_account: function (req, res) {
    let { token } = req.params;
    database.conn().then(function (connection) {
      let stat = `update person set is_verified=1 where token='${token}'`;
      return database.add_data(connection, stat)
    }).then(function () {
      res.redirect("/login");
    })
      .catch(function (err) {
        console.log("err");
      })
  },
  product_info: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `select * from products where product_id=${req.body.id}`;
      return database.getdata(connection, stat)
    }).then(function (data) {
      res.json(data);
    }).catch(function (err) {
      console.log(err);
    })
  },
  addtocart: function (req, res) {
    let stat;
    database.conn().then(function (connection) {
      let stat1 = `select * from cart where product_id=${req.body.product_id} and user_id=${req.session.sellerid}`;
      return database.getdata(connection, stat1);
    }).then(function (data) {
      if (data.length)
        stat = `update cart set quantity=${data[0].quantity + 1} where product_id=${req.body.product_id} and user_id=${req.session.sellerid}`;
      else
        stat = `insert into cart values(${req.body.product_id},${req.session.sellerid},0,1)`;
      return database.conn()
    }).then(function (connection) {
      return database.add_data(connection, stat);
    }).then(function () {
      res.send("success");
    }).catch(function (error) {
      console.log(error);
      res.send("failure");
    })
  },
  is_log_in: function (req, res) {
    if (req.session.is_log)
      res.send("yes");
    else
      res.send("no");
  },
  deletefromcart: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `delete from cart where product_id=${req.body.product_id}and user_id=${req.session.sellerid}`;
      return database.add_data(connection, stat)
    }).then(function () {
      res.send("success");
    }).catch(function (error) {
      console.log(error);
      res.send("failure");
    })
  },
  showcart: function (req, res) {
    if (req.session.is_log) {
      database.conn().then(function (connection) {
        let stat = `select role from person where person_id=${req.session.sellerid}`;
        return database.getdata(connection, stat)
      }).then(function (data) {
        if (data[0].role == 2 || data[0].role == 0) {
          database.conn().then(function (connection) {
            let stat = ` select pt.name product_name,ct.cart_id,pt.path,pt.price,ct.quantity,st.name,pt.quantity product_quantity from products pt, cart ct, person st where ct.product_id=pt.product_id and pt.seller_id=st.person_id and ct.user_id=${req.session.sellerid}`;
            return database.getdata(connection, stat)
          }).then(function (data) {
            res.render("cart", { is_log: true, "data": data, "username": req.session.name });
          }).catch(function (error) {
            console.log(error);
          })
        }
        else
          res.redirect("/admin");
      })
    }
    else res.redirect("/login");
  },
  change_quantity: function (req, res) {
    database.conn().then(function (connection) {
      let stat;
      if (req.body.quantity == 0)
        stat = `delete from cart where cart_id=${req.body.cart_id}`;
      else
        stat = `select products.quantity from products,cart where products.product_id=cart.product_id and cart_id=${req.body.cart_id}`;
      return database.getdata(connection, stat)
    }).then(function (data) {
      if (data.length) {
        if (req.body.quantity > data[0].quantity)
          res.send("out of stock");
        else
          database.conn().then(function (connection) {
            let stat = `update cart set quantity=${req.body.quantity} where cart_id=${req.body.cart_id}`;
            return database.add_data(connection, stat)
          }).then(function () {
            res.send("success");
          }).catch(function (err) {
            console.log(err);
            res.send("failure");
          })
      }
      else {
        console.log(data);
        res.send("success");
      }
    }).catch(function (error) {
      console.log(error);
      res.send("failure");
    })
  },
  remove_cart: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `delete from cart where cart_id=${req.body.cart_id}`;
      return database.add_data(connection, stat)
    }).then(function () {
      res.send("success");
    }).catch(function (err) {
      console.log(err);
      res.send("failure");
    })
  },
  verify_mail: function (req, res) {
    // console.log(req.session.is_log)
    if (!req.session.is_log == true) {
      res.render("verify_mail", { value: "verify", message: "An e-mail has been sent to you, please activate account from there", status: "success" });
    }
    else
      res.redirect("/login");
  },
  edit_product: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `update products set name='${req.body.name}', description='${req.body.description}', price=${req.body.price}, quantity=${req.body.quantity},path='${req.file.filename}' where product_id=${req.body.product_id}`;
      return database.getdata(connection, stat)
    }).then(function (data) {
      res.send("data edit succesfully");
    }).catch(function (err) {
      console.log(err);
      res.send("failure");
    })
  },
  delete_product: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `update products set quantity=0,status1=0 where product_id=${req.body.id}`;
      return database.add_data(connection, stat);
    }).then(function () {
      res.send("success");
    }).catch(function (error) {
      console.log(error)
      res.send("failure");
    })
  },
  save_address: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `update person set address='${req.body.address}' where person_id=${req.session.sellerid}`;
      return database.add_data(connection, stat)
    }).then(function () {
      res.send("success");
    }).catch(function (err) {
      console.log(err);
      res.send("failure");
    })
  },
  get_user_details: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `select * from person where person_id=${req.session.sellerid}`;
      return database.getdata(connection, stat);
    }).then(function (data) {
      res.json(data);
    }).catch(function (error) {
      console.log(error);
      res.send("failure");
    })
  },
  place_orders: function (req, res) {
    database.conn().then(function (connection) {
      let stat = `select * from cart
      Declare @size int
      select @size=count(*) from cart where user_id=${req.session.sellerid}
    print @size
      DECLARE @current  INT 
      SET @current = 0
      while @current<@size
        begin
          DECLARE @product int,@quantity int,@cart_id int,@address varchar(max)
          select @product=product_id,@quantity=quantity,@cart_id=cart_id from cart  where user_id=${req.session.sellerid} order by cart_id  offset 0 rows fetch next 1 row only
          update products set quantity=quantity-@quantity where product_id=@product
          select @address=address from person where person_id=${req.session.sellerid}
          insert into orders(user_id,product_id,address,quantity) values(${req.session.sellerid},@product,@address,@quantity)
          delete from cart where cart_id=@cart_id
          set @current=@current+1
        end`;
      database.begin_transaction(connection, stat).then(function () {
        res.send("order placed");
      }).catch(function (err) {
        res.send("out of stock something");
      })
    }).catch(function (err) {
      console.log(err);
      res.send("server down");
      console.log("error in connecting");
    })
  },
  show_orders:function(req,res){
     database.conn().then(function(connection){
      let stat=`select count(date) as total,date,address from orders  where user_id=${req.session.sellerid} group by date,address`;
      return database.getdata(connection,stat)
     }).then(function(data)
     {
       res.render("orders",{orders:data,username:req.session.name});
     }).catch(function(err){
      console.log(err);
      res.redirect("/");
     })
  },
  full_order_details_date_wise: function(req,res)
  {
    database.conn().then(function(connection){
      let stat=`select orders.address,orders.status,orders.quantity,products.price,person.name seller_name,products.name product_name,products.path from orders, products ,person where date='${req.body.date}' and user_id=${req.session.sellerid} and orders.product_id=products.product_id and products.seller_id=person.person_id`;
      // console.log(stat);
      return database.getdata(connection,stat)
    }).then(function(data)
    {
      // console.log(data);
      res.json(data);
    }).catch(function(err)
    {
      res.send(err);
    })
  },
  seller_orders: function(req,res)
  {
      database.conn().then(function(connection){
        let stat=`select orders.address,orders.order_id,orders.status,orders.date,orders.quantity,products.name as product_name, person.name as buyer_name from products   inner join ( orders inner join person on orders.user_id=person.person_id) on products.product_id=orders.product_id  where products.seller_id=${req.session.sellerid}`;
        return database.getdata(connection,stat);
      }).then(function(data){
         res.render("seller_orders",{orders:data,username:req.session.name});
      })
      .catch(function(error){
        res.redirect("/admin");
      })
  },
  change_order_status: function(req,res)
  {
    console.log(req.body.order_id,req.body.value);
    database.conn().then(function(connection) {
      let stat=`select status from orders where order_id=${req.body.order_id}`;
      return database.getdata(connection,stat)
    }).then(function(data){
      let newdata=JSON.parse(data[0].status);
      newdata.push(req.body.value);
      database.conn().then(function(connection){
        let abc=JSON.stringify(newdata);
        let stat=`update orders set status='${abc}' where order_id=${req.body.order_id}`;
        return database.add_data(connection,stat);
      }).then(function()
      {
        res.send("success");
      }).catch(function(error){
        console.log(error);
        res.send("failure");
      })
    }).catch(function(error){
      res.send("failure");
    })
  }
}




function mail_send(req, res) {
  let token = Date.now();
  send_mail(req.body.mail, req.body.name, "Activation of Hammer Account", `click on the following button to activate your account <a href="http://localhost:3000/verify_account/${token}">Activate Now</a>`, function (err, data) {
    if (err) {
      // res.render("login", { value: "signup", error: "Mail doesn't exist" })
      res.send("Mail doesn't exist");
      return;
    }

    database.conn()
      .then(function (connection) {
        let type;
        if (req.body.who == "admin")
          type = 1;
        else type = 0;
        let stat = `insert into person(name,mail,phone,password,token,is_verified,role) values('${req.body.name}','${req.body.mail}','${req.body.mobile}','${req.body.password}','${token}',0,'${type}')`;
        return database.add_data(connection, stat)
      }).then(function () {
        // res.render("verify_mail", { value: "verify", message: "An e-mail has been sent to you, please activate account from there", status: "success" });
        res.send("verify_mail");
      }).catch(function (err) {
        // res.render("login", { error: "Something Went Wrong,please try again later", value: "signup" })
        res.send("Something went wrong");
      })

  })
}

function update_account(req, res, data) {
  if (req.body.mail == data[0].mail && req.body.mobile == data[0].phone && req.body.password == data[0].password) {
    database.conn().then(function (connection) {
      let stat = `update person set role=2 where mail='${req.body.mail}'`;
      return database.add_data(connection, stat)
    }).then(function () {
      // res.render("login", { error: "Account created successfully", value: "login" });
      res.send("account created successfully");
    })
  }
  else
    res.send("eligible");
  // res.render("login", { error: "Your'e eligible,but some of your input fields doesnt match", value: "signup" });

}








