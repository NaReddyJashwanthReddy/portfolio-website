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
width=letter[0]-72
styles={
 'name':ParagraphStyle('name',fontName='Times-Bold',fontSize=23,leading=26,alignment=TA_CENTER,spaceAfter=3),
 'contact':ParagraphStyle('contact',fontName='Times-Roman',fontSize=9,leading=11,alignment=TA_CENTER),
 'section':ParagraphStyle('section',fontName='Times-Roman',fontSize=12,leading=14,spaceBefore=5,spaceAfter=2),
 'body':ParagraphStyle('body',fontName='Times-Roman',fontSize=9.8,leading=11.3,spaceAfter=2),
 'title':ParagraphStyle('title',fontName='Times-Bold',fontSize=10.2,leading=11.6),
 'date':ParagraphStyle('date',fontName='Times-Roman',fontSize=9.8,leading=11.6,alignment=TA_RIGHT),
 'sub':ParagraphStyle('sub',fontName='Times-Italic',fontSize=9.7,leading=11.2),
 'bullet':ParagraphStyle('bullet',fontName='Times-Roman',fontSize=9.6,leading=11.1,leftIndent=13,bulletIndent=2,spaceAfter=2),
}
flow=[]
def p(text,style='body'):return Paragraph(text,styles[style])
def add(text,style='body'):flow.append(p(text,style))
def section(title):
 flow.append(KeepTogether([p(title.upper(),'section'),HRFlowable(width='100%',thickness=.5,spaceAfter=3)]))
def entry(title,date,subtitle,location=''):
 t=Table([[p(title,'title'),p(date,'date')],[p(subtitle,'sub'),p(location,'date')]],colWidths=[width*.71,width*.29])
 t.setStyle(TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),1),('VALIGN',(0,0),(-1,-1),'TOP')]))
 flow.append(KeepTogether([t]));flow.append(Spacer(1,2))
def bullet(text):flow.append(Paragraph(text,styles['bullet'],bulletText='\u2022'))
def project(title,tools,copy):
 flow.append(KeepTogether([p(f'<b>{title}</b> | <i>{tools}</i>'),Paragraph(copy,styles['bullet'],bulletText='\u2022')]));flow.append(Spacer(1,1))

add('NAREDDY JASHWANTH REDDY','name')
add('Melbourne, VIC | +61 432 396 557 | <link href="mailto:jashwanthreddysungjin@gmail.com"><u>jashwanthreddysungjin@gmail.com</u></link>','contact')
add(f'<link href="{escape(portfolio_url, quote=True)}"><u>{escape(portfolio_label)}</u></link> | <link href="https://github.com/NaReddyJashwanthReddy"><u>GitHub: NaReddyJashwanthReddy</u></link> | <link href="https://www.kaggle.com/jashwanthreddy0264"><u>Kaggle: jashwanthreddy0264</u></link>','contact')

section('Summary')
add('An electrical engineering foundation and AI/ML minor led me from language-model experiments to production computer vision at Fotos. Building tools for photographers taught me to connect models with everyday workflows. Now studying AI at Monash, I am applying that approach to evidence-grounded assistants, agent collaboration, and domain-focused training.')

section('Education')
entry('Monash University','2026 - 2028 (Expected)','Master of Artificial Intelligence | Current WAM: 79.0 | GPA: 3.5')
entry('BVRIT (JNTUH)','2020 - 2024','B.Tech in Electrical and Electronic Engineering | CGPA: 8.05/10')
add('<i>Minor: Computer Science - Artificial Intelligence &amp; Machine Learning | CGPA: 8.90/10</i>','sub')

section('Experience')
entry('AI Engineer','Feb 2025 - Jan 2026','Fotos','Remote')
bullet('Deployed GCP vision microservices for photography using TensorFlow, OpenCV, RetinaFace, and DeepFace/ArcFace; achieved <b>&gt;99% accuracy</b> for facial, eye, and mouth topology detection.')
bullet('Extended photo culling beyond face detection by combining identity clustering, quality/expression scoring, and Qwen2.5-VL served with vLLM, enabling context-aware image assessment and ranking.')
bullet('Reduced professional editing time by <b>60%</b> with neural preset-based color style transfer; supported cloud deployment, inference APIs, and performance monitoring.')
entry('Artificial Intelligence Intern','Jan 2024 - Feb 2024','Navodita InfoTech','Remote')
bullet('Built conversational responses with a spaCy/NLTK chatbot and transformer generation, alongside an encoder-decoder French-English translator that achieved <b>BLEU 0.8</b>.')

section('Projects')
project('Safety Compliance Agent','Hybrid RAG, Reranking, Citation Validation',
 'Built a backend prototype for questions that need traceable evidence: retrieves relevant material, reranks it, grounds an answer, and validates its supporting citations before returning a response.')
project('AgentForge - In Development','AI Agents, Role Orchestration',
 'Designing a workspace where specialised agents contribute to a shared task. Separating responsibilities and making contributions visible supports clearer collaboration across an evolving workflow.')
project('Medical Language Adaptation &amp; BERT Sentiment','MLM, SFT / CLM, Google Colab',
 'Explored a staged training approach using <b>20+ medical books and research papers</b> for masked-language-modeling adaptation, followed by supervised fine-tuning on labelled, LLM-generated conversations with a causal objective. Separately adapted BERT with MLM for sentiment analysis.')
project('Brain Tumour Detection','CNN, Optuna, Google Colab',
 'Developed a CNN experiment for brain-tumour detection, using Optuna to search hyperparameter configurations systematically and evaluating the resulting model on a held-out test dataset.')
project('Predictive ML &amp; Analytics','XGBoost, Optuna, SQL, FastAPI',
 'Connected churn modelling to business-facing analytics through APIs and dashboards. A separate loan-approval classifier achieved <b>0.97070 public-leaderboard ROC-AUC</b> using Optuna and 5-fold cross-validation.')

section('Technical Skills')
add('<b>Languages &amp; data:</b> Python, SQL, C++, MongoDB, Power BI.<br/><b>ML &amp; deep learning:</b> PyTorch, TensorFlow, scikit-learn, Hugging Face, XGBoost, Optuna; CNNs, transformers, GANs, diffusion.<br/><b>GenAI &amp; vision:</b> RAG, LangGraph, LangChain, fine-tuning, prompt tuning, byte-pair tokenization, CLIP, YOLO, OpenCV.<br/><b>Engineering:</b> FastAPI, vLLM, GCP, Docker, Git/GitHub, REST APIs, deployment and monitoring.')
section('Achievements & Certification')
add('ATVC Innovation Runner-Up (2023) | My Anatomy AI-thon Finalist (2023)<br/>Advanced Data Science &amp; AI Certification - Intellipaat (IIT-Madras)')

doc=SimpleDocTemplate(str(out),pagesize=letter,leftMargin=36,rightMargin=36,topMargin=25,bottomMargin=25,title='Nareddy Jashwanth Reddy - AI Engineer Resume',author='Nareddy Jashwanth Reddy')
doc.build(flow)
qa=root/'tmp/pdfs';qa.mkdir(parents=True,exist_ok=True)
with pdfplumber.open(out) as pdf:
 print('Pages:',len(pdf.pages))
 for i,page in enumerate(pdf.pages):page.to_image(resolution=140).save(str(qa/f'resume-latest-{i+1}.png'))
print(out)
