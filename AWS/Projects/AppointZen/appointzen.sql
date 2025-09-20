CREATE DATABASE IF NOT EXISTS appointzen;
USE appointzen;

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    mobile VARCHAR(20),
    date DATE,
    time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
