drop database egystore;
create database egystore;
use egystore;
create table categories (
	id int auto_increment primary key,
	name varchar(50) unique not null,
	description varchar (400) not null,
  img varchar (400) not null
);

create table brands (
	id int auto_increment primary key,
	name varchar (50) not null,
    img varchar (400) not null
);

create table users (
	id int auto_increment primary key,
    username varchar(50) unique not null,
    email varchar(50) not null,
	fname varchar (100) not null,
	lname varchar (100) not null,
    password varchar (100) not null
);

create table phone (
	id int auto_increment primary key,
	user_id int not null,
	phone varchar (20) not null,
    foreign key (user_id) references users(id)
);

create table products (
	id int auto_increment primary key,
    name varchar (255) not null,
    price double not null,
	description varchar(1000),
    rate double,
    brand_id int,
    category_id int,
	foreign key (brand_id) references brands(id),
	foreign key (category_id) references categories(id)
);

create table address (
	id int auto_increment primary key,
	user_id int not null,
	city varchar(50) not null,
    town varchar(50) not null,
    street varchar(50),
    house_num varchar(20),
    postal_code varchar(20),
    foreign key (user_id) references users(id)
);

create table orders (
	id int auto_increment primary key,
	user_id int not null,
	created_at varchar(20) not null,
    foreign key (user_id) references users(id)
);

create table carts (
	id int auto_increment primary key,
	user_id int not null,
    foreign key (user_id) references users(id)
);

create table order_line (
	id int auto_increment primary key,
    quantity int not null,
    order_id int,
    product_id int,
	foreign key (order_id) references orders(id),
	foreign key (product_id) references products(id)
);

create table review (
	id int auto_increment primary key,
    user_id int not null,
    product_id int not null,
    content varchar(1000) not null,
    created_at timestamp ,
	foreign key (user_id) references users(id),
	foreign key (product_id) references products(id)
);

create table product_img (
	id int auto_increment primary key,
    img varchar(255) not null,
    product_id int not null,
	foreign key (product_id) references products(id)
);

create table cart_item (
	id int auto_increment primary key,
    quantity int not null,
    cart_id int not null,
    product_id int not null,
	foreign key (cart_id) references carts(id),
	foreign key (product_id) references products(id)
);




