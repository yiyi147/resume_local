from jinja2 import Template

TEMPLATES = {
    "modern": """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; line-height: 1.6; }
.resume { max-width: 800px; margin: 0 auto; padding: 40px; }
.header { display: flex; align-items: center; gap: 24px; margin-bottom: 30px; border-bottom: 2px solid {{ style.get('primary_color', '#2563eb') }}; padding-bottom: 20px; }
.header-info { flex: 1; }
.header-info h1 { font-size: 28px; color: {{ style.get('primary_color', '#2563eb') }}; margin-bottom: 5px; }
.header-info p { color: #666; font-size: 14px; }
.photo { width: 100px; height: 100px; object-fit: cover; border: 3px solid {{ style.get('primary_color', '#2563eb') }}; }
.photo-circle { border-radius: 50%; }
.photo-square { border-radius: 8px; }
.photo-rounded { border-radius: 16px; }
.section { margin-bottom: 24px; }
.section h2 { font-size: 18px; color: {{ style.get('primary_color', '#2563eb') }}; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
.item { margin-bottom: 16px; }
.item-header { display: flex; justify-content: space-between; align-items: baseline; }
.item-title { font-weight: 600; font-size: 16px; }
.item-subtitle { color: #666; font-size: 14px; }
.item-date { color: #999; font-size: 13px; }
.item-desc { margin-top: 6px; font-size: 14px; color: #555; }
.skills { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-tag { background: {{ style.get('primary_color', '#2563eb') }}20; color: {{ style.get('primary_color', '#2563eb') }}; padding: 4px 12px; border-radius: 4px; font-size: 13px; }
</style>
</head>
<body>
<div class="resume">
{% if data.get('basics') %}
<div class="header">
<div class="header-info">
<h1>{{ data.basics.get('name', '') }}</h1>
<p>{{ data.basics.get('email', '') }} {% if data.basics.get('phone') %} | {{ data.basics.phone }}{% endif %} {% if data.basics.get('location') %} | {{ data.basics.location }}{% endif %}</p>
{% if data.basics.get('summary') %}<p style="margin-top:10px">{{ data.basics.summary }}</p>{% endif %}
</div>
{% if data.basics.get('photo') %}
<img src="{{ data.basics.photo }}" alt="头像" class="photo {% if data.basics.get('photo_shape', 'circle') == 'circle' %}photo-circle{% elif data.basics.get('photo_shape', 'circle') == 'square' %}photo-square{% else %}photo-rounded{% endif %}">
{% endif %}
</div>
{% endif %}

{% for section in section_order %}
{% if section != 'basics' %}
{% if section == 'education' and data.get('education') %}
<div class="section">
<h2>教育背景</h2>
{% for edu in data.education %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ edu.get('school', '') }}</span>
<span class="item-date">{{ edu.get('date', '') }}</span>
</div>
<div class="item-subtitle">{{ edu.get('degree', '') }} - {{ edu.get('major', '') }}</div>
{% if edu.get('description') %}<div class="item-desc">{{ edu.description }}</div>{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if section == 'work' and data.get('work') %}
<div class="section">
<h2>工作经历</h2>
{% for work in data.work %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ work.get('company', '') }}</span>
<span class="item-date">{{ work.get('date', '') }}</span>
</div>
<div class="item-subtitle">{{ work.get('position', '') }}</div>
{% if work.get('description') %}<div class="item-desc">{{ work.description }}</div>{% endif %}
{% if work.get('highlights') %}
<ul style="margin-top:6px;padding-left:20px;font-size:14px;color:#555">
{% for h in work.highlights %}<li>{{ h }}</li>{% endfor %}
</ul>
{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if section == 'projects' and data.get('projects') %}
<div class="section">
<h2>项目经历</h2>
{% for proj in data.projects %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ proj.get('name', '') }}</span>
<span class="item-date">{{ proj.get('date', '') }}</span>
</div>
{% if proj.get('description') %}<div class="item-desc">{{ proj.description }}</div>{% endif %}
{% if proj.get('highlights') %}
<ul style="margin-top:6px;padding-left:20px;font-size:14px;color:#555">
{% for h in proj.highlights %}<li>{{ h }}</li>{% endfor %}
</ul>
{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if section == 'skills' and data.get('skills') %}
<div class="section">
<h2>专业技能</h2>
<div class="skills">
{% for skill in data.skills %}
<span class="skill-tag">{{ skill.get('name', skill) if skill is mapping else skill }}</span>
{% endfor %}
</div>
</div>
{% endif %}

{% if section == 'awards' and data.get('awards') %}
<div class="section">
<h2>荣誉奖项</h2>
{% for award in data.awards %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ award.get('title', '') }}</span>
<span class="item-date">{{ award.get('date', '') }}</span>
</div>
{% if award.get('description') %}<div class="item-desc">{{ award.description }}</div>{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if section.startswith('custom_') and 'items' in section_data.get(section, {}) %}
{% set custom_section = section_data[section] %}
{% if custom_section['items'] %}
<div class="section">
<h2>{{ custom_section.get('title', '自定义') }}</h2>
{% for item in custom_section['items'] %}
<div class="item">
{% if item.get('title') %}<div class="item-title">{{ item.title }}</div>{% endif %}
{% if item.get('content') %}<div class="item-desc">{{ item.content }}</div>{% endif %}
</div>
{% endfor %}
</div>
{% endif %}
{% endif %}
{% endif %}
{% endfor %}
</div>
</body>
</html>
""",

    "classic": """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Times New Roman', serif; color: #000; line-height: 1.5; }
.resume { max-width: 800px; margin: 0 auto; padding: 40px; }
.header { display: flex; align-items: center; gap: 24px; margin-bottom: 25px; border-bottom: 3px double #000; padding-bottom: 15px; }
.header-info { flex: 1; text-align: center; }
.header-info h1 { font-size: 32px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; }
.header-info p { font-size: 14px; color: #333; }
.photo { width: 100px; height: 100px; object-fit: cover; border: 2px solid #000; }
.photo-circle { border-radius: 50%; }
.photo-square { border-radius: 0; }
.photo-rounded { border-radius: 8px; }
.section { margin-bottom: 20px; }
.section h2 { font-size: 16px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; letter-spacing: 1px; }
.item { margin-bottom: 14px; }
.item-header { display: flex; justify-content: space-between; }
.item-title { font-weight: bold; font-size: 15px; }
.item-date { font-size: 13px; font-style: italic; }
.item-subtitle { font-size: 14px; font-style: italic; color: #333; }
.item-desc { margin-top: 4px; font-size: 14px; }
.skills { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag { border: 1px solid #000; padding: 2px 8px; font-size: 12px; }
</style>
</head>
<body>
<div class="resume">
{% if data.get('basics') %}
<div class="header">
<div class="header-info">
<h1>{{ data.basics.get('name', '') }}</h1>
<p>{{ data.basics.get('email', '') }} {% if data.basics.get('phone') %} | {{ data.basics.phone }}{% endif %} {% if data.basics.get('location') %} | {{ data.basics.location }}{% endif %}</p>
</div>
{% if data.basics.get('photo') %}
<img src="{{ data.basics.photo }}" alt="头像" class="photo {% if data.basics.get('photo_shape', 'circle') == 'circle' %}photo-circle{% elif data.basics.get('photo_shape', 'circle') == 'square' %}photo-square{% else %}photo-rounded{% endif %}">
{% endif %}
</div>
{% if data.get('basics').get('summary') %}
<p style="margin-bottom:20px;font-style:italic">{{ data.basics.summary }}</p>
{% endif %}
{% endif %}

{% if data.get('education') %}
<div class="section">
<h2>Education</h2>
{% for edu in data.education %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ edu.get('school', '') }}</span>
<span class="item-date">{{ edu.get('date', '') }}</span>
</div>
<div class="item-subtitle">{{ edu.get('degree', '') }} - {{ edu.get('major', '') }}</div>
{% if edu.get('description') %}<div class="item-desc">{{ edu.description }}</div>{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if data.get('work') %}
<div class="section">
<h2>Work Experience</h2>
{% for work in data.work %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ work.get('company', '') }}</span>
<span class="item-date">{{ work.get('date', '') }}</span>
</div>
<div class="item-subtitle">{{ work.get('position', '') }}</div>
{% if work.get('description') %}<div class="item-desc">{{ work.description }}</div>{% endif %}
{% if work.get('highlights') %}
<ul style="margin-top:4px;padding-left:20px;font-size:13px">
{% for h in work.highlights %}<li>{{ h }}</li>{% endfor %}
</ul>
{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if data.get('projects') %}
<div class="section">
<h2>Projects</h2>
{% for proj in data.projects %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ proj.get('name', '') }}</span>
<span class="item-date">{{ proj.get('date', '') }}</span>
</div>
{% if proj.get('description') %}<div class="item-desc">{{ proj.description }}</div>{% endif %}
{% if proj.get('highlights') %}
<ul style="margin-top:4px;padding-left:20px;font-size:13px">
{% for h in proj.highlights %}<li>{{ h }}</li>{% endfor %}
</ul>
{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if data.get('skills') %}
<div class="section">
<h2>Skills</h2>
<div class="skills">
{% for skill in data.skills %}
<span class="skill-tag">{{ skill.get('name', skill) if skill is mapping else skill }}</span>
{% endfor %}
</div>
</div>
{% endif %}

{% if data.get('awards') %}
<div class="section">
<h2>Awards</h2>
{% for award in data.awards %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ award.get('title', '') }}</span>
<span class="item-date">{{ award.get('date', '') }}</span>
</div>
{% if award.get('description') %}<div class="item-desc">{{ award.description }}</div>{% endif %}
</div>
{% endfor %}
</div>
{% endif %}
</div>
</body>
</html>
""",

    "tech": """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'SF Mono', 'Fira Code', monospace; color: #1a1a2e; line-height: 1.5; background: #f8f9fa; }
.resume { max-width: 800px; margin: 0 auto; padding: 30px; background: white; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid {{ style.get('primary_color', '#0ea5e9') }}; }
.header-left { flex: 1; }
.header-left h1 { font-size: 24px; color: {{ style.get('primary_color', '#0ea5e9') }}; }
.header-left p { color: #666; font-size: 13px; margin-top: 4px; }
.photo { width: 80px; height: 80px; object-fit: cover; border: 2px solid {{ style.get('primary_color', '#0ea5e9') }}; }
.photo-circle { border-radius: 50%; }
.photo-square { border-radius: 4px; }
.photo-rounded { border-radius: 12px; }
.header-right { text-align: right; font-size: 12px; color: #666; }
.section { margin-bottom: 20px; }
.section h2 { font-size: 14px; color: {{ style.get('primary_color', '#0ea5e9') }}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding: 6px 10px; background: {{ style.get('primary_color', '#0ea5e9') }}10; border-left: 3px solid {{ style.get('primary_color', '#0ea5e9') }}; }
.item { margin-bottom: 14px; padding-left: 10px; }
.item-header { display: flex; justify-content: space-between; }
.item-title { font-weight: 600; font-size: 14px; }
.item-date { color: #888; font-size: 12px; }
.item-subtitle { color: #555; font-size: 13px; }
.item-desc { margin-top: 4px; font-size: 13px; color: #444; }
.skills { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag { background: #e0f2fe; color: {{ style.get('primary_color', '#0ea5e9') }}; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-family: monospace; }
</style>
</head>
<body>
<div class="resume">
{% if data.get('basics') %}
<div class="header">
<div class="header-left">
<h1>{{ data.basics.get('name', '') }}</h1>
<p>{{ data.basics.get('email', '') }} {% if data.basics.get('phone') %} | {{ data.basics.phone }}{% endif %}</p>
</div>
{% if data.basics.get('photo') %}
<img src="{{ data.basics.photo }}" alt="头像" class="photo {% if data.basics.get('photo_shape', 'circle') == 'circle' %}photo-circle{% elif data.basics.get('photo_shape', 'circle') == 'square' %}photo-square{% else %}photo-rounded{% endif %}">
{% endif %}
</div>
<div class="header-right">
{% if data.basics.get('location') %}<div>{{ data.basics.location }}</div>{% endif %}
</div>
</div>
{% if data.get('basics').get('summary') %}
<p style="margin-bottom:20px;font-size:13px;color:#555;padding:10px;background:#f8f9fa;border-radius:4px;">{{ data.basics.summary }}</p>
{% endif %}
{% endif %}

{% if data.get('education') %}
<div class="section">
<h2>Education</h2>
{% for edu in data.education %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ edu.get('school', '') }}</span>
<span class="item-date">{{ edu.get('date', '') }}</span>
</div>
<div class="item-subtitle">{{ edu.get('degree', '') }} - {{ edu.get('major', '') }}</div>
{% if edu.get('description') %}<div class="item-desc">{{ edu.description }}</div>{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if data.get('work') %}
<div class="section">
<h2>Experience</h2>
{% for work in data.work %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ work.get('company', '') }}</span>
<span class="item-date">{{ work.get('date', '') }}</span>
</div>
<div class="item-subtitle">{{ work.get('position', '') }}</div>
{% if work.get('description') %}<div class="item-desc">{{ work.description }}</div>{% endif %}
{% if work.get('highlights') %}
<ul style="margin-top:4px;padding-left:15px;font-size:12px;color:#555">
{% for h in work.highlights %}<li>{{ h }}</li>{% endfor %}
</ul>
{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if data.get('projects') %}
<div class="section">
<h2>Projects</h2>
{% for proj in data.projects %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ proj.get('name', '') }}</span>
<span class="item-date">{{ proj.get('date', '') }}</span>
</div>
{% if proj.get('description') %}<div class="item-desc">{{ proj.description }}</div>{% endif %}
{% if proj.get('highlights') %}
<ul style="margin-top:4px;padding-left:15px;font-size:12px;color:#555">
{% for h in proj.highlights %}<li>{{ h }}</li>{% endfor %}
</ul>
{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if data.get('skills') %}
<div class="section">
<h2>Skills</h2>
<div class="skills">
{% for skill in data.skills %}
<span class="skill-tag">{{ skill.get('name', skill) if skill is mapping else skill }}</span>
{% endfor %}
</div>
</div>
{% endif %}

{% if data.get('awards') %}
<div class="section">
<h2>Awards</h2>
{% for award in data.awards %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ award.get('title', '') }}</span>
<span class="item-date">{{ award.get('date', '') }}</span>
</div>
{% if award.get('description') %}<div class="item-desc">{{ award.description }}</div>{% endif %}
</div>
{% endfor %}
</div>
{% endif %}
</div>
</body>
</html>
""",

    "creative": """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; color: #2d3748; line-height: 1.6; }
.resume { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
.sidebar { background: {{ style.get('primary_color', '#6366f1') }}; color: white; padding: 30px 20px; }
.main { padding: 30px 40px; }
.sidebar-photo { text-align: center; margin-bottom: 20px; }
.sidebar-photo img { width: 120px; height: 120px; object-fit: cover; border: 3px solid rgba(255,255,255,0.5); }
.sidebar-photo .photo-circle { border-radius: 50%; }
.sidebar-photo .photo-square { border-radius: 8px; }
.sidebar-photo .photo-rounded { border-radius: 16px; }
.name { font-size: 24px; font-weight: 700; margin-bottom: 20px; }
.contact { font-size: 12px; opacity: 0.9; line-height: 2; }
.contact div { margin-bottom: 4px; }
.sidebar-section { margin-top: 25px; }
.sidebar-section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; opacity: 0.8; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; }
.skill-item { font-size: 12px; margin-bottom: 6px; padding: 4px 8px; background: rgba(255,255,255,0.15); border-radius: 4px; }
.section { margin-bottom: 25px; }
.section h2 { font-size: 16px; color: {{ style.get('primary_color', '#6366f1') }}; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid {{ style.get('primary_color', '#6366f1') }}; }
.item { margin-bottom: 14px; }
.item-header { display: flex; justify-content: space-between; }
.item-title { font-weight: 600; font-size: 15px; }
.item-date { color: #888; font-size: 12px; }
.item-subtitle { color: #666; font-size: 13px; margin-top: 2px; }
.item-desc { margin-top: 4px; font-size: 13px; color: #555; }
</style>
</head>
<body>
<div class="resume">
<div class="sidebar">
{% if data.get('basics') and data.basics.get('photo') %}
<div class="sidebar-photo">
<img src="{{ data.basics.photo }}" alt="头像" class="{% if data.basics.get('photo_shape', 'circle') == 'circle' %}photo-circle{% elif data.basics.get('photo_shape', 'circle') == 'square' %}photo-square{% else %}photo-rounded{% endif %}">
</div>
{% endif %}
{% if data.get('basics') %}
<div class="name">{{ data.basics.get('name', '') }}</div>
<div class="contact">
{% if data.basics.get('email') %}<div>📧 {{ data.basics.email }}</div>{% endif %}
{% if data.basics.get('phone') %}<div>📱 {{ data.basics.phone }}</div>{% endif %}
{% if data.basics.get('location') %}<div>📍 {{ data.basics.location }}</div>{% endif %}
</div>
{% endif %}

{% if data.get('skills') %}
<div class="sidebar-section">
<h3>Skills</h3>
{% for skill in data.skills %}
<div class="skill-item">{{ skill.get('name', skill) if skill is mapping else skill }}</div>
{% endfor %}
</div>
{% endif %}

{% if data.get('awards') %}
<div class="sidebar-section">
<h3>Awards</h3>
{% for award in data.awards %}
<div class="skill-item">{{ award.get('title', '') }}</div>
{% endfor %}
</div>
{% endif %}
</div>

<div class="main">
{% if data.get('basics') and data.basics.get('summary') %}
<div class="section">
<h2>Profile</h2>
<p style="font-size:14px;color:#555">{{ data.basics.summary }}</p>
</div>
{% endif %}

{% if data.get('education') %}
<div class="section">
<h2>Education</h2>
{% for edu in data.education %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ edu.get('school', '') }}</span>
<span class="item-date">{{ edu.get('date', '') }}</span>
</div>
<div class="item-subtitle">{{ edu.get('degree', '') }} - {{ edu.get('major', '') }}</div>
{% if edu.get('description') %}<div class="item-desc">{{ edu.description }}</div>{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if data.get('work') %}
<div class="section">
<h2>Experience</h2>
{% for work in data.work %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ work.get('company', '') }}</span>
<span class="item-date">{{ work.get('date', '') }}</span>
</div>
<div class="item-subtitle">{{ work.get('position', '') }}</div>
{% if work.get('description') %}<div class="item-desc">{{ work.description }}</div>{% endif %}
{% if work.get('highlights') %}
<ul style="margin-top:4px;padding-left:15px;font-size:13px;color:#555">
{% for h in work.highlights %}<li>{{ h }}</li>{% endfor %}
</ul>
{% endif %}
</div>
{% endfor %}
</div>
{% endif %}

{% if data.get('projects') %}
<div class="section">
<h2>Projects</h2>
{% for proj in data.projects %}
<div class="item">
<div class="item-header">
<span class="item-title">{{ proj.get('name', '') }}</span>
<span class="item-date">{{ proj.get('date', '') }}</span>
</div>
{% if proj.get('description') %}<div class="item-desc">{{ proj.description }}</div>{% endif %}
{% if proj.get('highlights') %}
<ul style="margin-top:4px;padding-left:15px;font-size:13px;color:#555">
{% for h in proj.highlights %}<li>{{ h }}</li>{% endfor %}
</ul>
{% endif %}
</div>
{% endfor %}
</div>
{% endif %}
</div>
</div>
</body>
</html>
"""
}

def render_preview(data: dict, template_name: str = "modern", style: dict = None) -> str:
    template_str = TEMPLATES.get(template_name, TEMPLATES["modern"])
    template = Template(template_str)
    
    standard_sections = ['basics', 'education', 'work', 'projects', 'skills', 'awards']
    section_order = data.get('sectionOrder', standard_sections)
    
    # Add custom sections not already in section_order
    custom_sections = [f'custom_{i}' for i in range(len(data.get('custom', [])))]
    for cs in custom_sections:
        if cs not in section_order:
            section_order.append(cs)
    
    section_data = {}
    for section in section_order:
        if section == 'basics':
            section_data[section] = data.get('basics', {})
        elif section.startswith('custom_'):
            idx = int(section.replace('custom_', ''))
            section_data[section] = data.get('custom', [])[idx] if idx < len(data.get('custom', [])) else {}
        else:
            section_data[section] = data.get(section, [])
    
    return template.render(data=data, style=style or {}, section_order=section_order, section_data=section_data)

def get_template_list():
    return [
        {"id": "modern", "name": "现代简约", "description": "简洁现代的设计风格"},
        {"id": "classic", "name": "经典正式", "description": "传统正式的简历格式"},
        {"id": "tech", "name": "科技风格", "description": "适合技术人员的暗色主题"},
        {"id": "creative", "name": "创意双栏", "description": "左右分栏的创意布局"}
    ]
