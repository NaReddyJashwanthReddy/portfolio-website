"""Generate the polished resume; pass the verified production portfolio URL."""
from pathlib import Path
from xml.sax.saxutils import escape
import argparse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
import pdfplumber

parser=argparse.ArgumentParser()
parser.add_argument('--portfolio', default='')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
out=root/'output/pdf/jashwanth_resume_portfolio.pdf'
out.parent.mkdir(parents=True,exist_ok=True)
ink=HexColor('#172332');blue=HexColor('#244969');gray=HexColor('#465564')
styles={
 'name':ParagraphStyle('name',fontName='Helvetica-Bold',fontSize=18,leading=20,alignment=TA_CENTER,textColor=ink,spaceAfter=4),
 'role':ParagraphStyle('role',fontName='Helvetica-Bold',fontSize=9,leading=11,alignment=TA_CENTER,textColor=blue,spaceAfter=4),
 'contact':ParagraphStyle('contact',fontName='Helvetica',fontSize=8,leading=10.5,alignment=TA_CENTER,textColor=gray),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=8.6,leading=10.7,textColor=ink,spaceAfter=2),
 'bullet':ParagraphStyle('bullet',fontName='Helvetica',fontSize=8.6,leading=10.7,textColor=ink,leftIndent=9,firstLineIndent=-7,spaceAfter=2),
 'heading':ParagraphStyle('heading',fontName='Helvetica-Bold',fontSize=9.8,leading=12,textColor=blue,spaceBefore=8,spaceAfter=3),
 'entry':ParagraphStyle('entry',fontName='Helvetica-Bold',fontSize=9,leading=11,textColor=ink,spaceBefore=3,spaceAfter=2),
}
flow=[]
def para(text,style='body'):
 return Paragraph(text,styles[style])
def add(text,style='body'):
 flow.append(para(text,style))
def section(title):
 flow.append(KeepTogether([para(title,'heading'),HRFlowable(width='100%',thickness=.45,color=HexColor('#bcc8d1'),spaceAfter=4)]))
def entry(title,date='',subtitle=''):
 text=escape(title)+(f' <font name="Helvetica" color="#465564">| {escape(date)}</font>' if date else '')
 items=[para(text,'entry')]
 if subtitle:items.append(para(escape(subtitle)))
 flow.append(KeepTogether(items))
def bullets(items):
 for item in items:add('- '+escape(item),'bullet')
def project(title,tools,items):
 flow.append(KeepTogether([para(f'{escape(title)} <font name="Helvetica" color="#465564">| {escape(tools)}</font>','entry')]+[para('- '+escape(t),'bullet') for t in items]))
add('NAREDDY JASHWANTH REDDY','name')
add('AI / MACHINE LEARNING ENGINEER | GENERATIVE AI | COMPUTER VISION','role')
add('Melbourne, VIC | +61 432 396 557 | <link href="mailto:jashwanthreddysungjin@gmail.com">jashwanthreddysungjin@gmail.com</link>','contact')
add('<link href="https://github.com/NaReddyJashwanthReddy">GitHub: NaReddyJashwanthReddy</link> | <link href="https://www.kaggle.com/jashwanthreddy0264">Kaggle: jashwanthreddy0264</link>','contact')
if args.portfolio:
 url=escape(args.portfolio.rstrip('/'))
 add(f'<link href="{url}">Portfolio: {url.removeprefix("https://")}</link>','contact')
section('PROFESSIONAL SUMMARY')
add('AI Engineer and Master of Artificial Intelligence student with production experience in computer vision, multimodal AI, and generative models. Builds end-to-end ML pipelines, inference APIs, and cloud deployments, with project experience in LLM adaptation, RAG, and agents. Delivered &gt;99% vision detection accuracy and reduced manual photo-editing effort by 60%.')
section('PROFESSIONAL EXPERIENCE')
entry('Fotos - AI Engineer','Feb 2025 - Jan 2026 | Remote')
bullets([
 'Developed and deployed computer-vision microservices on GCP using TensorFlow, OpenCV, RetinaFace, and DeepFace/ArcFace; achieved >99% accuracy for facial, eye, and mouth topology detection.',
 'Built photo-culling workflows combining face detection, identity clustering, quality/expression scoring, and Qwen2.5-VL served with vLLM for context-aware image assessment and ranking.',
 'Developed neural preset-based color style-transfer models, reducing manual professional photo-editing effort by 60%. Managed cloud deployments, inference APIs, and model performance monitoring.',
])
entry('Navodita InfoTech - Artificial Intelligence Intern','Jan 2024 - Feb 2024 | Remote')
bullets(['Built an NLP chatbot using spaCy/NLTK and transformer-based response generation, plus a French-English encoder-decoder translator achieving BLEU 0.8.'])
section('SELECTED TECHNICAL PROJECTS')
project('Multi-Agent & Voice AI Assistants','LangGraph, RAG, Google APIs, STT/TTS',[
 'Built a Telegram assistant that detects intent, routes email/calendar/news/travel workflows, uses RAG for knowledge queries, and executes Google API actions.',
 'Developed a travel-sales voice assistant connecting speech recognition, conversational intent handling, travel-information retrieval, and text-to-speech.',
])
project('LLM Fine-Tuning & Domain Adaptation','Qwen3, Hugging Face, PyTorch',[
 'Fine-tuned a conversational LLM on role-structured, multi-turn public chat data for concise replies; tested behavior on unseen prompts.',
 'Continued pretraining of Qwen3 on a curated corpus of approximately 20 medical books across specialties to adapt terminology and concepts for a health-information assistant.',
])
project('Generative Models from Scratch','PyTorch, GANs, Diffusion, U-Net, CIFAR',[
 'Implemented GAN architectures, adversarial loss, alternating optimization, and image generation on CIFAR to study training stability. Built a diffusion model with a noise schedule, timestep conditioning, U-Net prediction, and reverse denoising.',
])
project('Multimodal Image Analysis & Computer Vision','Vision-Language Models, CLIP, YOLO, OpenCV',[
 'Built an image-and-text assessment pipeline returning structured JSON with quality scores, visual drawbacks, and explanations. Developed CLIP similarity/ranking experiments and YOLO/OpenCV object-detection pipelines.',
])
project('Predictive ML & Analytics','XGBoost, Random Forest, Optuna, SQL, FastAPI, Power BI',[
 'Built a churn intelligence workflow with SQL/EDA, stratified cross-validation, FastAPI, Power BI, and A/B-testing design. Achieved 0.97070 public-leaderboard ROC-AUC on a Kaggle loan-approval classifier using Optuna and 5-fold cross-validation.',
])
section('TECHNICAL SKILLS')
add('<b>Programming &amp; data:</b> Python, SQL, C++, MongoDB, Power BI')
add('<b>ML &amp; evaluation:</b> scikit-learn, XGBoost, Random Forest, Optuna; classification, clustering, predictive modeling, feature engineering, cross-validation, A/B testing')
add('<b>Deep learning &amp; GenAI:</b> PyTorch, TensorFlow, Hugging Face; LLM fine-tuning, domain adaptation, RAG, agents, NLP, CNNs, transformers, GANs, diffusion, transfer learning, multimodal AI')
add('<b>Vision &amp; engineering:</b> YOLO, OpenCV, CLIP, vision-language models, LangGraph, LangChain, FastAPI, vLLM, GCP, Docker, Git/GitHub, REST APIs, MLOps, CUDA, OOP, deployment and monitoring')
section('EDUCATION')
entry('Monash University','2026 - 2028 (Expected)')
add('Master of Artificial Intelligence | Current WAM: 79.0 | GPA: 3.5')
entry('BVRIT (JNTUH)','2020 - 2024')
add('B.Tech in Electrical and Electronic Engineering | CGPA: 8.05/10<br/>Minor in Computer Science - Artificial Intelligence &amp; Machine Learning | CGPA: 8.90/10')
section('ACHIEVEMENTS & CERTIFICATION')
add('ATVC Innovation Runner-Up (2023) | My Anatomy AI-thon Finalist (2023)<br/>Advanced Data Science &amp; AI Certification - Intellipaat (IIT-Madras)')
doc=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=32,leftMargin=32,topMargin=26,bottomMargin=26,title='Nareddy Jashwanth Reddy - AI Engineer',author='Nareddy Jashwanth Reddy')
doc.build(flow)
qa=root/'tmp/pdfs';qa.mkdir(parents=True,exist_ok=True)
with pdfplumber.open(out) as pdf:
 print('Pages:',len(pdf.pages))
 for i,p in enumerate(pdf.pages):p.to_image(resolution=130).save(str(qa/f'resume-polished-{i+1}.png'))
 print('Portfolio included:',bool(args.portfolio))
print(out)
