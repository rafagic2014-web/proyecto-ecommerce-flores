-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: ecommerce_flores
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '12d69ed3-9756-11f1-8eac-3a642a387134:1-135';

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `estado_activo` tinyint DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Flores',1),(3,'Ramos',0),(4,'Plantas',0),(5,'Decoracion',0);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_detalle`
--

DROP TABLE IF EXISTS `pedido_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `nombre` varchar(100) NOT NULL COMMENT 'Copia del nombre al comprar',
  `precio` decimal(10,2) NOT NULL COMMENT 'Copia del precio al comprar',
  `cantidad` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `fk_detalle_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_detalle`
--

LOCK TABLES `pedido_detalle` WRITE;
/*!40000 ALTER TABLE `pedido_detalle` DISABLE KEYS */;
INSERT INTO `pedido_detalle` VALUES (9,7,3,'Rosas Rojas',15.50,1,15.50),(10,7,4,'Tulipanes',12.00,1,12.00);
/*!40000 ALTER TABLE `pedido_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cedula` varchar(20) DEFAULT NULL COMMENT 'Cedula de facturacion',
  `nombre_cliente` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `pais` varchar(60) DEFAULT NULL,
  `moneda` char(3) DEFAULT NULL COMMENT 'Moneda del cobro',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (7,18,32.50,'2026-09-28 19:52:22','1232323212','aassasdsa','asasdadasd','Ecuador','USD');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text,
  `precio` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `imagen` text,
  `categoria_id` int DEFAULT NULL,
  `estado_activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (2,'Rosas Rojas','Hermosas rosas frescas',15.50,20,'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d',1,0),(3,'Rosas Rojas','Color intenso transmite fuerza, deseo y elegancia',15.50,98,'/img/rosas.jpg',1,1),(4,'Tulipanes','Transmiten un encanto delicado que ilumina cualquier espacio. ?',12.00,90,'/img/tulipanes.jpg',1,1),(5,'Orquideas','Las orquídeas son un símbolo de sofisticación y misterio',12.00,92,'/img/orquideas.jpg',1,1),(6,'Girasoles','Con sus grandes pétalos dorados que siguen la luz del sol',10.00,92,'/img/girasoles.jpg',1,1),(7,'Lirios','Con sus pétalos elegantes y fragancia delicada, transmiten serenidad',18.00,96,'/img/lirios.jpg',1,1),(8,'Claveles','Con sus pétalos rizados y colores vibrantes, transmiten pasión',8.50,95,'/img/claveles.jpg',1,1),(9,'Lirios','Lirios blancos',20.00,9,'https://...',1,0),(10,'Margarita','con sus pétalos blancos y centro dorado, transmiten pureza',19.00,98,'/img/margarita.jpg',1,1),(11,'Crisantemos','Duraderos y coloridos, ideales para decoración',28.00,98,'/img/crisantemos.jpg',1,1),(12,'Peonía','Prosperidad, romance ',15.00,100,'/img/peonia.jpg',1,1),(13,'Lavanda','Relajacion y calma',45.00,100,'/img/lavanda.jpg',1,1);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `rol` enum('cliente','admin') DEFAULT 'cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado_activo` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Angel','angel@gmail.com','$2b$10$wZcH8U5RuBXngSn.vQf6gukhYP8KH2c4eQk6kP2fUk0iL6PNtQoci','admin','2026-06-11 23:19:21',1),(3,'Cliente','cliente@test.com','$2b$10$TAUX.NBCi8nK0TnHtOyxcOGlJZQlU3TT3peEsQDXRCPHfvdGODBWi','cliente','2026-06-14 03:52:34',1),(4,'Ezequiel ','eze@gmail.com','$2b$10$UGlSkweDbohrYCXWgAjA7exHKOEfS.VVZBKfBSdNiMosGSRJ6jvXq','cliente','2026-06-15 06:52:12',1),(6,'Carolina ','caro@gmail.com','$2b$10$gMbHNSGP8icCV2l/cXWvm.b7i2dv2FfC/caSLND1M7RY.Ya1i1swC','cliente','2026-06-15 07:29:10',1),(7,'Adele','adele@gmail.com','$2b$10$DOrHpUOSV30gMnM.OJ5X2.kt8IQKHr0C6AS1xS8Q60mCJgI/KBZui','cliente','2026-06-15 07:38:14',1),(8,'Estefania','tefa@gmail.com','$2b$10$DCNq3Ph1orQjPBPPWJCyxuF9R4mbN./c3DgAoT0GmS6YpTfbaT8U.','cliente','2026-06-15 07:54:27',1),(9,'NEYMAR','ney@gmail.com','$2b$10$c/b7KbduDjKIhFiOsmX3N.vCEC1JSP4ipxI2UOix3C.9uzh7Wb8a.','cliente','2026-06-15 17:18:47',1),(10,'chayanne@gmail.com','chayan@gmail.com','$2b$10$0XCtYROuOc66Z1tdiffvp.63MXEKoCX7i28BePnyXq5z8ZVOD5uNK','cliente','2026-06-15 17:21:19',1),(11,'Daniel Mendoza','daniel@gmail.com','$2b$10$gpGcyec7gW1gUUja6D/FbOVpaNZ7fkvAGLE9ddOYP5NjmYLKMMspO','cliente','2026-06-16 00:25:27',1),(12,'Alejandro','ale@gmail.com','$2b$10$XoAwbb92Cw62S04XeEnX4efqp5Q7inuOCcEsZiN7K67IwhbW6DJT6','cliente','2026-06-16 02:28:42',1),(17,'Administrador','admin@test.com','$2b$10$UMQ..ODYiLisxfWbhNXbEeBciwL9M0dHDYMcga7hp4kgFEZH/bWgW','admin','2026-09-28 18:47:05',1),(18,'Cliente Prueba','cliente.prueba@test.com','$2b$10$HOfCNmYk6NOvZS6yEW9L.OY1XuLzgkQyRlqNRhIciCcVV2Kxf6ony','cliente','2026-09-28 18:47:05',1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'ecommerce_flores'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-28 15:46:38
