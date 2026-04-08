CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  password_salt VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  recovery_key_salt VARCHAR(64) NULL,
  recovery_key_hash VARCHAR(255) NULL,
  recovery_key_created_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS programmes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  age_group VARCHAR(120) NULL,
  duration VARCHAR(120) NULL,
  short_description TEXT NULL,
  full_description LONGTEXT NULL,
  highlights_json LONGTEXT NULL,
  subjects_json LONGTEXT NULL,
  theme_color VARCHAR(120) NOT NULL DEFAULT 'bg-blue-50 border-blue-200',
  brochure_url VARCHAR(255) NULL,
  image_url VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NULL,
  content LONGTEXT NULL,
  category VARCHAR(120) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  featured_image_url VARCHAR(255) NULL,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS careers_vacancies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(150) NULL,
  location VARCHAR(150) NULL,
  employment_type VARCHAR(80) NULL,
  experience_level VARCHAR(120) NULL,
  application_deadline DATE NULL,
  short_summary TEXT NULL,
  full_description LONGTEXT NULL,
  requirements_json LONGTEXT NULL,
  application_email VARCHAR(255) NULL,
  external_application_url VARCHAR(255) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  hiring_status VARCHAR(40) NOT NULL DEFAULT 'open',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  position VARCHAR(255) NULL,
  department VARCHAR(255) NULL,
  qualification VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  photo_url VARCHAR(255) NULL,
  bio TEXT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  short_description TEXT NULL,
  image_url VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NULL,
  message TEXT NOT NULL,
  rating TINYINT NOT NULL DEFAULT 5,
  photo_url VARCHAR(255) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(120) NULL,
  image_url VARCHAR(255) NOT NULL,
  description TEXT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'contact',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_number VARCHAR(40) NOT NULL UNIQUE,
  student_first_name VARCHAR(120) NOT NULL,
  student_last_name VARCHAR(120) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(40) NOT NULL,
  class_applying VARCHAR(120) NOT NULL,
  term_applying VARCHAR(120) NOT NULL,
  previous_school VARCHAR(255) NULL,
  parent_name VARCHAR(255) NOT NULL,
  parent_relationship VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  alternate_phone VARCHAR(50) NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(120) NOT NULL,
  medical_information TEXT NULL,
  notes TEXT NULL,
  admin_feedback TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  admin_username VARCHAR(80) NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id INT NULL,
  summary VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_logs_created_at (created_at),
  INDEX idx_activity_logs_admin (admin_id)
);

INSERT INTO site_settings (`key`, `value`) VALUES
  ('admin_brand_name', 'Prestige Admin'),
  ('admin_brand_subtitle', 'School website content desk'),
  ('admin_sidebar_badge', 'Content Manager'),
  ('admin_header_label', 'Prestige Academy CMS'),
  ('school_name', 'Prestige Academy'),
  ('tagline', 'Excellence in Education'),
  ('phone', '+233 30 255 1234'),
  ('alternate_phone', '+233 24 555 6789'),
  ('email', 'info@prestigeacademy.edu.gh'),
  ('address', '15 Academy Drive, East Legon, Accra, Ghana'),
  ('office_hours', 'Monday - Friday: 7:30 AM - 4:30 PM'),
  ('primary_color', '215 65% 18%'),
  ('secondary_color', '42 87% 55%'),
  ('facebook_url', ''),
  ('twitter_url', ''),
  ('instagram_url', ''),
  ('youtube_url', ''),
  ('whatsapp_number', '+233245556789'),
  ('hero_badge', 'Trusted by families across Accra'),
  ('hero_title', 'Raising confident learners and future-ready leaders.'),
  ('hero_subtitle', 'A warm, high-performing Ghanaian school community where strong academics, character, and creativity grow side by side.'),
  ('hero_primary_cta_label', 'Apply Now'),
  ('hero_primary_cta_url', '/admissions/apply'),
  ('hero_secondary_cta_label', 'Book a Visit'),
  ('hero_secondary_cta_url', '/#contact'),
  ('hero_image_url', ''),
  ('about_badge', 'About Us'),
  ('about_title', 'A Legacy of Excellence Since 1998'),
  ('about_subtitle', 'Prestige Academy has been shaping the minds of Ghana''s future leaders for over 25 years with a values-driven and student-centered education.'),
  ('mission_title', 'Our Mission'),
  ('mission_body', 'To provide a transformative educational experience that develops intellectually curious, morally grounded, and socially responsible individuals.'),
  ('vision_title', 'Our Vision'),
  ('vision_body', 'To be a leading center of academic excellence in West Africa, known for producing well-rounded graduates who create positive change.'),
  ('headteacher_label', 'Headteacher''s Message'),
  ('headteacher_name', 'Mrs. Abena Mensah'),
  ('headteacher_title', 'M.Ed, B.Ed - Headteacher'),
  ('headteacher_message', 'Every child who walks through our gates carries the potential to make a meaningful difference. Our responsibility is to nurture that potential with care and excellence.'),
  ('headteacher_image_url', ''),
  ('admissions_badge', 'Admissions'),
  ('admissions_title', 'Begin Your Child''s Journey'),
  ('admissions_subtitle', 'Our admissions process is designed to be simple, transparent, and family-friendly from the first enquiry to enrollment.'),
  ('admissions_step_1_title', 'Submit Application'),
  ('admissions_step_1_desc', 'Complete the online application form with student and parent details.'),
  ('admissions_step_2_title', 'Review Details'),
  ('admissions_step_2_desc', 'Our admissions team reviews your application and follows up if anything else is needed.'),
  ('admissions_step_3_title', 'Assessment & Interview'),
  ('admissions_step_3_desc', 'Eligible applicants are invited for placement support and a brief family interaction.'),
  ('admissions_step_4_title', 'Receive Decision'),
  ('admissions_step_4_desc', 'Successful applicants receive their next-step guidance and enrollment information.'),
  ('cta_title', 'Ready to Join the Prestige Academy Family?'),
  ('cta_body', 'Applications are open and our admissions team is ready to guide you through the next steps.'),
  ('cta_primary_label', 'Apply Now'),
  ('cta_primary_url', '/admissions/apply'),
  ('cta_secondary_label', 'Call Admissions'),
  ('cta_secondary_url', '/#contact'),
  ('contact_badge', 'Contact Us'),
  ('contact_title', 'Get in Touch'),
  ('contact_subtitle', 'Have questions about admissions, programmes, or our school? We would love to hear from you.'),
  ('contact_map_embed_url', ''),
  ('careers_page_title', 'Careers at Prestige Academy'),
  ('careers_intro_text', 'Join a school community that values excellent teaching, strong character, warm collaboration, and long-term student impact.'),
  ('careers_why_work_title', 'Why Work With Us'),
  ('careers_why_work_body', 'We are building a professional school culture where teachers and support staff are respected, developed, and empowered to do meaningful work every day.'),
  ('careers_culture_title', 'Workplace Culture'),
  ('careers_culture_body', 'Our teams thrive in a structured, caring environment that values planning, accountability, teamwork, and a genuine commitment to children and families.'),
  ('careers_benefits_title', 'Benefits and Compensation'),
  ('careers_benefits_body', 'We aim to offer a fair, supportive employment experience with professional growth opportunities, clear communication, and a healthy working rhythm.'),
  ('careers_hr_title', 'HR Contact'),
  ('careers_hr_body', 'For recruitment questions or partnership enquiries, our HR team is available to guide applicants on the next steps.'),
  ('careers_hr_email', 'hr@prestigeacademy.edu.gh'),
  ('careers_hr_phone', '+233 30 255 1234'),
  ('careers_cta_text', 'Explore current opportunities and help shape the future of learning at Prestige Academy.')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO programmes (title, slug, age_group, duration, short_description, full_description, highlights_json, subjects_json, theme_color, sort_order) VALUES
  ('Creche & Nursery', 'creche-nursery', '6 months - 3 years', '3 years', 'A safe, stimulating environment where the youngest learners explore and grow through play-based learning.', 'Our Creche and Nursery programme provides a warm, secure, and stimulating environment for your child''s earliest years of development. Using a Montessori-inspired approach combined with the Ghana Education Service Early Childhood framework, we nurture curiosity, motor skills, language development, and social-emotional growth through purposeful play and exploration.', '["Low child-to-caregiver ratio of 6:1","Montessori-inspired learning materials","Age-appropriate sensory play areas","Daily outdoor exploration time","Nutritious meals and snack programmes","Regular developmental progress reports"]', '["Sensory Play","Language Development","Motor Skills","Music & Movement","Creative Arts","Social Skills"]', 'bg-rose-50 border-rose-200', 1),
  ('Kindergarten', 'kindergarten', '3 - 5 years', '2 years', 'Building foundational literacy, numeracy, and social skills through a creative Montessori-inspired approach.', 'Our Kindergarten programme bridges the transition from early childhood to formal education. Children develop foundational literacy and numeracy skills through hands-on activities, creative play, and structured learning experiences. Our qualified teachers create a joyful learning environment where every child builds confidence and develops a love for learning.', '["Phonics-based reading readiness programme","Hands-on mathematics with manipulatives","Bilingual instruction (English and Ghanaian language)","Weekly music, art, and PE sessions","Field trips and nature exploration","School readiness assessment and support"]', '["Literacy & Phonics","Numeracy","Environmental Studies","Creative Arts","Physical Education","ICT Introduction","French"]', 'bg-blue-50 border-blue-200', 2),
  ('Primary School', 'primary', '6 - 11 years', '6 years', 'A rigorous curriculum covering English, Mathematics, Science, ICT, French, and Ghanaian languages.', 'Our Primary School programme provides a comprehensive, balanced education aligned with the Ghana Education Service curriculum and enriched with international best practices. Students develop strong academic foundations while cultivating critical thinking, creativity, and character.', '["GES-aligned curriculum with Cambridge enrichment","Specialist teachers for Science, ICT, and French","Weekly library sessions and reading programmes","Inter-school competitions and quiz teams","Leadership development through prefect system","Regular parent-teacher conferences"]', '["English Language","Mathematics","Integrated Science","Social Studies","ICT","French","Ghanaian Language","Religious & Moral Education","Creative Arts","Physical Education"]', 'bg-green-50 border-green-200', 3),
  ('Junior High School', 'jhs', '12 - 14 years', '3 years', 'Comprehensive BECE preparation with emphasis on critical thinking, practical skills, and leadership.', 'Our Junior High School programme prepares students thoroughly for the Basic Education Certificate Examination while developing the critical thinking and practical skills needed for senior high school and beyond. We combine rigorous academics with extracurricular enrichment and character development.', '["Consistent BECE pass rates","Dedicated BECE preparation classes","Science laboratory practical sessions","Career guidance and counselling","Debate club and public speaking training","Sports and athletics programmes"]', '["English Language","Mathematics","Integrated Science","Social Studies","ICT","French","Ghanaian Language","Basic Design & Technology","Religious & Moral Education","Physical Education"]', 'bg-amber-50 border-amber-200', 4),
  ('Senior High School', 'shs', '15 - 17 years', '3 years', 'WASSCE and Cambridge preparation streams with specialised science, business, and arts tracks.', 'Our Senior High School programme offers multiple academic tracks to prepare students for the WASSCE and Cambridge International examinations. Students choose from Science, Business, General Arts, or Visual Arts tracks with a strong focus on university readiness and career preparation.', '["WASSCE and Cambridge dual-track options","Fully equipped science and ICT laboratories","University application and scholarship guidance","SAT and IELTS preparation support","Entrepreneurship and leadership programmes","Boarding and day student options"]', '["Core Mathematics","Core English","Core Science","Social Studies","Elective Mathematics","Physics","Chemistry","Biology","Economics","Business Management","Government","Literature"]', 'bg-indigo-50 border-indigo-200', 5)
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO staff (name, slug, position, department, qualification, email, phone, bio, featured, sort_order) VALUES
  ('Mrs. Abena Mensah', 'abena-mensah', 'Headteacher', 'School Leadership', 'M.Ed, B.Ed', 'headteacher@prestigeacademy.edu.gh', '+233 30 255 1234', 'Mrs. Mensah leads the school with a focus on excellence, discipline, and pastoral care for every learner.', 1, 1),
  ('Mr. Kojo Addo', 'kojo-addo', 'Head of Academics', 'Academics', 'MPhil Curriculum Studies', 'academics@prestigeacademy.edu.gh', '+233 24 555 6701', 'Mr. Addo coordinates curriculum quality, teacher coaching, and assessment across the school.', 1, 2),
  ('Mrs. Efua Nartey', 'efua-nartey', 'Admissions Officer', 'Admissions', 'MBA, BSc Administration', 'admissions@prestigeacademy.edu.gh', '+233 24 555 6702', 'Mrs. Nartey supports families through applications, placement, and onboarding for new students.', 1, 3),
  ('Mr. Kwesi Boateng', 'kwesi-boateng', 'ICT Coordinator', 'Technology', 'BSc Computer Science', 'ict@prestigeacademy.edu.gh', '+233 24 555 6703', 'Mr. Boateng oversees digital learning, STEM programmes, and classroom technology integration.', 1, 4)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO faqs (question, answer, sort_order, is_published) VALUES
  ('What age can my child start school at Prestige Academy?', 'Children can begin from 6 months in our Creche and Nursery programme, with pathways through Senior High School.', 1, 1),
  ('Do you offer entrance assessments?', 'Yes. Placement assessments are part of the admissions process for most year groups so we can support each child appropriately.', 2, 1),
  ('Which curriculum do you follow?', 'We follow the Ghana Education Service curriculum and enrich it with practical, literacy, STEM, and leadership experiences.', 3, 1),
  ('How long does the admissions process take?', 'Once the application and required details are submitted, families usually receive feedback within 5 working days.', 4, 1),
  ('Do you provide transport or boarding?', 'Transport options can be arranged by request. Boarding is available for selected senior-level students.', 5, 1),
  ('How do parents communicate with the school?', 'Parents can reach the school by phone, email, scheduled visits, and regular parent-teacher communication channels.', 6, 1)
ON DUPLICATE KEY UPDATE question = VALUES(question);

INSERT INTO blog_posts (title, slug, excerpt, content, category, status, featured_image_url, published_at) VALUES
  ('Prestige Academy Students Excel at National Science Olympiad', 'science-olympiad-2026', 'Our JHS students brought home top honours at the National Science Olympiad in Kumasi.', 'Prestige Academy students distinguished themselves with strong performances in science communication, robotics, and mathematics challenge events. The school community is proud of their discipline and teamwork.', 'Achievements', 'published', '', NOW()),
  ('Open Day: Experience Our Campus This Saturday', 'open-day-campus-tour', 'Families are invited to tour our campus, meet teachers, and learn about admissions.', 'Join us this Saturday for guided tours, classroom showcases, and a chance to speak with our admissions and academic teams.', 'Events', 'published', '', NOW()),
  ('New STEM Lab Officially Commissioned', 'new-stem-lab', 'A new STEM lab is expanding hands-on science and technology learning across the school.', 'The upgraded STEM lab introduces practical workstations, robotics tools, and flexible teaching space for inquiry-based learning.', 'Campus', 'published', '', NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO facilities (title, slug, short_description, image_url, display_order) VALUES
  ('Science Laboratory', 'science-laboratory', 'Fully equipped physics, chemistry, and biology labs for hands-on experimentation.', '', 1),
  ('Modern Library', 'modern-library', 'A welcoming library with reading corners, reference support, and research space.', '', 2),
  ('ICT Centre', 'ict-centre', 'A digital learning hub for coding, research, and classroom technology integration.', '', 3),
  ('Sports Complex', 'sports-complex', 'Football, basketball, athletics, and all-round physical development spaces.', '', 4)
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO testimonials (name, role, message, rating, photo_url, is_published, display_order) VALUES
  ('Mrs. Akosua Boateng', 'Parent, Class 6', 'Prestige Academy has transformed my daughter''s confidence and academic performance. The teachers genuinely care about every child''s progress.', 5, '', 1, 1),
  ('Kwame Asante', 'Alumni, Class of 2020', 'The foundation I received at Prestige Academy prepared me for university and beyond. The values instilled in me continue to guide my life.', 5, '', 1, 2),
  ('Dr. Efua Agyemang', 'Parent, KG2 & JHS1', 'Having two children at different levels, I can attest to the consistency of quality across all programmes. The school is responsive and warm.', 5, '', 1, 3)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO gallery_items (title, category, image_url, description, is_published, display_order) VALUES
  ('Graduation Ceremony', 'Events', '', 'Celebrating student milestones and family achievements.', 1, 1),
  ('Classroom Learning', 'Academics', '', 'Focused, student-centred learning moments across the school.', 1, 2),
  ('Cultural Day', 'Events', '', 'Our students proudly celebrate heritage, music, and creativity.', 1, 3),
  ('School Excursion', 'Activities', '', 'Learning beyond the classroom through guided educational trips.', 1, 4)
ON DUPLICATE KEY UPDATE title = VALUES(title);
