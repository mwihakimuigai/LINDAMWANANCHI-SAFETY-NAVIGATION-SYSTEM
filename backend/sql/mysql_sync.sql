-- Lindamwananchi MySQL sync for existing schema `lindamwananchi_safety`
-- Safe to run in MySQL Workbench.

CREATE DATABASE IF NOT EXISTS lindamwananchi_safety;
USE lindamwananchi_safety;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  incident_type VARCHAR(50) NOT NULL,
  description TEXT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  photo VARCHAR(255) NULL,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'resolved') DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  alert_type ENUM('safety', 'emergency', 'update') DEFAULT 'safety'
);

CREATE TABLE IF NOT EXISTS safe_routes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  start_lat DECIMAL(10,7) NOT NULL,
  start_lng DECIMAL(10,7) NOT NULL,
  end_lat DECIMAL(10,7) NOT NULL,
  end_lng DECIMAL(10,7) NOT NULL,
  route_data JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_phone VARCHAR(40) NOT NULL,
  relationship VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sos_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  contact_phone VARCHAR(40) NOT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  message TEXT NULL,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS traffic_accidents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  severity ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drainage_issues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  severity ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS external_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(80) NOT NULL,
  source VARCHAR(120) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  severity ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  details TEXT NULL,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  address TEXT,
  contact_number VARCHAR(50),
  opening_hours VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
