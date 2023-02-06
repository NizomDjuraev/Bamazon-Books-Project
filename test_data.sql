
--Authors table testing data
INSERT INTO authors(id, name, bio) VALUES (1, "John Smith", "Fictional author");

INSERT INTO authors(id, name, bio) VALUES (2, "Nizom Djuraev", "Drexel Student");

INSERT INTO authors(id, name, bio) VALUES (10, "Bob Ross", "There are no mistakes, just happy accidents");

--Books table testing data
INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (100, 2, "Life as a Student", 2023, "Adventure");

INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (101, 2, "Midterms Week", 2023, "Scifi");

INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (5, 10, "How to Paint", 2023, "Adventure");

INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (25, 1, "Common Name", 2023, "Romance");