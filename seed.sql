-- Testas datos: vartotojai
INSERT OR IGNORE INTO users (id, email, password_hash, name, role, department) VALUES 
  (1, 'admin@company.com', '$2a$10$rUj0IkJHlNlVG3W2sGhBmuqzg.LhgdxhQhG5TnJZLqj5pI5.9ynWq', 'Sistemos administratorius', 'admin', 'IT'),
  (2, 'jonas.petraitis@company.com', '$2a$10$rUj0IkJHlNlVG3W2sGhBmuqzg.LhgdxhQhG5TnJZLqj5pI5.9ynWq', 'Jonas Petraitis', 'employee', 'IT'),
  (3, 'ana.kazlauskiene@company.com', '$2a$10$rUj0IkJHlNlVG3W2sGhBmuqzg.LhgdxhQhG5TnJZLqj5pI5.9ynWq', 'Ana Kazlauskienė', 'manager', 'Administracija'),
  (4, 'petras.jonaitis@company.com', '$2a$10$rUj0IkJHlNlVG3W2sGhBmuqzg.LhgdxhQhG5TnJZLqj5pI5.9ynWq', 'Petras Jonaitis', 'supervisor', 'Vadovybė'),
  (5, 'rasa.petraitiene@company.com', '$2a$10$rUj0IkJHlNlVG3W2sGhBmuqzg.LhgdxhQhG5TnJZLqj5pI5.9ynWq', 'Rasa Petraitienė', 'accounting', 'Buhalterija'),
  (6, 'marija.navickiene@company.com', '$2a$10$rUj0IkJHlNlVG3W2sGhBmuqzg.LhgdxhQhG5TnJZLqj5pI5.9ynWq', 'Marija Navickienė', 'employee', 'Pardavimai');

-- Testas slaptažodis visiems: password123

-- Testas datos: tiekėjai
INSERT OR IGNORE INTO suppliers (id, name, company_code, vat_code, email, phone, address) VALUES 
  (1, 'UAB "TechLT"', '123456789', 'LT123456789012', 'info@techlt.com', '+370 5 123 4567', 'Gedimino pr. 1, Vilnius'),
  (2, 'MB "Kompiuteriai"', '987654321', 'LT987654321098', 'uzsakymai@kompai.lt', '+370 6 765 4321', 'Konstitucijos pr. 15, Vilnius'),
  (3, 'UAB "Biuras"', '456789123', 'LT456789123045', 'sales@biuras.lt', '+370 5 987 6543', 'Ukmergės g. 25, Vilnius'),
  (4, 'UAB "Baldų centras"', '789123456', 'LT789123456078', 'info@baldai.lt', '+370 5 234 5678', 'Savanorių pr. 80, Kaunas');

-- Testas datos: kategorijos
INSERT OR IGNORE INTO categories (id, name, parent_id) VALUES 
  (1, 'IT įranga', NULL),
  (2, 'Biuro technika', NULL),
  (3, 'Baldai', NULL),
  (4, 'Kanceliarijos prekės', NULL),
  (5, 'Kompiuteriai', 1),
  (6, 'Priedai', 1),
  (7, 'Spausdintuvai', 2),
  (8, 'Skeneriai', 2),
  (9, 'Darbo stalai', 3),
  (10, 'Kėdės', 3);

-- Testas datos: prašymai
INSERT OR IGNORE INTO requests (id, requester_id, department, priority, justification, status, total_amount, currency, needed_by_date, created_at) VALUES 
  (1, 2, 'IT', 'high', 'IT skyriui reikalingi du nauji nešiojami kompiuteriai darbuotojams', 'submitted', 1340.00, 'EUR', '2024-02-15', '2024-01-15 10:30:00'),
  (2, 6, 'Pardavimai', 'normal', 'Naujam darbuotojui reikalingas darbo stalas ir kėdė', 'draft', 450.00, 'EUR', '2024-02-01', '2024-01-16 14:20:00'),
  (3, 2, 'IT', 'urgent', 'Senas spausdintuvas sugedo, reikalingas naujas skubiai', 'under_review', 850.00, 'EUR', '2024-01-25', '2024-01-17 09:15:00');

-- Testas datos: prašymų eilutės
INSERT OR IGNORE INTO request_lines (id, request_id, item_name, category_id, quantity, unit, unit_price, total_price, supplier_id, notes) VALUES 
  (1, 1, 'Nešiojamas kompiuteris Dell Latitude 5530', 5, 2, 'vnt.', 600.00, 1200.00, 1, '15.6", i5, 16GB RAM, 512GB SSD'),
  (2, 1, 'Kompiuterio pelė Logitech MX Master 3S', 6, 2, 'vnt.', 25.00, 50.00, 1, 'Belaidė, ergonomiška'),
  (3, 1, 'Klaviatūra Logitech MX Keys', 6, 2, 'vnt.', 45.00, 90.00, 1, 'Belaidė, apšviečiama'),
  (4, 2, 'Reguliuojamas darbo stalas', 9, 1, 'vnt.', 300.00, 300.00, 4, '120x80cm, aukščio reguliavimas'),
  (5, 2, 'Biuro kėdė ergonomiška', 10, 1, 'vnt.', 150.00, 150.00, 4, 'Su atlošu ir porankiais'),
  (6, 3, 'Daugiafunkcinis spausdintuvas HP LaserJet Pro', 7, 1, 'vnt.', 850.00, 850.00, 2, 'Spausdinimas, skenavimas, kopijavimas');

-- Testas datos: patvirtinimai
INSERT OR IGNORE INTO approvals (id, request_id, approver_id, stage, decision, comment, decided_at) VALUES 
  (1, 3, 3, 'manager_review', 'approved', 'Spausdintuvas tikrai reikalingas, senas jau nebetaisomas', '2024-01-17 11:30:00');

-- Testas datos: notifikacijos
INSERT OR IGNORE INTO notifications (id, user_id, type, title, message, entity_type, entity_id, read) VALUES 
  (1, 3, 'request_submitted', 'Naujas prašymas peržiūrai', 'Jonas Petraitis pateikė naują prašymą #001', 'request', 1, 0),
  (2, 3, 'request_submitted', 'Naujas skubus prašymas', 'Jonas Petraitis pateikė skubų prašymą #003', 'request', 3, 0),
  (3, 4, 'request_approval_needed', 'Laukia patvirtinimo', 'Ana Kazlauskienė rekomendavo patvirtinti prašymą #003', 'request', 3, 0);