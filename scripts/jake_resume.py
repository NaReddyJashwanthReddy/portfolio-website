"""Jake's Resume-inspired layout; grounded, contextual summary and bullets."""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import letter
import os
from html import escape
import pdfplumber

root=Path(__file__).resolve().parents[1]
out=root/'output/pdf/jashwanth_resume_latest.pdf'
portfolio_url=os.environ.get('PORTFOLIO_URL', 'https://jashwanth-ai-portfolio.vercel.app').rstrip('/')
portfolio_label=portfolio_url.removeprefix('https://').removeprefix('http://')
out.parent.mkdir(parents=True,exist_ok=True)
# ReportLab's default document frame adds 6 pt padding on each side.
width=letter[0]-72-12
styles={
 'name':ParagraphStyle('name',fontName='Times-Bold',fontSize=23,leading=26,alignment=TA_CENTER,spaceAfter=3),
 'contact':ParagraphStyle('contact',fontName='Times-Roman',fontSize=9,leading=11,alignment=TA_CENTER),
 'section':ParagraphStyle('section',fontName='Times-Roman',fontSize=12,leading=14,spaceBefore=4,spaceAfter=1),
 'body':ParagraphStyle('body',fontName='Times-Roman',fontSize=9.8,leading=11.3,spaceAfter=2),
 'title':ParagraphStyle('title',fontName='Times-Bold',fontSize=10.2,leading=11.6),
 'date':ParagraphStyle('date',fontName='Times-Roman',fontSize=9.8,leading=11.6,alignment=TA_RIGHT),
 'sub':ParagraphStyle('sub',fontName='Times-Italic',fontSize=9.7,leading=11.2),
 'bullet':ParagraphStyle('bullet',fontName='Times-Roman',fontSize=9.6,leading=11.1,leftIndent=13,bulletIndent=2,spaceAfter=1),
}
flow=[]
def p(text,style='body'):return Paragraph(text,styles[style])
def add(text,style='body'):flow.append(p(text,style))
def section(title):
 flow.append(KeepTogether([p(title.upper(),'section'),HRFlowable(width='100%',thickness=.5,spaceAfter=3)]))
def entry(title,date,subtitle,location=''):
 t=Table([[p(title,'title'),p(date,'date')],[p(subtitle,'sub'),p(location,'date')]],colWidths=[width*.71,width*.29],hAlign='LEFT')
 t.setStyle(TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),1),('VALIGN',(0,0),(-1,-1),'TOP')]))
 flow.append(KeepTogether([t]));flow.append(Spacer(1,2))

def education(institution,date,degree,grades,minor=None,minor_grade=None):
 rows=[[p(institution,'title'),p(date,'date')],
       [p(degree,'sub'),p(grades,'date')]]
 if minor:rows.append([p(minor,'sub'),p(minor_grade or '', 'date')])
 t=Table(rows,colWidths=[width*.71,width*.29],hAlign='LEFT')
 t.setStyle(TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),1),('VALIGN',(0,0),(-1,-1),'TOP')]))
 flow.append(KeepTogether([t]));flow.append(Spacer(1,4))
def bullet(text):flow.append(Paragraph(text,styles['bullet'],bulletText='\u2022'))
def project(title,tools,copy):
 copies=[copy] if isinstance(copy,str) else copy
 flow.append(KeepTogether([p(f'<b>{title}</b> | <i>{tools}</i>')]+[Paragraph(item,styles['bullet'],bulletText='\u2022') for item in copies]));flow.append(Spacer(1,3))

add('NAREDDY JASHWANTH REDDY','name')
add('Melbourne, VIC | +61 432 396 557 | <link href="mailto:jashwanthreddysungjin@gmail.com"><u>jashwanthreddysungjin@gmail.com</u></link>','contact')
add(f'<link href="{escape(portfolio_url, quote=True)}"><u>{escape(portfolio_label)}</u></link> | <link href="https://github.com/NaReddyJashwanthReddy"><u>GitHub: NaReddyJashwanthReddy</u></link> | <link href="https://www.kaggle.com/jashwanthreddy0264"><u>Kaggle: jashwanthreddy0264</u></link>','contact')

section('Summary')
add('Electrical engineering and an AI/ML minor took me from model experiments to production vision at Fotos, where I learned to connect models with everyday workflows. Now studying AI at Monash, I am extending that approach through role-based agent collaboration, multimodal analysis, and language-model adaptation.')

section('Education')
education('Monash University','2026 - Present',
          'Master of Artificial Intelligence','Current WAM: 79.0 | GPA: 3.5')
education('BVRIT (JNTUH)','2020 - 2024',
          'B.Tech in Electrical and Electronic Engineering','CGPA: 8.05/10',
          'Minor: Computer Science - Artificial Intelligence &amp; Machine Learning','CGPA: 8.90/10')

section('Experience')
entry('AI Engineer','Feb 2025 - Jan 2026','Fotos','Remote')
bullet('Deployed GCP vision microservices for photography using TensorFlow, OpenCV, RetinaFace, and DeepFace/ArcFace; achieved <b>&gt;99% accuracy</b> for facial, eye, and mouth topology detection.')
bullet('Extended photo culling beyond face detection by combining identity clustering, quality/expression scoring, and Qwen2.5-VL served with vLLM, enabling context-aware image assessment and ranking.')
bullet('Reduced manual editing time by <b>60%</b> with neural preset style transfer; managed deployment, inference APIs, and monitoring.')
entry('Artificial Intelligence Intern','Jan 2024 - Feb 2024','Navodita InfoTech','Remote')
bullet('Built conversational responses with a spaCy/NLTK chatbot and transformer generation, alongside an encoder-decoder French-English translator that achieved <b>BLEU 0.8</b>.')

section('Selected Projects')
# Lead with the user's flagship, then two complementary established areas.
# AgentForge descriptions distinguish architecture design from completed work.
project('AgentForge - In Development','Multi-Agent Systems | Python, LangGraph, Groq',[
 'Designing a workspace that turns a high-level objective into coordinated work across <b>eight specialised roles</b>: Manager, Planner, Researcher, Product, Marketing, Developer, Tester, and Reviewer.',
 'Designed task dependencies, shared project state, structured agent results, and artifacts so specialists can receive role-relevant context and hand work between planning, research, development, and review.',
 'Specified separate technical-testing and requirements-review stages, revision loops for failed work, and human approval before completion; planning an activity dashboard that exposes assignments, handoffs, and progress.',
])
project('Multimodal Image Analysis','Computer Vision | Vision-Language Models, CLIP, YOLO, OpenCV',[
 'Built an image-plus-text quality-assessment pipeline returning <b>structured JSON</b> with quality scores, identified visual drawbacks, and explanations, making model outputs easier to integrate with downstream applications.',
 'Developed CLIP image-text similarity and ranking experiments alongside YOLO/OpenCV detection, exploring semantic matching, visual retrieval, and object-level image analysis.',
])
project('LLM Fine-Tuning &amp; Domain Adaptation','NLP | Qwen3, Hugging Face, PyTorch',[
 'Prepared role-structured, multi-turn user/assistant examples, fine-tuned a conversational model for concise replies, and tested behaviour on unseen prompts.',
 'Explored Qwen3 continued pretraining on a curated medical-book corpus to adapt domain terminology. Further medical experiments used <b>20+ books and research papers</b> for masked-language-modeling adaptation.',
 'Used labelled, LLM-generated conversations for supervised fine-tuning with a causal language-modeling objective, aiming to connect domain-focused training with more natural conversational responses.',
])

section('Technical Skills')
add('<b>Languages &amp; data:</b> Python, SQL, C++, MongoDB, Power BI.<br/><b>ML &amp; deep learning:</b> PyTorch, TensorFlow, scikit-learn, Hugging Face, XGBoost, Optuna; CNNs, transformers, GANs, diffusion.<br/><b>GenAI &amp; vision:</b> RAG, LangGraph, LangChain, fine-tuning, prompt tuning, byte-pair tokenization, CLIP, YOLO, OpenCV.<br/><b>Engineering:</b> FastAPI, vLLM, GCP, Docker, Git/GitHub, REST APIs, deployment and monitoring.')
section('Achievements & Certification')
add('ATVC Innovation Runner-Up (2023) | My Anatomy AI-thon Finalist (2023)<br/>Advanced Data Science &amp; AI Certification - Intellipaat (IIT-Madras)')

doc=SimpleDocTemplate(str(out),pagesize=letter,leftMargin=36,rightMargin=36,topMargin=24,bottomMargin=24,title='Nareddy Jashwanth Reddy - AI Engineer Resume',author='Nareddy Jashwanth Reddy')
doc.build(flow)
qa=root/'tmp/pdfs';qa.mkdir(parents=True,exist_ok=True)
with pdfplumber.open(out) as pdf:
 print('Pages:',len(pdf.pages))
 for i,page in enumerate(pdf.pages):page.to_image(resolution=140).save(str(qa/f'resume-latest-{i+1}.png'))
print(out)
