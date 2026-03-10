-- =============================================
-- SAHAYAK-DRISHTI — SEED DATA
-- Runs automatically on application startup
-- =============================================

-- Clear existing data (safe for create-drop mode)
DELETE FROM location;

-- -----------------------------------------------
-- INSERT ALL CAMPUS LOCATIONS
-- Fields: id, location_key, name_en, name_hi,
--         script_en, script_hi, floor, building, active
-- -----------------------------------------------

INSERT INTO location (id, location_key, name_en, name_hi, script_en, script_hi, floor, building, active) VALUES
(1, 'main_entrance',
 'Main Entrance',
 'मुख्य प्रवेश द्वार',
 'Welcome. You are at the Main Entrance of the campus. The Security Check Post is directly in front of you. The Administrative Block is 50 steps ahead on your right. The Academic Block is 100 steps ahead on your left. The Canteen is to your far right. Please proceed carefully and follow the tactile path.',
 'स्वागत है। आप परिसर के मुख्य प्रवेश द्वार पर हैं। सुरक्षा जांच चौकी आपके सामने है। प्रशासनिक खंड आपके दाईं ओर 50 कदम आगे है। शैक्षणिक खंड आपके बाईं ओर 100 कदम आगे है। कैंटीन आपके दाईं ओर दूर है। कृपया सावधानी से आगे बढ़ें।',
 'Ground', 'Campus Gate', true),

(2, 'library_entry',
 'Main Library — Entry',
 'मुख्य पुस्तकालय — प्रवेश',
 'You are at the Main Library entrance. The book issue and return counter is 10 steps straight ahead. The reading hall is to your right. The digital resource center is to your left. Library timings are 9 AM to 9 PM on weekdays, and 10 AM to 5 PM on weekends. Please maintain silence inside.',
 'आप मुख्य पुस्तकालय के प्रवेश द्वार पर हैं। पुस्तक जारी करने और वापसी काउंटर 10 कदम सीधे आगे है। पठन कक्ष आपकी दाईं ओर है। डिजिटल संसाधन केंद्र आपकी बाईं ओर है। पुस्तकालय समय सुबह 9 से रात 9 बजे तक है। अंदर चुप्पी बनाए रखें।',
 'Ground', 'Library Block', true),

(3, 'library_counter',
 'Library — Issue & Return Counter',
 'पुस्तकालय — जारी और वापसी काउंटर',
 'You are at the Library Issue and Return Counter. To borrow a book, present your library card to the librarian. Books can be borrowed for 14 days. To return a book, place it on the return tray on your left. For renewal, speak to the staff at this counter. Fine for late returns is 2 rupees per day.',
 'आप पुस्तकालय जारी और वापसी काउंटर पर हैं। पुस्तक उधार लेने के लिए, अपना पुस्तकालय कार्ड पुस्तकाध्यक्ष को दिखाएं। पुस्तकें 14 दिनों के लिए उधार ली जा सकती हैं। वापस करने के लिए, बाईं ओर ट्रे में रखें। नवीनीकरण के लिए कर्मचारी से बात करें। देर से वापसी पर 2 रुपये प्रति दिन जुर्माना है।',
 'Ground', 'Library Block', true),

(4, 'admin_block',
 'Administrative Block',
 'प्रशासनिक खंड',
 'You are at the Administrative Block. The Principal office is on the first floor, Room 101. The Accounts Section is on the ground floor to your right. The Scholarship Section is on the ground floor to your left. The Examination Cell is on the second floor. Lifts are straight ahead. Office hours are 10 AM to 5 PM on weekdays.',
 'आप प्रशासनिक खंड में हैं। प्रधानाचार्य कार्यालय पहली मंजिल पर कक्ष 101 में है। लेखा अनुभाग भूतल पर दाईं ओर है। छात्रवृत्ति अनुभाग भूतल पर बाईं ओर है। परीक्षा प्रकोष्ठ दूसरी मंजिल पर है। लिफ्ट सीधे आगे है। कार्यालय समय सुबह 10 से शाम 5 बजे तक है।',
 'Ground', 'Admin Block', true),

(5, 'scholarship_section',
 'Scholarship Section',
 'छात्रवृत्ति अनुभाग',
 'You are at the Scholarship Section. Please form a queue here. To collect scholarship forms, go to Counter Number 1, straight ahead. To submit filled forms, go to Counter Number 2, on your right. For status enquiry, go to Counter Number 3, on your left. Please carry your student ID and fee receipt. Office hours are 10 AM to 4 PM, Monday to Friday.',
 'आप छात्रवृत्ति अनुभाग में हैं। कृपया यहाँ कतार बनाएं। फॉर्म लेने के लिए काउंटर 1 पर जाएं। भरे फॉर्म जमा करने के लिए काउंटर 2 पर जाएं। स्थिति पूछताछ के लिए काउंटर 3 पर जाएं। छात्र पहचान पत्र और शुल्क रसीद साथ लाएं। समय सुबह 10 से शाम 4 बजे तक।',
 'Ground', 'Admin Block', true),

(6, 'exam_cell',
 'Examination Cell',
 'परीक्षा प्रकोष्ठ',
 'You are at the Examination Cell, Second Floor. For admit cards, go to Counter 1 on your left. For result and marksheet queries, go to Counter 2 on your right. For re-evaluation requests, go to Counter 3 at the far end. Please carry your student ID card. Office hours are 10 AM to 3 PM on working days only.',
 'आप परीक्षा प्रकोष्ठ में हैं, दूसरी मंजिल। प्रवेश पत्र के लिए बाईं ओर काउंटर 1 पर जाएं। परिणाम और अंकपत्र के लिए दाईं ओर काउंटर 2 पर जाएं। पुनर्मूल्यांकन के लिए दूर काउंटर 3 पर जाएं। छात्र पहचान पत्र साथ लाएं। समय सुबह 10 से दोपहर 3 बजे तक।',
 'Second', 'Admin Block', true),

(7, 'canteen',
 'Campus Canteen',
 'कैंपस कैंटीन',
 'You are at the Campus Canteen. The order counter is 15 steps straight ahead. Seating area is to your right. Vegetarian food is served at the right side of the counter, non-vegetarian on the left. Today menu is displayed on the board. Drinking water is available at the far left wall. Timings are 8 AM to 8 PM daily.',
 'आप कैंपस कैंटीन में हैं। ऑर्डर काउंटर 15 कदम सीधे आगे है। बैठने का क्षेत्र दाईं ओर है। शाकाहारी भोजन काउंटर के दाईं ओर और मांसाहारी बाईं ओर परोसा जाता है। मेनू बोर्ड पर है। पेयजल दूर बाईं दीवार पर उपलब्ध है। समय सुबह 8 से रात 8 बजे तक।',
 'Ground', 'Canteen Block', true),

(8, 'medical_room',
 'Campus Medical Room',
 'कैंपस चिकित्सा कक्ष',
 'You are at the Campus Medical Room. A nurse is available from 9 AM to 5 PM on weekdays. The doctor visits on Tuesdays and Thursdays from 11 AM to 1 PM. For emergencies outside these hours, press the red buzzer on the door. For life-threatening emergencies, immediately call 112 for an ambulance. The nearest hospital is 2 kilometers from campus.',
 'आप कैंपस चिकित्सा कक्ष में हैं। नर्स सोमवार से शुक्रवार सुबह 9 से शाम 5 बजे उपलब्ध है। डॉक्टर मंगलवार और गुरुवार को सुबह 11 से दोपहर 1 बजे आते हैं। आपातकाल के लिए दरवाजे पर लाल बजर दबाएं। जानलेवा आपातकाल के लिए तुरंत 112 पर कॉल करें।',
 'Ground', 'Main Block', true),

(9, 'hostel_entry',
 'Hostel Entry Gate',
 'छात्रावास प्रवेश द्वार',
 'You are at the Hostel Entry Gate. Boys Hostel is 30 steps to your right. Girls Hostel is 30 steps to your left. The warden office is straight ahead. All visitors must register at the security desk before entering. Hostel entry is permitted from 6 AM to 10 PM only. Carry your student ID at all times.',
 'आप छात्रावास प्रवेश द्वार पर हैं। बॉयज़ हॉस्टल 30 कदम दाईं ओर है। गर्ल्स हॉस्टल 30 कदम बाईं ओर है। वार्डन कार्यालय सीधे आगे है। सभी आगंतुकों को सुरक्षा डेस्क पर पंजीकरण करना होगा। प्रवेश सुबह 6 से रात 10 बजे तक।',
 'Ground', 'Hostel Zone', true),

(10, 'sports_complex',
 'Sports Complex',
 'खेल परिसर',
 'You are at the Sports Complex entrance. The indoor games hall including table tennis and badminton is to your right. The gymnasium is to your left. The outdoor cricket and football grounds are straight ahead, 50 steps. Borrow sports equipment from Counter 1, to your right. Timings are 6 AM to 9 PM daily. Please wear proper sports shoes.',
 'आप खेल परिसर के प्रवेश द्वार पर हैं। इनडोर खेल हॉल दाईं ओर है। व्यायामशाला बाईं ओर है। बाहरी मैदान 50 कदम आगे है। खेल उपकरण काउंटर 1 से उधार लें। समय सुबह 6 से रात 9 बजे तक। उचित खेल जूते पहनें।',
 'Ground', 'Sports Block', true),

(11, 'parking_area',
 'Campus Parking',
 'कैंपस पार्किंग',
 'You are at the Campus Parking Area. Two-wheeler parking is to your right. Four-wheeler parking is straight ahead. Visitor parking is marked in yellow, to your left. Please lock your vehicle and carry your keys. Parking is monitored by CCTV cameras. Report any suspicious activity to security at extension 100.',
 'आप कैंपस पार्किंग क्षेत्र में हैं। दोपहिया पार्किंग दाईं ओर है। चार पहिया पार्किंग सीधे आगे है। आगंतुक पार्किंग बाईं ओर पीले रंग में चिह्नित है। वाहन लॉक करें और चाबी साथ रखें। सुरक्षा के लिए एक्सटेंशन 100 पर कॉल करें।',
 'Ground', 'Parking Zone', true),

(12, 'washroom_ground',
 'Ground Floor Washroom — Admin Block',
 'भूतल शौचालय — प्रशासनिक खंड',
 'You are near the Ground Floor Washroom of the Administrative Block. The washroom entrance is 5 steps ahead. Push the door to enter. Ladies washroom is on your right. Gents washroom is on your left. This washroom is accessible for persons with disabilities. An emergency call button is available inside.',
 'आप प्रशासनिक खंड के भूतल शौचालय के पास हैं। प्रवेश 5 कदम आगे है। दरवाजा धकेलकर अंदर जाएं। महिला शौचालय दाईं ओर है। पुरुष शौचालय बाईं ओर है। यह शौचालय दिव्यांगजनों के लिए सुलभ है।',
 'Ground', 'Admin Block', true),

(13, 'atm',
 'Campus ATM',
 'कैंपस एटीएम',
 'You are at the Campus ATM. The ATM machine is 3 steps directly ahead of you. This is a State Bank of India ATM. For assistance operating the machine, a security guard is present during banking hours, 9 AM to 5 PM. For ATM related complaints, call the toll-free number 1800-11-2211.',
 'आप कैंपस एटीएम पर हैं। एटीएम मशीन 3 कदम सीधे आगे है। यह स्टेट बैंक ऑफ इंडिया का एटीएम है। बैंकिंग घंटों में सुबह 9 से शाम 5 बजे तक सुरक्षा गार्ड सहायता के लिए उपलब्ध है। एटीएम शिकायत के लिए 1800-11-2211 पर कॉल करें।',
 'Ground', 'Main Block', true),

(14, 'principal_office',
 'Principal Office',
 'प्रधानाचार्य कार्यालय',
 'You are outside the Principal Office, Room 101, First Floor. Please knock and wait before entering. The Personal Assistant desk is inside the door to your left. For appointments, speak to the PA at extension 101. Office hours are 10 AM to 1 PM and 2 PM to 4 PM on weekdays. Please ensure your student or staff ID is ready.',
 'आप प्रधानाचार्य कार्यालय, कक्ष 101, पहली मंजिल के बाहर हैं। अंदर जाने से पहले दस्तक दें और प्रतीक्षा करें। पीए डेस्क दरवाजे के अंदर बाईं ओर है। अपॉइंटमेंट के लिए एक्सटेंशन 101 पर कॉल करें। समय सुबह 10 से 1 और दोपहर 2 से शाम 4 बजे।',
 'First', 'Admin Block', true);

ALTER TABLE location ALTER COLUMN id RESTART WITH 15;
