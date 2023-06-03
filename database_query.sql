create table person(
person_id int primary key identity(1,1),
name varchar(30) not null,
mail varchar(100) not null,
phone varchar(100) not null,
password varchar(100) not null,
token varchar(100) not null,
is_verified smallint not null default(0),
role int not null,
address varchar(100));

insert into person(name,mail,phone,password,token,is_verified,role) 
values('Shubham Sharma','shubhamsharma7667ss@gmail.com','7015290720','123456','1677230657224',1,2);

create table products(
product_id int primary key identity(1,1),
name varchar(20) not null,
description text not null,
price int not null,
quantity int not null check(quantity>=0),
path varchar(200) not null,
seller_id int references person(person_id),
status1 smallint default(1));

insert into products(name,description,price,quantity,path,seller_id)
values('Pulse 3.0','Hammer Pulse 3.0 Bluetooth Calling Smartwatch with Multiple Watch Faces',2499,0,'495766ef3ebd5069e7b76794594d1929',1);
insert into products(name,description,price,quantity,path,seller_id)
values('Neckband','This neckband is ideal for people who wish to enjoy a great time while listening to songs or watching films since it produces a top-quality bass sound.',799,43'f05318a5a1aea216bb98cbccd0a5b828',1);
insert into products(name,description,price,quantity,path,seller_id)
values('Powerbank','A power bank is a portable battery designed to recharge electronic gadgets when you don’t have access to a regular wall charger.',499,70,'901cc2a889b8b15252bc8569413a90d9',1);
insert into products(name,description,price,quantity,path,seller_id)
values('Airdopes 141','AirPods (3rd generation) and AirPods Pro (2nd generation) are sweat and water resistant for non-water sports and exercise, and they are IPX4 rated.',1499,50,'62345d8aa8430cd57fa4ad58ab01797a',1);
insert into products(name,description,price,quantity,path,seller_id)
values('Electric Toothbrush','An electric toothbrush is a toothbrush that makes rapid automatic bristle motions, either back-and-forth oscillation or rotation -oscillation',769,38,'a65632a3163c953129345753fab83f62',1);
insert into products(name,description,price,quantity,path,seller_id)
values('Boat Stone Grenade','Stone Grenade Say hello to the boAt Stone Grenade bluetooth speakers, half the size of Grenade XL only because it’s twice as portable and IPX 6 Water Resistant.',1499,17,'87dd3f8ccaea58af13930bc17caaf90c',1);

create table cart(
cart_id int primary key identity(1,1),
product_id int references products(product_id) not null,
user_id int references person(person_id) not null,
status smallint not null,
quantity int not null);

create table orders(
order_id int primary key identity(1,1),
user_id int references person(person_id),
product_id int references products(product_id),
date datetime not null default getdate(),
address varchar(400) not null,
status nvarchar(max) CHECK  (isjson([status])>(0)) default ('["ordered"]'),
quantity int not null
)
