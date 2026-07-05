from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any, List
import json
import io
import base64
import os
import uuid
import re

from models import get_db, Resume

router = APIRouter()

UPLOAD_DIR = "storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ResumeCreate(BaseModel):
    title: str
    data: dict
    template: str = "modern"
    style: dict = {}

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    data: Optional[dict] = None
    template: Optional[str] = None
    style: Optional[dict] = None

@router.get("/resumes")
def list_resumes(db: Session = Depends(get_db)):
    resumes = db.query(Resume).all()
    return [{"id": r.id, "title": r.title, "template": r.template, 
             "created_at": r.created_at.isoformat(), "updated_at": r.updated_at.isoformat()} 
            for r in resumes]

@router.post("/resumes")
def create_resume(payload: ResumeCreate, db: Session = Depends(get_db)):
    resume = Resume(title=payload.title, data=payload.data, 
                    template=payload.template, style=payload.style)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return {"id": resume.id, "title": resume.title}

@router.get("/resumes/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"id": resume.id, "title": resume.title, "data": resume.data, 
            "template": resume.template, "style": resume.style}

@router.put("/resumes/{resume_id}")
def update_resume(resume_id: int, payload: ResumeUpdate, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if payload.title is not None:
        resume.title = payload.title
    if payload.data is not None:
        resume.data = payload.data
    if payload.template is not None:
        resume.template = payload.template
    if payload.style is not None:
        resume.style = payload.style
    db.commit()
    return {"success": True}

@router.delete("/resumes/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"success": True}

@router.get("/resumes/{resume_id}/preview")
def preview_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    from services.preview import render_preview
    html = render_preview(resume.data, resume.template, resume.style)
    return {"html": html}

@router.get("/resumes/{resume_id}/export/pdf")
def export_pdf(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    from services.pdf_export import generate_pdf
    pdf_bytes = generate_pdf(resume.data, resume.template, resume.style)
    filename = f"resume_{resume.id}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/resumes/{resume_id}/export/word")
def export_word(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    from services.word_export import generate_word
    doc_bytes = generate_word(resume.data, resume.template)
    filename = f"resume_{resume.id}.docx"
    return StreamingResponse(
        io.BytesIO(doc_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/templates")
def list_templates():
    from services.preview import get_template_list
    return get_template_list()

@router.post("/import/pdf")
async def import_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="只支持 PDF 文件")
    
    content = await file.read()
    
    try:
        import asyncio
        from playwright.sync_api import sync_playwright
        import tempfile
        
        chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        
        def extract_pdf():
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
                tmp.write(content)
                tmp_path = tmp.name
            
            with sync_playwright() as p:
                browser = p.chromium.launch(executable_path=chrome_path, headless=True)
                page = browser.new_page()
                page.goto(f'file://{tmp_path}')
                import time
                time.sleep(3)
                text = page.inner_text('body')
                browser.close()
            
            os.unlink(tmp_path)
            return text
        
        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(None, extract_pdf)
        
        from services.import_parser import parse_resume_text
        resume_data = parse_resume_text(text)
        
        return {"filename": file.filename, "data": resume_data, "text_preview": text[:500]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析失败: {str(e)}")

@router.post("/import/word")
async def import_word(file: UploadFile = File(...)):
    if not file.filename.endswith(('.docx', '.doc')):
        raise HTTPException(status_code=400, detail="只支持 Word 文件")
    
    content = await file.read()
    
    try:
        from docx import Document
        from lxml import etree
        doc = Document(io.BytesIO(content))
        
        # Extract text from paragraphs
        paragraphs = []
        for p in doc.paragraphs:
            if p.text.strip():
                style_name = p.style.name if p.style else ""
                paragraphs.append({
                    "text": p.text.strip(),
                    "style": style_name,
                    "level": p.style.name.split()[-1] if p.style and "Heading" in p.style.name else None
                })
        
        # Extract text from text boxes (文本框) - WPS Office format
        nsmap = {
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
            'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
            'wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
            'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
            'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006'
        }
        
        for element in doc.element.body.iter():
            if element.tag.endswith('}txbxContent'):
                for p in element.findall('.//w:p', nsmap):
                    text_parts = []
                    for r in p.findall('.//w:t', nsmap):
                        if r.text:
                            text_parts.append(r.text)
                    text = ''.join(text_parts).strip()
                    if text and not any(p['text'] == text for p in paragraphs):
                        paragraphs.append({"text": text, "style": "Normal", "level": None})
        
        text = '\n'.join([p["text"] for p in paragraphs])
        
        from services.import_parser import parse_resume_text
        resume_data = parse_resume_text_from_word(paragraphs)
        
        return {"filename": file.filename, "data": resume_data, "text_preview": text[:500]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析失败: {str(e)}")

def parse_resume_text_from_word(paragraphs: list) -> dict:
    """Parse Word document paragraphs into resume data"""
    data = {
        "basics": {"name": "", "email": "", "phone": "", "location": "", "summary": ""},
        "education": [],
        "work": [],
        "projects": [],
        "skills": [],
        "awards": []
    }
    
    all_text = ' '.join([p["text"] for p in paragraphs])
    
    email_match = re.search(r'[\w.-]+@[\w.-]+\.\w+', all_text)
    if email_match:
        data["basics"]["email"] = email_match.group()
    
    phone_match = re.search(r'1[3-9]\d{9}|0\d{2,3}-?\d{7,8}', all_text)
    if phone_match:
        data["basics"]["phone"] = phone_match.group()
    
    date_pattern = r'\d{4}[-./年]?\d{0,2}[-./月]?\d{0,2}[-./日]?\s*[-~—到至现]*\s*\d{0,4}[-./年]?\d{0,2}[-./月]?\d{0,2}[-./日]?'
    
    for p in paragraphs:
        text = p["text"]
        style = p.get("style", "")
        
        if not text:
            continue
            
        if "Heading 1" in style or "标题 1" in style:
            if not data["basics"]["name"]:
                data["basics"]["name"] = text
            continue
        
        if "Heading 2" in style or "标题 2" in style:
            text_lower = text.lower()
            if any(kw in text_lower for kw in ["教育", "学历", "education"]):
                current_section = "education"
            elif any(kw in text_lower for kw in ["工作", "经验", "experience", "work"]):
                current_section = "work"
            elif any(kw in text_lower for kw in ["项目", "project"]):
                current_section = "projects"
            elif any(kw in text_lower for kw in ["技能", "技术", "skill"]):
                current_section = "skills"
            elif any(kw in text_lower for kw in ["荣誉", "奖项", "award"]):
                current_section = "awards"
            continue
        
        text_lower = text.lower()
        current_section = None
        for section, keywords in {
            "education": ["教育", "学历", "education", "教育背景"],
            "work": ["工作", "经验", "experience", "work", "工作经历"],
            "projects": ["项目", "project", "项目经历"],
            "skills": ["技能", "技术", "skill", "专业技能"],
            "awards": ["荣誉", "奖项", "award", "荣誉奖项"]
        }.items():
            for kw in keywords:
                if kw in text_lower or kw in text:
                    current_section = section
                    break
            if current_section:
                break
        
        if current_section == "skills":
            for skill in re.split(r'[,、|/\s]+', text):
                skill = skill.strip()
                if skill and len(skill) > 1:
                    data["skills"].append(skill)
        elif current_section == "education":
            date_match = re.search(date_pattern, text)
            if date_match:
                if not data["education"]:
                    data["education"].append({"school": "", "degree": "", "major": "", "date": date_match.group(), "description": ""})
                else:
                    data["education"][-1]["date"] = date_match.group()
            elif not data["education"] or data["education"][-1].get("school"):
                data["education"].append({"school": text, "degree": "", "major": "", "date": "", "description": ""})
            else:
                data["education"][-1]["description"] = (data["education"][-1].get("description", "") + " " + text).strip()
        elif current_section == "work":
            date_match = re.search(date_pattern, text)
            if date_match:
                if not data["work"]:
                    data["work"].append({"company": "", "position": "", "date": date_match.group(), "description": "", "highlights": []})
                else:
                    data["work"][-1]["date"] = date_match.group()
            elif not data["work"] or data["work"][-1].get("company"):
                data["work"].append({"company": text, "position": "", "date": "", "description": "", "highlights": []})
            else:
                data["work"][-1]["description"] = (data["work"][-1].get("description", "") + " " + text).strip()
        elif current_section == "projects":
            date_match = re.search(date_pattern, text)
            if date_match:
                if not data["projects"]:
                    data["projects"].append({"name": "", "date": date_match.group(), "description": "", "highlights": []})
                else:
                    data["projects"][-1]["date"] = date_match.group()
            elif not data["projects"] or data["projects"][-1].get("name"):
                data["projects"].append({"name": text, "date": "", "description": "", "highlights": []})
            else:
                data["projects"][-1]["description"] = (data["projects"][-1].get("description", "") + " " + text).strip()
        elif current_section == "awards":
            date_match = re.search(r'\d{4}[-./年]\d{1,2}[-./月]?\d{0,2}', text)
            if date_match:
                if not data["awards"]:
                    data["awards"].append({"title": "", "date": date_match.group(), "description": ""})
                else:
                    data["awards"][-1]["date"] = date_match.group()
            elif not data["awards"] or data["awards"][-1].get("title"):
                data["awards"].append({"title": text, "date": "", "description": ""})
            else:
                data["awards"][-1]["description"] = (data["awards"][-1].get("description", "") + " " + text).strip()
    
    return data

@router.post("/upload/photo")
async def upload_photo(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="只支持图片文件")
    
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="图片不能超过 5MB")
    
    ext = os.path.splitext(file.filename)[1] or '.jpg'
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as f:
        f.write(content)
    
    return {"url": f"/api/files/{filename}", "filename": filename}

@router.get("/files/{filename}")
async def get_file(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    import mimetypes
    content_type = mimetypes.guess_type(filepath)[0] or "application/octet-stream"
    
    with open(filepath, "rb") as f:
        content = f.read()
    
    return Response(content=content, media_type=content_type)
