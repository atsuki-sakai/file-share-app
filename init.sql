DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL
);

INSERT INTO posts (id, title, content) VALUES (1, 'Hello, world!', 'This is a test post.'), (2, 'Hello, world!', 'This is a test post.'), (3, 'Hello, world!', 'This is a test post.'), (4, 'Hello, world!', 'This is a test post.'), (5, 'Hello, world!', 'This is a test post.'), (6, 'Hello, world!', 'This is a test post.'), (7, 'Hello, world!', 'This is a test post.'), (8, 'Hello, world!', 'This is a test post.'), (9, 'Hello, world!', 'This is a test post.'), (10, 'Hello, world!', 'This is a test post.'    );