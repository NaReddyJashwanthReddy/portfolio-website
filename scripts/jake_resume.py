"""Jake's Resume-inspired layout; grounded, contextual summary and bullets."""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import letter
import pdfplumber

root=Path(__file__).resolve().parents[1]
out=root/'output/pdf/jashwanth_resume_jake.pdf'
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
add('<link href="https://jashwanth-reddy-portfolio.vercel.app"><u>jashwanth-reddy-portfolio.vercel.app</u></link> | <link href="https://github.com/NaReddyJashwanthReddy"><u>GitHub: NaReddyJashwanthReddy</u></link> | <link href="https://www.kaggle.com/jashwanthreddy0264"><u>Kaggle: jashwanthreddy0264</u></link>','contact')

section('Summary')
add('An electrical engineering foundation and AI/ML minor led to language-model work, then production computer vision at Fotos. There, photography workflows achieved <b>&gt;99% detection accuracy</b> and reduced manual editing effort by <b>60%</b>. Now pursuing a Master of Artificial Intelligence at Monash, with projects spanning RAG, agents, multimodal analysis, and model adaptation.')

section('Education')
entry('Monash University','2026 - 2028 (Expected)','Master of Artificial Intelligence | Current WAM: 79.0 | GPA: 3.5')
entry('BVRIT (JNTUH)','2020 - 2024','B.Tech in Electrical and Electronic Engineering | CGPA: 8.05/10')
add('<i>Minor: Computer Science - Artificial Intelligence &amp; Machine Learning | CGPA: 8.90/10</i>','sub')

section('Experience')
entry('AI Engineer','Feb 2025 - Jan 2026','Fotos','Remote')
bullet('For photography workflows that needed reliable facial analysis, deployed GCP vision microservices using TensorFlow, OpenCV, RetinaFace, and DeepFace/ArcFace; achieved <b>&gt;99% accuracy</b> for facial, eye, and mouth topology detection.')
bullet('Extended photo culling beyond face detection by combining identity clustering, quality/expression scoring, and Qwen2.5-VL served with vLLM, enabling context-aware image assessment and ranking.')
bullet('Addressed manual editing effort with neural preset-based color style transfer, reducing professional editing time by <b>60%</b>; supported production serving through cloud deployment, inference APIs, and performance monitoring.')
entry('Artificial Intelligence Intern','Jan 2024 - Feb 2024','Navodita InfoTech','Remote')
bullet('Worked across two language tasks: conversational responses through a spaCy/NLTK chatbot with transformer generation, and French-English translation through an encoder-decoder model that achieved <b>BLEU 0.8</b>.')

section('Projects')
project('Multi-Agent &amp; Voice AI Assistants','LangGraph, RAG, Google APIs, STT/TTS',
 'Connected conversations to actions: a Telegram assistant routes email, calendar, news, and travel requests using intent detection, RAG, and Google APIs. A travel-sales voice assistant links speech recognition, an LLM, retrieval, and speech synthesis.')
project('LLM Fine-Tuning &amp; Domain Adaptation','Qwen3, Hugging Face, PyTorch',
 'Adapted models for different contexts: fine-tuned role-structured, multi-turn chat data for concise replies and tested unseen prompts; continued pretraining of Qwen3 on approximately 20 medical books to adapt terminology for a health-information assistant.')
project('Generative Models from Scratch','PyTorch, GANs, Diffusion, U-Net, CIFAR',
 'Explored image generation from the training loop upward: implemented GAN architectures, adversarial loss, and alternating optimization, then a diffusion pipeline with timestep conditioning, U-Net noise prediction, and reverse denoising.')
project('Multimodal Image Analysis &amp; Computer Vision','CLIP, YOLO, OpenCV, VLMs',
 'Turned image-and-text analysis into structured JSON with quality scores, visual drawbacks, and explanations for downstream integration; explored semantic ranking with CLIP and object-level analysis with YOLO/OpenCV.')
project('Predictive ML &amp; Analytics','XGBoost, Random Forest, Optuna, SQL, FastAPI, Power BI',
 'Connected churn predictions to retention decisions through SQL/EDA, stratified cross-validation, APIs, dashboards, and A/B-testing design. A separate loan-approval classifier achieved <b>0.97070 public-leaderboard ROC-AUC</b> using Optuna and 5-fold cross-validation.')

section('Technical Skills')
add('<b>Languages &amp; data:</b> Python, SQL, C++, MongoDB, Power BI.<br/><b>ML &amp; deep learning:</b> scikit-learn, XGBoost, Random Forest, Optuna, PyTorch, TensorFlow, Hugging Face; classification, clustering, feature engineering, cross-validation, transformers, GANs, diffusion.<br/><b>GenAI &amp; vision:</b> LLM fine-tuning, domain adaptation, RAG, agents, NLP, LangGraph, LangChain, CLIP, YOLO, OpenCV.<br/><b>Engineering:</b> FastAPI, vLLM, GCP, Docker, Git/GitHub, REST APIs, CUDA, MLOps, deployment and monitoring.')
section('Achievements & Certification')
add('ATVC Innovation Runner-Up (2023) | My Anatomy AI-thon Finalist (2023)<br/>Advanced Data Science &amp; AI Certification - Intellipaat (IIT-Madras)')

doc=SimpleDocTemplate(str(out),pagesize=letter,leftMargin=36,rightMargin=36,topMargin=25,bottomMargin=25,title='Nareddy Jashwanth Reddy - AI Engineer Resume',author='Nareddy Jashwanth Reddy')
doc.build(flow)
qa=root/'tmp/pdfs';qa.mkdir(parents=True,exist_ok=True)
with pdfplumber.open(out) as pdf:
 print('Pages:',len(pdf.pages))
 for i,page in enumerate(pdf.pages):page.to_image(resolution=140).save(str(qa/f'resume-jake-{i+1}.png'))
print(out)
