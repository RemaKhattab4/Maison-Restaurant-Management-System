-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 23 نوفمبر 2026 الساعة 14:45
-- إصدار الخادم: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `maison_restaurant`
--

-- --------------------------------------------------------

--
-- بنية الجدول `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `admins`
--

INSERT INTO `admins` (`id`, `created_at`, `email`, `name`, `password`) VALUES
(1, '2026-11-14 20:06:11.000000', 'admin@maison.com', 'Maison Administrator', '$2a$10$tGUYKVV8fDzuzhYMryy0SufpPJXCBWXyUFtlOWGIGoAqqUPsQE.8W'),
(2, '2026-11-16 19:22:10.000000', 'rema@gmail.com', 'Maison Administrator', '$2a$10$uaSS/XO65kQrL.1qjZYM6eVYuLOAI.cVMZRv1DtYlYE0/B1v0cSm6');

-- --------------------------------------------------------

--
-- بنية الجدول `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `customers`
--

INSERT INTO `customers` (`id`, `created_at`, `email`, `name`, `password`, `phone`) VALUES
(1, '2026-11-14 22:17:06.000000', 'remakhattab4@gmail.com', 'rema khattab', '$2a$10$qsIfqNiLwPmIai8XKaGEeumGIDJdrXLDoq/rHq8w9CwgirVGfWUHu', '0780819191'),
(2, '2026-11-16 18:56:11.000000', 'eyadkhattab91@gmail.com', 'eyad', '$2a$10$J3SJH0wbZQJMAjps6Eifg.YWq0NzIBXkTJ1denPb.GK4YdoUIerOq', '0123456789'),
(3, '2026-11-19 19:49:32.000000', 'remakhattab5@gmail.com', 'Rema', '$2a$10$Mr8ih/dahNgBAJ4DgPvLbelm8kViWPYxC2idznPLi7sYYK74YVaEy', '0780819191'),
(4, '2026-11-19 19:58:17.000000', 'ayakhatab@gmail.com', 'Aya', '$2a$10$cGOuu59MrzXhip62Ea6vgufWjdYZIwvNRDPDu50mvzi0HDPHS3eYC', '0780819191');

-- --------------------------------------------------------

--
-- بنية الجدول `delivery_areas`
--

CREATE TABLE `delivery_areas` (
  `id` bigint(20) NOT NULL,
  `active` bit(1) NOT NULL,
  `delivery_fee` decimal(10,2) NOT NULL,
  `governorate` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `delivery_areas`
--

INSERT INTO `delivery_areas` (`id`, `active`, `delivery_fee`, `governorate`) VALUES
(1, b'1', 1.00, 'Amman'),
(2, b'1', 2.00, 'Zarqa'),
(5, b'1', 2.00, 'irbid');

-- --------------------------------------------------------

--
-- بنية الجدول `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `hire_date` date NOT NULL,
  `phone` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `salary` decimal(38,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `employees`
--

INSERT INTO `employees` (`id`, `full_name`, `hire_date`, `phone`, `position`, `salary`) VALUES
(1, 'Ahmad Khalil', '2026-06-11', '0790000001', 'Head Chef', 500.00),
(2, 'Sara Mohammad', '2026-09-12', '0790000002', 'Cashier', 350.00),
(3, 'Omar Saleh', '2026-11-07', '0790000001', 'Waiter', 320.00),
(4, 'Lina Ibrahim', '2026-10-08', '0790000002', 'Kitchen Assistant', 330.00),
(5, 'Khaled Nasser', '2026-11-01', '0790000001', 'Delivery Driver', 400.00);

-- --------------------------------------------------------

--
-- بنية الجدول `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(255) NOT NULL,
  `delivery_address` varchar(255) DEFAULT NULL,
  `order_type` enum('DELIVERY','PICKUP') NOT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','OUT_FOR_DELIVERY','PENDING','PREPARING','READY') NOT NULL,
  `total_price` decimal(38,2) NOT NULL,
  `delivery_fee` decimal(38,2) NOT NULL,
  `delivery_governorate` varchar(255) DEFAULT NULL,
  `subtotal` decimal(38,2) NOT NULL,
  `customer_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `orders`
--

INSERT INTO `orders` (`id`, `created_at`, `customer_name`, `customer_phone`, `delivery_address`, `order_type`, `status`, `total_price`, `delivery_fee`, `delivery_governorate`, `subtotal`, `customer_id`) VALUES
(1, '2026-11-03 20:05:30.000000', 'Rima Test', '0790000000', NULL, 'PICKUP', 'CANCELLED', 12.00, 0.00, NULL, 0.00, NULL),
(2, '2026-11-03 20:07:05.000000', 'Delivery Test', '0791111111', 'Amman - Jordan', 'DELIVERY', 'CANCELLED', 5.50, 0.00, NULL, 0.00, NULL),
(3, '2026-11-03 21:21:55.000000', 'New Test Order', '0792222222', NULL, 'PICKUP', 'COMPLETED', 6.00, 0.00, NULL, 0.00, NULL),
(4, '2026-11-14 18:27:28.000000', 'Eyad Khattab', '012587895526', NULL, 'PICKUP', 'PENDING', 6.00, 0.00, NULL, 0.00, NULL),
(5, '2026-11-14 18:32:29.000000', 'Rema', '01226336589', 'zarqa', 'DELIVERY', 'PENDING', 80.50, 0.00, NULL, 0.00, NULL),
(6, '2026-11-14 19:17:15.000000', 'Eyad Khattab', '01226336589', 'amman', 'DELIVERY', 'PENDING', 4.92, 1.00, 'Amman', 3.92, NULL),
(7, '2026-11-14 22:57:00.000000', 'rema khattab', '0780819191', NULL, 'PICKUP', 'PENDING', 25.72, 0.00, NULL, 25.72, 1),
(8, '2026-11-14 22:58:29.000000', 'rema khattab', '0780819191', NULL, 'PICKUP', 'PENDING', 6.00, 0.00, NULL, 6.00, 1),
(9, '2026-11-16 18:56:26.000000', 'eyad', '0123456789', 'amman', 'DELIVERY', 'PENDING', 12.00, 1.00, 'Amman', 11.00, 2),
(10, '2026-11-16 19:15:12.000000', 'rema khattab', '0780819191', NULL, 'PICKUP', 'PENDING', 24.96, 0.00, NULL, 24.96, 1),
(11, '2026-11-19 19:38:44.000000', 'rema khattab', '0780819191', NULL, 'PICKUP', 'PENDING', 12.00, 0.00, NULL, 12.00, 1),
(12, '2026-11-19 19:39:20.000000', 'rema khattab', '0780819191', NULL, 'PICKUP', 'PENDING', 4.00, 0.00, NULL, 4.00, 1),
(13, '2026-11-19 19:39:49.000000', 'rema khattab', '0780819191', NULL, 'PICKUP', 'PENDING', 4.00, 0.00, NULL, 4.00, 1),
(14, '2026-11-19 19:41:13.000000', 'rema khattab', '0780819191', NULL, 'PICKUP', 'PENDING', 17.50, 0.00, NULL, 17.50, 1),
(15, '2026-11-19 19:46:38.000000', 'rema khattab', '0780819191', NULL, 'PICKUP', 'PENDING', 9.50, 0.00, NULL, 9.50, 1),
(16, '2026-11-19 19:50:01.000000', 'Rema', '0780819191', NULL, 'PICKUP', 'PENDING', 14.00, 0.00, NULL, 14.00, 3),
(17, '2026-11-19 19:58:45.000000', 'Aya', '0780819191', NULL, 'PICKUP', 'PENDING', 15.00, 0.00, NULL, 15.00, 4),
(18, '2026-11-19 20:20:53.000000', 'rema khattab', '0780819191', NULL, 'PICKUP', 'PENDING', 16.50, 0.00, NULL, 16.50, 1);

-- --------------------------------------------------------

--
-- بنية الجدول `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(38,2) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL
) ;

--
-- إرجاع أو استيراد بيانات الجدول `order_items`
--

INSERT INTO `order_items` (`id`, `quantity`, `unit_price`, `order_id`, `product_id`) VALUES
(1, 2, 6.00, 1, 1),
(2, 1, 5.50, 2, 2),
(3, 1, 6.00, 3, 1),
(4, 1, 6.00, 4, 1),
(5, 8, 8.00, 5, 7),
(6, 3, 5.50, 5, 2),
(7, 2, 1.96, 6, 8),
(8, 7, 1.96, 7, 8),
(9, 2, 6.00, 7, 1),
(10, 1, 6.00, 8, 1),
(11, 2, 5.50, 9, 2),
(12, 1, 1.96, 10, 8),
(13, 2, 5.50, 10, 2),
(14, 2, 6.00, 10, 1),
(15, 2, 4.00, 11, 9),
(16, 1, 3.00, 11, 12),
(17, 1, 1.00, 11, 16),
(18, 1, 4.00, 12, 9),
(19, 1, 4.00, 13, 9),
(20, 3, 3.00, 14, 1),
(21, 1, 2.50, 14, 13),
(22, 2, 3.00, 14, 15),
(23, 1, 3.00, 15, 1),
(24, 2, 1.00, 15, 16),
(25, 1, 3.00, 15, 19),
(26, 1, 1.50, 15, 18),
(27, 2, 3.00, 16, 1),
(28, 3, 1.00, 16, 16),
(29, 1, 1.50, 16, 18),
(30, 1, 3.50, 16, 20),
(31, 2, 4.00, 17, 9),
(32, 1, 1.00, 17, 16),
(33, 2, 3.00, 17, 19),
(34, 2, 5.00, 18, 10),
(35, 1, 3.00, 18, 12),
(36, 2, 1.00, 18, 17),
(37, 1, 1.50, 18, 18);

-- --------------------------------------------------------

--
-- بنية الجدول `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `active` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `products`
--

INSERT INTO `products` (`id`, `description`, `image_url`, `name`, `price`, `stock_quantity`, `category`, `active`) VALUES
(1, 'Crispy chicken, fresh lettuce, pickles, and mayonnaise.', '/uploads/423ea096-5f81-4592-988a-38eb9e4b8550.jpg', 'Crispy Chicken Burger', 4.00, 30, 'Burgers', b'1'),
(2, 'Classic pizza with tomato sauce and mozzarella cheese', '/uploads/648eaa48-4116-4f62-9d45-4d660cec2510.jpg', 'Margherita Pizza', 8.00, 3, 'Pizza', b'0'),
(7, '', '/uploads/92369825-8b9a-42af-9fb4-e152b63810c9.jpg', 'Margherita Pizza', 8.00, 5, 'Pizza', b'0'),
(8, '', '/uploads/6c73996e-60e4-471f-bcc8-bc44de8d21b5.webp', 'pasta', 1.96, 0, 'Pasta', b'0'),
(9, 'Grilled beef, cheddar cheese, lettuce, tomato, onion, and the restaurant’s special sauce.', '/uploads/7ffe3d6f-17ad-475b-9dd5-1313fa2edbb8.jpg', 'Classic Beef Burger', 4.00, 14, 'Burgers', b'1'),
(10, 'Two beef patties, cheddar cheese, lettuce, and burger sauce.', '/uploads/095ae776-87e6-4aa2-af54-21c1af5f7859.jpg', 'Double Cheese Burger', 5.00, 13, 'Burgers', b'1'),
(11, 'Tomato sauce, mozzarella, basil, and olive oil.', '/uploads/1b677ceb-4163-47a4-a1f3-b623ccd3d4e8.jpg', 'Margherita Pizza', 2.00, 10, 'Pizza', b'1'),
(12, 'Tomato sauce, mozzarella, and pepperoni slices.', '/uploads/594e3a62-92ee-42f2-afa5-03df92ab3df6.jpg', 'Pepperoni Pizza', 3.00, 16, 'Pizza', b'1'),
(13, 'Chicken, barbecue sauce, mozzarella, and onions.', '/uploads/19f16ff8-caae-472a-8f7d-027894fdcfb9.jpg', 'Chicken BBQ Pizza', 2.50, 14, 'Pizza', b'1'),
(15, 'Spaghetti, tomato sauce, and ground meat.', '/uploads/a728ca0f-3a1b-4408-a020-854b2bc0ca51.jpg', 'Spaghetti Bolognese', 3.00, 23, 'Pasta', b'1'),
(16, 'Crispy French fries with salt.', '/uploads/6e9052c5-8ddf-4aa6-a2a4-1b6e70e4d76f.jpg', 'French Fries', 1.00, 23, 'Drinks', b'1'),
(17, 'Fried onion rings with a crispy coating.', '/uploads/13a4aaa5-9e52-4777-adcb-5d220fccf945.jpg', 'Onion Rings', 1.00, 28, 'Drinks', b'1'),
(18, 'Refreshing lemon and strawberry juice.', '/uploads/da103139-b6ec-4ca8-a844-b59406d9989a.jpg', 'Strawberry Lemonade', 1.50, 17, 'Drinks', b'1'),
(19, 'Rich chocolate brownie, soft on the inside, served with chocolate sauce.', '/uploads/8949a90d-73c5-479a-9adc-3f21639cc994.jpg', 'Chocolate Brownie', 3.00, 17, 'Desserts', b'1'),
(20, 'Warm chocolate cake with a rich, molten chocolate center.', '/uploads/530b901a-b5f4-48ef-ac64-23b208e98d6c.jpg', 'Molten Lava Cake', 3.50, 29, 'Desserts', b'1'),
(21, 'Creamy cheesecake with a biscuit base, topped with Lotus sauce and biscuit crumbs.', '/uploads/c6b3b85b-2215-4298-b4c0-3b94df76bb1b.jpg', 'Lotus Cheesecake', 3.75, 33, 'Desserts', b'1'),
(22, 'Fresh romaine lettuce, croutons, Parmesan cheese, and creamy Caesar dressing.', '/uploads/d30b1c9c-952c-4d2a-a60e-710d64c21e97.jpg', 'Caesar Salad', 1.00, 22, 'Salads', b'1'),
(23, 'Romaine lettuce, grilled chicken strips, croutons, Parmesan, and Caesar dressing.', '/uploads/6a1656e6-0268-4564-a327-a3b4b519ea77.jpg', 'Chicken Caesar Salad', 3.00, 22, 'Salads', b'1');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK47bvqemyk6vlm0w7crc3opdd4` (`email`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKrfbvkrffamfql7cjmen8v976v` (`email`);

--
-- Indexes for table `delivery_areas`
--
ALTER TABLE `delivery_areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK3hg1rdu66gs0f18mgkbck9ukl` (`governorate`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKpxtb8awmi0dk6smoh2vp1litg` (`customer_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  ADD KEY `FKocimc7dtr037rh4ls4l95nlfi` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `delivery_areas`
--
ALTER TABLE `delivery_areas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- قيود الجداول المُلقاة.
--

--
-- قيود الجداول `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FKpxtb8awmi0dk6smoh2vp1litg` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- قيود الجداول `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
