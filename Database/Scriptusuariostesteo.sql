-- ==============================================
--  USUARIOS DE PRUEBA — Pétalos & Encanto
-- ==============================================
--  Los passwords NO están en texto plano: son hashes
--  bcrypt (coste 10) generados con bcryptjs, el mismo
--  motor que usa el backend. El login los verifica con
--  bcrypt.compare, así que funciona tal cual.
--
--  Cómo usarlo:
--    mysql -u root -p < Database/Scriptusuariostesteo.sql
--
--  Credenciales:
--    Administrador  admin@test.com         / Admin123*
--    Cliente        cliente.prueba@test.com / Cliente123*
--
--  El script es re-ejecutable: primero borra SOLO
--  estas dos cuentas de prueba y luego las vuelve a
--  crear. No toca ningún otro usuario de la base.
--
--  Por qué el cliente usa un email distinto:
--  'cliente@test.com' ya existe en la base (id 3, del
--  dump original) y su contraseña no se conoce. Como
--  `email` es UNIQUE, insertar ahí fallaría y además
--  pisaría una cuenta existente.
--
--  Nota: el campo `rol` es ENUM('cliente','admin').
--  Solo el admin entra a /admin.
-- ==============================================

--  Base de datos definida en Backend/.env (DB_NAME=ecommerce_flores)
USE ecommerce_flores;

-- ---------------------------------------------------------
--  Limpia solo las cuentas de prueba (re-ejecutable)
-- ---------------------------------------------------------
DELETE FROM usuarios
WHERE email IN ('admin@test.com', 'cliente.prueba@test.com');

-- ---------------------------------------------------------
--  Administrador
-- ---------------------------------------------------------
INSERT INTO usuarios (nombre, email, password, rol, estado_activo) VALUES
('Administrador', 'admin@test.com', '$2b$10$UMQ..ODYiLisxfWbhNXbEeBciwL9M0dHDYMcga7hp4kgFEZH/bWgW', 'admin', 1);

-- ---------------------------------------------------------
--  Usuario normal
-- ---------------------------------------------------------
INSERT INTO usuarios (nombre, email, password, rol, estado_activo) VALUES
('Cliente Prueba', 'cliente.prueba@test.com', '$2b$10$HOfCNmYk6NOvZS6yEW9L.OY1XuLzgkQyRlqNRhIciCcVV2Kxf6ony', 'cliente', 1);



-- Mirar las tablas
select * from usuarios;
select * from categorias;
select * from productos;
select * from pedidos;
