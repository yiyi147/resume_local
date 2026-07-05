from playwright.sync_api import sync_playwright
from services.preview import render_preview
import os

def generate_pdf(data: dict, template_name: str = "modern", style: dict = None) -> bytes:
    html_content = render_preview(data, template_name, style)
    
    chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if not os.path.exists(chrome_path):
        raise Exception("Chrome not found")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        page = browser.new_page()
        page.set_content(html_content, wait_until='networkidle')
        pdf_bytes = page.pdf(format='A4', margin={'top': '20mm', 'bottom': '20mm', 'left': '15mm', 'right': '15mm'})
        browser.close()
    
    return pdf_bytes
