-- Seed data for Broadway Helper database
-- This script populates the database with initial data from initial-data.json

-- Clear existing data (be careful in production!)
TRUNCATE TABLE theater_sections CASCADE;
TRUNCATE TABLE theaters CASCADE;
TRUNCATE TABLE community_tips CASCADE;
TRUNCATE TABLE listings CASCADE;
TRUNCATE TABLE shows CASCADE;

-- Insert theaters
INSERT INTO theaters (name, slug, address) VALUES
('Richard Rodgers Theatre', 'richard-rodgers', '226 West 46th Street'),
('Gershwin Theatre', 'gershwin', '222 West 51st Street');

-- Insert theater sections for Richard Rodgers Theatre
INSERT INTO theater_sections (theater_id, section_name, quality_score, price_range, tip)
SELECT 
    t.id,
    'Orchestra',
    5,
    '$150-$450',
    'Center orchestra rows F-M offer the best views. Avoid partial view seats in far sides.'
FROM theaters t WHERE t.slug = 'richard-rodgers';

INSERT INTO theater_sections (theater_id, section_name, quality_score, price_range, tip)
SELECT 
    t.id,
    'Mezzanine',
    4,
    '$100-$250',
    'Front mezzanine (rows A-C) often better than rear orchestra. Great for full stage view.'
FROM theaters t WHERE t.slug = 'richard-rodgers';

-- Insert theater sections for Gershwin Theatre
INSERT INTO theater_sections (theater_id, section_name, quality_score, price_range, tip)
SELECT 
    t.id,
    'Orchestra',
    5,
    '$120-$350',
    'Largest Broadway theater. Sit center for Wicked''s dragon effect.'
FROM theaters t WHERE t.slug = 'gershwin';

INSERT INTO theater_sections (theater_id, section_name, quality_score, price_range, tip)
SELECT 
    t.id,
    'Mezzanine',
    4,
    '$80-$200',
    'Higher mezzanine is quite far but still good views.'
FROM theaters t WHERE t.slug = 'gershwin';

-- Insert shows
INSERT INTO shows (name, slug, theater, fun_fact, newbie_tip) VALUES
('Hamilton', 'hamilton', 'Richard Rodgers Theatre', 
 'The show''s lottery offers $10 tickets, but odds are about 1 in 300.', 
 'Don''t stress about perfect seats - the staging works well from anywhere. The music carries the show.'),
('Wicked', 'wicked', 'Gershwin Theatre', 
 'Running since 2003, it''s Broadway''s 4th longest-running show.', 
 'Arrive early to take photos at the giant mechanical dragon in the lobby!');

-- Insert sample community tips
INSERT INTO community_tips (show_id, tip_type, content, upvotes)
SELECT 
    s.id,
    'seating',
    'Orchestra doesn''t always mean better - front mezzanine often has superior views',
    15
FROM shows s WHERE s.slug = 'hamilton';

INSERT INTO community_tips (show_id, tip_type, content, upvotes)
SELECT 
    s.id,
    'timing',
    'Wednesday matinees have an older, quieter audience',
    8
FROM shows s WHERE s.slug = 'hamilton';

INSERT INTO community_tips (show_id, tip_type, content, upvotes)
SELECT 
    s.id,
    'general',
    'Rush tickets are same-day discounted tickets, usually requiring morning wait',
    12
FROM shows s WHERE s.slug = 'hamilton';

INSERT INTO community_tips (show_id, tip_type, content, upvotes)
SELECT 
    s.id,
    'seating',
    'Service fees can add 20-30% to the advertised price',
    20
FROM shows s WHERE s.slug = 'wicked';

INSERT INTO community_tips (show_id, tip_type, content, upvotes)
SELECT 
    s.id,
    'general',
    'Avoid buying from street sellers - tickets are often fake',
    25
FROM shows s WHERE s.slug = 'wicked';

-- Insert sample listings (example data - in production these would come from scrapers)
INSERT INTO listings (show_id, source, date, time, section, price, url)
SELECT 
    s.id,
    'TKTS',
    CURRENT_DATE + INTERVAL '1 day',
    '19:00:00',
    'Orchestra',
    225.00,
    'https://www.tdf.org/nyc/7/TKTS-ticket-booths'
FROM shows s WHERE s.slug = 'hamilton';

INSERT INTO listings (show_id, source, date, time, section, price, url)
SELECT 
    s.id,
    'Theatr',
    CURRENT_DATE + INTERVAL '1 day',
    '19:00:00',
    'Mezzanine',
    175.00,
    'https://theatr.com/shows/hamilton'
FROM shows s WHERE s.slug = 'hamilton';

INSERT INTO listings (show_id, source, date, time, section, price, url)
SELECT 
    s.id,
    'TKTS',
    CURRENT_DATE + INTERVAL '2 days',
    '14:00:00',
    'Orchestra',
    150.00,
    'https://www.tdf.org/nyc/7/TKTS-ticket-booths'
FROM shows s WHERE s.slug = 'wicked';

INSERT INTO listings (show_id, source, date, time, section, price, url)
SELECT 
    s.id,
    'Theatr',
    CURRENT_DATE + INTERVAL '2 days',
    '20:00:00',
    'Mezzanine',
    120.00,
    'https://theatr.com/shows/wicked'
FROM shows s WHERE s.slug = 'wicked';

-- Add more general community tips
INSERT INTO community_tips (show_id, tip_type, content, upvotes) VALUES
((SELECT id FROM shows WHERE slug = 'hamilton'), 'timing', 'Not checking the theater location - some are far from subway', 10),
((SELECT id FROM shows WHERE slug = 'wicked'), 'seating', 'Partial view can mean seeing only half the stage', 18),
((SELECT id FROM shows WHERE slug = 'hamilton'), 'general', 'Waiting too long for popular shows - prices only go up', 22),
((SELECT id FROM shows WHERE slug = 'wicked'), 'timing', 'Saturday evening shows tend to have the most energetic audiences', 14);