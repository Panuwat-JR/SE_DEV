CREATE TABLE faculties (
    faculty_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE majors (
    major_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE participant_types (
    participant_type_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE task_statuses (
    status_task_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE,
    code_color VARCHAR(50)
);

CREATE TABLE task_categories (
    task_category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE
);

CREATE TABLE document_statuses (
    doc_status_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100),
    code_color VARCHAR(50)
);

CREATE TABLE document_types (
    document_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100),
    code_color VARCHAR(50),
    description TEXT
);

CREATE TABLE employee_roles ( 
    role_employee_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100)
);

CREATE TABLE priority_levels (
    priority_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code_color VARCHAR(50),
    slug VARCHAR(50)
);

CREATE TABLE event_types (
    event_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100)
);

CREATE TABLE event_categories (
    event_category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100)
);

CREATE TABLE requirement_tags ( 
    requirement_tag_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code_color VARCHAR(50),
    slug VARCHAR(100)
);

CREATE TABLE logistics (
    logistics_id SERIAL PRIMARY KEY,
    format VARCHAR(100), 
    location VARCHAR(255),
    max_participant INT
);

CREATE TABLE status_events ( 
    status_event_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100)
);

CREATE TABLE organizers (
    organizer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    contact VARCHAR(255)
);

CREATE TABLE team_docs ( 
    team_doc_id SERIAL PRIMARY KEY,
    file_name VARCHAR(255),
    file_storage_path TEXT,
    file_type VARCHAR(50),
    file_size INT,
    event_name VARCHAR(255),
    task_name VARCHAR(255)
);

CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_doc_id INT, 
    name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_teams_doc FOREIGN KEY (team_doc_id) REFERENCES team_docs(team_doc_id) ON DELETE SET NULL
);

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_type_id INT,
    event_category_id INT,
    logistics_id INT,
    requirement_tag_id INT,
    status_event_id INT,
    organizer_id INT,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    registration_start_date TIMESTAMP,
    registration_end_date TIMESTAMP,
    event_start_date TIMESTAMP,
    event_end_date TIMESTAMP,
    announcement_date TIMESTAMP,
    prize_pool DECIMAL(15, 2),
    is_team_based BOOLEAN DEFAULT FALSE, 
    max_team_member INT,
    min_team_member INT,
    budget DECIMAL(15, 2),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_type FOREIGN KEY (event_type_id) REFERENCES event_types(event_type_id),
    CONSTRAINT fk_event_category FOREIGN KEY (event_category_id) REFERENCES event_categories(event_category_id),
    CONSTRAINT fk_event_logistics FOREIGN KEY (logistics_id) REFERENCES logistics(logistics_id),
    CONSTRAINT fk_event_req_tag FOREIGN KEY (requirement_tag_id) REFERENCES requirement_tags(requirement_tag_id),
    CONSTRAINT fk_event_status FOREIGN KEY (status_event_id) REFERENCES status_events(status_event_id),
    CONSTRAINT fk_event_organizer FOREIGN KEY (organizer_id) REFERENCES organizers(organizer_id)
);

CREATE TABLE employee_profiles (
    employee_profile_id SERIAL PRIMARY KEY,
    role_employee_id INT,
    department_id INT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    gender VARCHAR(20),
    birthday_date DATE,
    profile_img TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_emp_profile_role FOREIGN KEY (role_employee_id) REFERENCES employee_roles(role_employee_id),
    CONSTRAINT fk_emp_profile_dept FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    employee_profile_id INT UNIQUE NOT NULL, 
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    last_login_at TIMESTAMP,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    online_status VARCHAR(50),

    CONSTRAINT fk_employee_profile FOREIGN KEY (employee_profile_id) REFERENCES employee_profiles(employee_profile_id) ON DELETE CASCADE
);

CREATE TABLE participant_profiles (
    participant_profile_id SERIAL PRIMARY KEY,
    team_id INT,
    major_id INT,
    faculty_id INT, 
    participant_type_id INT,
    gender VARCHAR(20),
    prefix VARCHAR(20),
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    phone_number VARCHAR(50),
    student_id VARCHAR(50),
    year_of_study INT,
    occupation VARCHAR(100),
    organization VARCHAR(150),
    national_id VARCHAR(50),
    dietary_reg TEXT, 
    birthday_date DATE, 
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pp_team FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL,
    CONSTRAINT fk_pp_major FOREIGN KEY (major_id) REFERENCES majors(major_id),
    CONSTRAINT fk_pp_faculty FOREIGN KEY (faculty_id) REFERENCES faculties(faculty_id),
    CONSTRAINT fk_pp_type FOREIGN KEY (participant_type_id) REFERENCES participant_types(participant_type_id)
);

CREATE TABLE participants (
    participant_id SERIAL PRIMARY KEY,
    participant_profile_id INT UNIQUE NOT NULL, 
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    last_login_at TIMESTAMP,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    online_status_at TIMESTAMP,

    CONSTRAINT fk_participant_profile FOREIGN KEY (participant_profile_id) REFERENCES participant_profiles(participant_profile_id) ON DELETE CASCADE
);

CREATE TABLE document_templates (
    doc_template_id SERIAL PRIMARY KEY,
    document_type_id INT,
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    content_body TEXT,
    content_header TEXT,
    content_footer TEXT,
    orientation VARCHAR(50), 
    place_holders TEXT, 
    mapping_logic TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_doc_temp_type FOREIGN KEY (document_type_id) REFERENCES document_types(document_type_id)
);

CREATE TABLE documents (
    document_id SERIAL PRIMARY KEY,
    doc_status_id INT,
    name VARCHAR(255) NOT NULL,
    is_digital_signed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    doc_metadata TEXT,
    generation_status VARCHAR(50),
    file_storage_path TEXT,
    file_type VARCHAR(50),
    file_size INT,

    CONSTRAINT fk_doc_status FOREIGN KEY (doc_status_id) REFERENCES document_statuses(doc_status_id)
);

CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    event_id INT,
    status_task_id INT,
    priority_id INT,
    task_category_id INT,
    task_name VARCHAR(255) NOT NULL,
    due_date TIMESTAMP,
    description TEXT,
    progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    start_date TIMESTAMP,
    actual_finished_date TIMESTAMP,

    CONSTRAINT fk_task_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT fk_task_status FOREIGN KEY (status_task_id) REFERENCES task_statuses(status_task_id),
    CONSTRAINT fk_task_priority FOREIGN KEY (priority_id) REFERENCES priority_levels(priority_id),
    CONSTRAINT fk_task_category FOREIGN KEY (task_category_id) REFERENCES task_categories(task_category_id)
);

CREATE TABLE feedbacks (
    feedback_id SERIAL PRIMARY KEY,
    participant_id INT NOT NULL,
    comment TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_feedback_participant FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE
);

CREATE TABLE mapping_event_teams (
    event_id INT NOT NULL,
    team_id INT NOT NULL,
    PRIMARY KEY (event_id, team_id),
    CONSTRAINT fk_map_et_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT fk_map_et_team FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

CREATE TABLE mapping_event_employees (
    event_id INT NOT NULL,
    employee_id INT NOT NULL,
    PRIMARY KEY (event_id, employee_id),
    CONSTRAINT fk_map_ee_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT fk_map_ee_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

CREATE TABLE mapping_doc_tasks (
    task_id INT NOT NULL,
    document_id INT NOT NULL,
    PRIMARY KEY (task_id, document_id),
    CONSTRAINT fk_map_dt_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    CONSTRAINT fk_map_dt_doc FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
);

CREATE TABLE mapping_template_docs (
    document_id INT NOT NULL,
    doc_template_id INT NOT NULL,
    PRIMARY KEY (document_id, doc_template_id),
    CONSTRAINT fk_map_td_doc FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE,
    CONSTRAINT fk_map_td_temp FOREIGN KEY (doc_template_id) REFERENCES document_templates(doc_template_id) ON DELETE CASCADE
);