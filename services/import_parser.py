import re
from typing import Optional

def parse_resume_text(text: str) -> dict:
    """Parse extracted text into resume data structure"""
    data = {
        "basics": {"name": "", "email": "", "phone": "", "location": "", "summary": ""},
        "education": [],
        "work": [],
        "projects": [],
        "skills": [],
        "awards": []
    }
    
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    email_match = re.search(r'[\w.-]+@[\w.-]+\.\w+', text)
    if email_match:
        data["basics"]["email"] = email_match.group()
    
    phone_match = re.search(r'1[3-9]\d{9}|0\d{2,3}-?\d{7,8}', text)
    if phone_match:
        data["basics"]["phone"] = phone_match.group()
    
    if lines:
        data["basics"]["name"] = lines[0]
    
    section_keywords = {
        "education": ["教育", "学历", "education", "学经历", "教育背景"],
        "work": ["工作", "经验", "experience", "work", "职业", "工作经历", "工作背景"],
        "projects": ["项目", "project", "作品", "项目经历"],
        "skills": ["技能", "技术", "skill", "能力", "技术栈", "专业技能"],
        "awards": ["荣誉", "奖项", "award", "获奖", "荣誉奖项"]
    }
    
    date_pattern = r'\d{4}[-./年]?\d{0,2}[-./月]?\d{0,2}[-./日]?\s*[-~—到至现]*\s*\d{0,4}[-./年]?\d{0,2}[-./月]?\d{0,2}[-./日]?'
    single_date_pattern = r'\d{4}[-./年]\d{1,2}[-./月]?\d{0,2}'
    
    current_section = None
    section_data = {"education": [], "work": [], "projects": [], "skills": [], "awards": []}
    current_item = {}
    
    for line in lines[1:]:
        line_lower = line.lower()
        
        found_section = None
        for section, keywords in section_keywords.items():
            for kw in keywords:
                if kw in line_lower or kw in line:
                    found_section = section
                    break
            if found_section:
                break
        
        if found_section:
            if current_section and current_item:
                section_data[current_section].append(current_item)
                current_item = {}
            current_section = found_section
            continue
        
        if current_section == "skills":
            for skill in re.split(r'[,、|/\s]+', line):
                skill = skill.strip()
                if skill and len(skill) > 1 and not re.match(r'^\d+$', skill):
                    section_data["skills"].append(skill)
        elif current_section == "education":
            if not current_item:
                current_item = {"school": "", "degree": "", "major": "", "date": "", "description": ""}
            date_match = re.search(date_pattern, line)
            single_date = re.search(single_date_pattern, line)
            if date_match:
                current_item["date"] = date_match.group()
            elif single_date and not current_item.get("school"):
                current_item["date"] = single_date.group()
            elif not current_item.get("school"):
                current_item["school"] = line
            else:
                current_item["description"] = (current_item.get("description", "") + " " + line).strip()
        elif current_section == "work":
            if not current_item:
                current_item = {"company": "", "position": "", "date": "", "description": "", "highlights": []}
            date_match = re.search(date_pattern, line)
            if date_match:
                current_item["date"] = date_match.group()
            elif not current_item.get("company"):
                current_item["company"] = line
            elif not current_item.get("position"):
                current_item["position"] = line
            else:
                current_item["description"] = (current_item.get("description", "") + " " + line).strip()
        elif current_section == "projects":
            if not current_item:
                current_item = {"name": "", "date": "", "description": "", "highlights": []}
            date_match = re.search(date_pattern, line)
            if date_match:
                current_item["date"] = date_match.group()
            elif not current_item.get("name"):
                current_item["name"] = line
            else:
                current_item["description"] = (current_item.get("description", "") + " " + line).strip()
        elif current_section == "awards":
            if not current_item:
                current_item = {"title": "", "date": "", "description": ""}
            date_match = re.search(single_date_pattern, line)
            if date_match:
                current_item["date"] = date_match.group()
            elif not current_item.get("title"):
                current_item["title"] = line
            else:
                current_item["description"] = (current_item.get("description", "") + " " + line).strip()
    
    if current_section and current_item:
        section_data[current_section].append(current_item)
    
    data.update(section_data)
    
    if not data["basics"].get("summary"):
        for line in lines[1:5]:
            if len(line) > 20 and not re.search(r'@|1[3-9]\d{9}', line):
                data["basics"]["summary"] = line
                break
    
    return data
