-- ============================================================
-- KWIZZ.CO.UK — Quiz Content Seed Script
-- Run this in Supabase SQL Editor to populate quiz packs
-- ============================================================

-- First, add question_started_at column if missing
ALTER TABLE games ADD COLUMN IF NOT EXISTS question_started_at TIMESTAMPTZ;

-- Enable Realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE responses;

-- ============================================================
-- QUIZ PACK 1: General Knowledge
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000001', 'General Knowledge — Round 1', 'General Knowledge');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000001', 'What is the capital of Australia?', '["Sydney", "Melbourne", "Canberra", "Perth"]', 'Canberra', 'medium', 1),
('11111111-0001-0001-0001-000000000001', 'How many bones are in the adult human body?', '["186", "206", "226", "256"]', '206', 'medium', 2),
('11111111-0001-0001-0001-000000000001', 'Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]', 'Mars', 'easy', 3),
('11111111-0001-0001-0001-000000000001', 'What year did the Titanic sink?', '["1910", "1912", "1914", "1916"]', '1912', 'easy', 4),
('11111111-0001-0001-0001-000000000001', 'What is the chemical symbol for gold?', '["Go", "Gd", "Au", "Ag"]', 'Au', 'medium', 5),
('11111111-0001-0001-0001-000000000001', 'Which country has the most natural lakes?', '["USA", "Russia", "Canada", "Brazil"]', 'Canada', 'hard', 6),
('11111111-0001-0001-0001-000000000001', 'What is the smallest country in the world?', '["Monaco", "Vatican City", "San Marino", "Liechtenstein"]', 'Vatican City', 'easy', 7),
('11111111-0001-0001-0001-000000000001', 'How many hearts does an octopus have?', '["1", "2", "3", "4"]', '3', 'medium', 8),
('11111111-0001-0001-0001-000000000001', 'What is the hardest natural substance on Earth?', '["Gold", "Iron", "Diamond", "Platinum"]', 'Diamond', 'easy', 9),
('11111111-0001-0001-0001-000000000001', 'In what year was the first iPhone released?', '["2005", "2006", "2007", "2008"]', '2007', 'easy', 10);

-- ============================================================
-- QUIZ PACK 2: Sports
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000002', 'Sports Trivia — The Big Match', 'Sports');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000002', 'How many players are on a rugby union team?', '["11", "13", "15", "17"]', '15', 'easy', 1),
('11111111-0001-0001-0001-000000000002', 'Which country won the 2022 FIFA World Cup?', '["France", "Brazil", "Argentina", "Germany"]', 'Argentina', 'easy', 2),
('11111111-0001-0001-0001-000000000002', 'In tennis, what is a score of 40-40 called?', '["Match point", "Deuce", "Advantage", "Love"]', 'Deuce', 'easy', 3),
('11111111-0001-0001-0001-000000000002', 'How many holes are played in a standard round of golf?', '["9", "12", "18", "21"]', '18', 'easy', 4),
('11111111-0001-0001-0001-000000000002', 'Which boxer was known as "The Greatest"?', '["Mike Tyson", "Muhammad Ali", "Floyd Mayweather", "Lennox Lewis"]', 'Muhammad Ali', 'easy', 5),
('11111111-0001-0001-0001-000000000002', 'What sport is played at Wimbledon?', '["Cricket", "Tennis", "Golf", "Rugby"]', 'Tennis', 'easy', 6),
('11111111-0001-0001-0001-000000000002', 'How many points is a try worth in rugby union?', '["3", "4", "5", "6"]', '5', 'medium', 7),
('11111111-0001-0001-0001-000000000002', 'Which country hosted the 2020 Summer Olympics?', '["China", "Japan", "South Korea", "Australia"]', 'Japan', 'easy', 8),
('11111111-0001-0001-0001-000000000002', 'What is the maximum break in snooker?', '["140", "147", "155", "170"]', '147', 'medium', 9),
('11111111-0001-0001-0001-000000000002', 'Which F1 driver has won the most World Championships?', '["Ayrton Senna", "Michael Schumacher", "Lewis Hamilton", "Max Verstappen"]', 'Lewis Hamilton', 'medium', 10);

-- ============================================================
-- QUIZ PACK 3: Music
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000003', 'Music Legends', 'Music');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000003', 'Which band performed "Bohemian Rhapsody"?', '["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"]', 'Queen', 'easy', 1),
('11111111-0001-0001-0001-000000000003', 'What instrument does Ed Sheeran primarily play?', '["Piano", "Guitar", "Drums", "Violin"]', 'Guitar', 'easy', 2),
('11111111-0001-0001-0001-000000000003', 'Which artist released the album "Thriller"?', '["Prince", "Michael Jackson", "Stevie Wonder", "Whitney Houston"]', 'Michael Jackson', 'easy', 3),
('11111111-0001-0001-0001-000000000003', 'How many members were in the Spice Girls?', '["3", "4", "5", "6"]', '5', 'easy', 4),
('11111111-0001-0001-0001-000000000003', 'Which country does ABBA come from?', '["Norway", "Denmark", "Sweden", "Finland"]', 'Sweden', 'easy', 5),
('11111111-0001-0001-0001-000000000003', 'What was Elvis Presley''s middle name?', '["Aaron", "James", "Lee", "Wayne"]', 'Aaron', 'medium', 6),
('11111111-0001-0001-0001-000000000003', 'Which rapper''s real name is Marshall Mathers?', '["Jay-Z", "Eminem", "Kanye West", "50 Cent"]', 'Eminem', 'easy', 7),
('11111111-0001-0001-0001-000000000003', 'What year was Spotify launched?', '["2006", "2008", "2010", "2012"]', '2008', 'hard', 8),
('11111111-0001-0001-0001-000000000003', 'Which Beatles album features a zebra crossing on the cover?', '["Sgt. Pepper", "Abbey Road", "Let It Be", "Revolver"]', 'Abbey Road', 'medium', 9),
('11111111-0001-0001-0001-000000000003', 'What is the best-selling single of all time?', '["Bohemian Rhapsody", "White Christmas", "Candle in the Wind", "Hey Jude"]', 'White Christmas', 'hard', 10);

-- ============================================================
-- QUIZ PACK 4: Film & TV
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000004', 'Film & TV Blockbusters', 'Film & TV');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000004', 'Who directed Jurassic Park?', '["James Cameron", "Steven Spielberg", "Ridley Scott", "George Lucas"]', 'Steven Spielberg', 'easy', 1),
('11111111-0001-0001-0001-000000000004', 'What is the highest-grossing film of all time?', '["Avengers: Endgame", "Avatar", "Titanic", "Star Wars"]', 'Avatar', 'medium', 2),
('11111111-0001-0001-0001-000000000004', 'In The Shawshank Redemption, what is Andy''s surname?', '["Dufresne", "Norton", "Brooks", "Red"]', 'Dufresne', 'medium', 3),
('11111111-0001-0001-0001-000000000004', 'Which actor played Jack in Titanic?', '["Brad Pitt", "Leonardo DiCaprio", "Matt Damon", "Johnny Depp"]', 'Leonardo DiCaprio', 'easy', 4),
('11111111-0001-0001-0001-000000000004', 'How many Harry Potter films are there?', '["6", "7", "8", "9"]', '8', 'easy', 5),
('11111111-0001-0001-0001-000000000004', 'What TV show features the Iron Throne?', '["The Witcher", "Game of Thrones", "Lord of the Rings", "Vikings"]', 'Game of Thrones', 'easy', 6),
('11111111-0001-0001-0001-000000000004', 'Who plays Eleven in Stranger Things?', '["Sadie Sink", "Millie Bobby Brown", "Natalia Dyer", "Maya Hawke"]', 'Millie Bobby Brown', 'easy', 7),
('11111111-0001-0001-0001-000000000004', 'What year was the first Star Wars film released?', '["1975", "1977", "1979", "1981"]', '1977', 'medium', 8),
('11111111-0001-0001-0001-000000000004', 'Which Disney film features the song "Let It Go"?', '["Moana", "Tangled", "Frozen", "Brave"]', 'Frozen', 'easy', 9),
('11111111-0001-0001-0001-000000000004', 'In Breaking Bad, what is Walter White''s alias?', '["Heisenberg", "The Professor", "Scarface", "Mr. White"]', 'Heisenberg', 'easy', 10);

-- ============================================================
-- QUIZ PACK 5: Science & Nature
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000005', 'Science & Nature', 'Science');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000005', 'What gas do plants absorb from the atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 'Carbon Dioxide', 'easy', 1),
('11111111-0001-0001-0001-000000000005', 'What is the largest organ in the human body?', '["Liver", "Brain", "Skin", "Heart"]', 'Skin', 'medium', 2),
('11111111-0001-0001-0001-000000000005', 'How many chromosomes do humans have?', '["23", "42", "46", "48"]', '46', 'medium', 3),
('11111111-0001-0001-0001-000000000005', 'What is the speed of light in km/s (approx)?', '["100,000", "200,000", "300,000", "400,000"]', '300,000', 'medium', 4),
('11111111-0001-0001-0001-000000000005', 'Which element has the atomic number 1?', '["Helium", "Hydrogen", "Lithium", "Carbon"]', 'Hydrogen', 'easy', 5),
('11111111-0001-0001-0001-000000000005', 'What is the largest planet in our solar system?', '["Saturn", "Neptune", "Jupiter", "Uranus"]', 'Jupiter', 'easy', 6),
('11111111-0001-0001-0001-000000000005', 'How long does it take light from the Sun to reach Earth?', '["4 minutes", "8 minutes", "12 minutes", "16 minutes"]', '8 minutes', 'medium', 7),
('11111111-0001-0001-0001-000000000005', 'What animal has the longest lifespan?', '["Elephant", "Tortoise", "Bowhead Whale", "Parrot"]', 'Bowhead Whale', 'hard', 8),
('11111111-0001-0001-0001-000000000005', 'What is the powerhouse of the cell?', '["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"]', 'Mitochondria', 'easy', 9),
('11111111-0001-0001-0001-000000000005', 'What does DNA stand for?', '["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nuclear Acid", "Dual Nucleotide Array"]', 'Deoxyribonucleic Acid', 'medium', 10);

-- ============================================================
-- QUIZ PACK 6: History
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000006', 'History Through The Ages', 'History');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000006', 'In which year did World War II end?', '["1943", "1944", "1945", "1946"]', '1945', 'easy', 1),
('11111111-0001-0001-0001-000000000006', 'Who was the first person to walk on the Moon?', '["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"]', 'Neil Armstrong', 'easy', 2),
('11111111-0001-0001-0001-000000000006', 'Which ancient wonder was located in Egypt?', '["Colossus of Rhodes", "Hanging Gardens", "Great Pyramid of Giza", "Lighthouse of Alexandria"]', 'Great Pyramid of Giza', 'easy', 3),
('11111111-0001-0001-0001-000000000006', 'Who painted the Mona Lisa?', '["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"]', 'Leonardo da Vinci', 'easy', 4),
('11111111-0001-0001-0001-000000000006', 'What year did the Berlin Wall fall?', '["1987", "1988", "1989", "1990"]', '1989', 'medium', 5),
('11111111-0001-0001-0001-000000000006', 'Which ship brought the Pilgrims to America in 1620?', '["Santa Maria", "Mayflower", "Endeavour", "Beagle"]', 'Mayflower', 'easy', 6),
('11111111-0001-0001-0001-000000000006', 'Who was the first Queen of England?', '["Mary I", "Elizabeth I", "Victoria", "Anne"]', 'Mary I', 'hard', 7),
('11111111-0001-0001-0001-000000000006', 'What was the name of the Roman city destroyed by Vesuvius?', '["Rome", "Pompeii", "Athens", "Carthage"]', 'Pompeii', 'easy', 8),
('11111111-0001-0001-0001-000000000006', 'In which decade was the NHS founded?', '["1930s", "1940s", "1950s", "1960s"]', '1940s', 'medium', 9),
('11111111-0001-0001-0001-000000000006', 'Who discovered penicillin?', '["Louis Pasteur", "Alexander Fleming", "Joseph Lister", "Edward Jenner"]', 'Alexander Fleming', 'medium', 10);

-- ============================================================
-- QUIZ PACK 7: Food & Drink
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000007', 'Food & Drink Challenge', 'Food & Drink');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000007', 'What is the main ingredient in guacamole?', '["Tomato", "Avocado", "Lime", "Onion"]', 'Avocado', 'easy', 1),
('11111111-0001-0001-0001-000000000007', 'Which country is Champagne from?', '["Italy", "Spain", "France", "Germany"]', 'France', 'easy', 2),
('11111111-0001-0001-0001-000000000007', 'What type of pasta is shaped like little ears?', '["Penne", "Orecchiette", "Fusilli", "Rigatoni"]', 'Orecchiette', 'hard', 3),
('11111111-0001-0001-0001-000000000007', 'What is the most consumed beverage in the world after water?', '["Coffee", "Tea", "Beer", "Milk"]', 'Tea', 'medium', 4),
('11111111-0001-0001-0001-000000000007', 'Scoville units measure the heat of what?', '["Ovens", "Chilli peppers", "Curries", "Sauces"]', 'Chilli peppers', 'medium', 5),
('11111111-0001-0001-0001-000000000007', 'What nut is used to make marzipan?', '["Walnut", "Cashew", "Almond", "Pistachio"]', 'Almond', 'medium', 6),
('11111111-0001-0001-0001-000000000007', 'Which fruit is known as the "king of fruits"?', '["Mango", "Durian", "Pineapple", "Jackfruit"]', 'Durian', 'hard', 7),
('11111111-0001-0001-0001-000000000007', 'What is the national dish of Japan?', '["Sushi", "Ramen", "Curry Rice", "Tempura"]', 'Curry Rice', 'hard', 8),
('11111111-0001-0001-0001-000000000007', 'How many teaspoons of sugar are in a can of Coca-Cola (approx)?', '["5", "7", "9", "11"]', '9', 'medium', 9),
('11111111-0001-0001-0001-000000000007', 'What colour is the flesh of a ripe kiwi fruit?', '["Yellow", "Green", "Orange", "White"]', 'Green', 'easy', 10);

-- ============================================================
-- QUIZ PACK 8: Geography
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000008', 'Around The World', 'Geography');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000008', 'What is the longest river in the world?', '["Amazon", "Nile", "Mississippi", "Yangtze"]', 'Nile', 'medium', 1),
('11111111-0001-0001-0001-000000000008', 'Which continent has the most countries?', '["Asia", "Europe", "Africa", "South America"]', 'Africa', 'medium', 2),
('11111111-0001-0001-0001-000000000008', 'What is the capital of New Zealand?', '["Auckland", "Wellington", "Christchurch", "Hamilton"]', 'Wellington', 'medium', 3),
('11111111-0001-0001-0001-000000000008', 'Which ocean is the largest?', '["Atlantic", "Indian", "Pacific", "Arctic"]', 'Pacific', 'easy', 4),
('11111111-0001-0001-0001-000000000008', 'Mount Everest is on the border of which two countries?', '["India & China", "Nepal & China", "Nepal & India", "Pakistan & China"]', 'Nepal & China', 'medium', 5),
('11111111-0001-0001-0001-000000000008', 'What is the smallest US state by area?', '["Delaware", "Connecticut", "Rhode Island", "Vermont"]', 'Rhode Island', 'medium', 6),
('11111111-0001-0001-0001-000000000008', 'Which country has the most time zones?', '["Russia", "USA", "France", "China"]', 'France', 'hard', 7),
('11111111-0001-0001-0001-000000000008', 'What is the driest continent on Earth?', '["Africa", "Australia", "Antarctica", "Asia"]', 'Antarctica', 'hard', 8),
('11111111-0001-0001-0001-000000000008', 'Which European city is known as the "City of Love"?', '["Rome", "Venice", "Paris", "Barcelona"]', 'Paris', 'easy', 9),
('11111111-0001-0001-0001-000000000008', 'What country has the shape of a boot?', '["Spain", "Greece", "Italy", "Portugal"]', 'Italy', 'easy', 10);

-- ============================================================
-- QUIZ PACK 9: Pop Culture
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000009', 'Pop Culture Madness', 'Pop Culture');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000009', 'What social media platform has a ghost as its logo?', '["TikTok", "Snapchat", "Twitter", "Instagram"]', 'Snapchat', 'easy', 1),
('11111111-0001-0001-0001-000000000009', 'Who is the richest person in the world (as of 2024)?', '["Jeff Bezos", "Elon Musk", "Bernard Arnault", "Bill Gates"]', 'Elon Musk', 'medium', 2),
('11111111-0001-0001-0001-000000000009', 'What game features characters called Creepers and Endermen?', '["Fortnite", "Roblox", "Minecraft", "Terraria"]', 'Minecraft', 'easy', 3),
('11111111-0001-0001-0001-000000000009', 'Which Kardashian-Jenner is the youngest?', '["Kendall", "Kylie", "Khloe", "Kourtney"]', 'Kylie', 'easy', 4),
('11111111-0001-0001-0001-000000000009', 'What does "NFT" stand for?', '["New File Transfer", "Non-Fungible Token", "Network Function Tool", "Next-Gen Format Type"]', 'Non-Fungible Token', 'medium', 5),
('11111111-0001-0001-0001-000000000009', 'Which streaming service produced "Squid Game"?', '["Amazon Prime", "Disney+", "Netflix", "HBO Max"]', 'Netflix', 'easy', 6),
('11111111-0001-0001-0001-000000000009', 'What year was YouTube founded?', '["2003", "2005", "2007", "2009"]', '2005', 'medium', 7),
('11111111-0001-0001-0001-000000000009', 'Who created Facebook?', '["Steve Jobs", "Mark Zuckerberg", "Jack Dorsey", "Elon Musk"]', 'Mark Zuckerberg', 'easy', 8),
('11111111-0001-0001-0001-000000000009', 'What is the most-followed account on Instagram?', '["Cristiano Ronaldo", "Instagram", "Kylie Jenner", "Selena Gomez"]', 'Instagram', 'hard', 9),
('11111111-0001-0001-0001-000000000009', 'In which year did TikTok launch internationally?', '["2016", "2017", "2018", "2019"]', '2018', 'medium', 10);

-- ============================================================
-- QUIZ PACK 10: British Pub Quiz Classic
-- ============================================================
INSERT INTO quizzes (id, title, category) VALUES
('11111111-0001-0001-0001-000000000010', 'Classic Pub Quiz', 'Mixed');

INSERT INTO questions (quiz_id, text, options, answer, difficulty, question_order) VALUES
('11111111-0001-0001-0001-000000000010', 'What is the currency of Japan?', '["Yuan", "Won", "Yen", "Ringgit"]', 'Yen', 'easy', 1),
('11111111-0001-0001-0001-000000000010', 'How many sides does a hexagon have?', '["5", "6", "7", "8"]', '6', 'easy', 2),
('11111111-0001-0001-0001-000000000010', 'What colour are the stars on the EU flag?', '["White", "Gold", "Silver", "Blue"]', 'Gold', 'easy', 3),
('11111111-0001-0001-0001-000000000010', 'Which English city is known as the Steel City?', '["Birmingham", "Manchester", "Sheffield", "Leeds"]', 'Sheffield', 'medium', 4),
('11111111-0001-0001-0001-000000000010', 'What is the fear of spiders called?', '["Claustrophobia", "Arachnophobia", "Acrophobia", "Agoraphobia"]', 'Arachnophobia', 'easy', 5),
('11111111-0001-0001-0001-000000000010', 'How many pints are in a gallon?', '["4", "6", "8", "10"]', '8', 'medium', 6),
('11111111-0001-0001-0001-000000000010', 'What is the longest-running soap opera in the UK?', '["EastEnders", "Coronation Street", "Emmerdale", "Hollyoaks"]', 'Coronation Street', 'medium', 7),
('11111111-0001-0001-0001-000000000010', 'Which British monarch had the longest reign before Elizabeth II?', '["Victoria", "George III", "Henry VIII", "Edward VII"]', 'Victoria', 'medium', 8),
('11111111-0001-0001-0001-000000000010', 'What is the postcode area for central London?', '["EC1", "W1", "SW1", "WC1"]', 'EC1', 'hard', 9),
('11111111-0001-0001-0001-000000000010', 'How many letters are in the Greek alphabet?', '["22", "24", "26", "28"]', '24', 'medium', 10);

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'Quizzes seeded: ' || COUNT(*) FROM quizzes;
SELECT 'Questions seeded: ' || COUNT(*) FROM questions;
