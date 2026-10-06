"""A concise narrative resume using only the supplied career facts."""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
import pdfplumber

root=Path(__file__).resolve().parents[1]
out=root/'output/pdf/jashwanth_resume_story.pdf'
out.parent.mkdir(parents=True,exist_ok=True)
navy=HexColor('#19334b');ink=HexColor('#26323d');muted=HexColor('#576674')
styles={
 'name':ParagraphStyle('name',fontName='Helvetica-Bold',fontSize=20,leading=23,textColor=navy,spaceAfter=5),
 'role':ParagraphStyle('role',fontName='Helvetica',fontSize=10,leading=13,textColor=muted,spaceAfter=7),
 'contact':ParagraphStyle('contact',fontName='Helvetica',fontSize=8.1,leading=11,textColor=muted),
 'chapter':ParagraphStyle('chapter',fontName='Helvetica-Bold',fontSize=9.5,leading=12,textColor=navy,spaceBefore=10,spaceAfter=5),
 'entry':ParagraphStyle('entry',fontName='Helvetica-Bold',fontSize=9.4,leading=12,textColor=ink,spaceAfter=3),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=9.2,leading=12,textColor=ink,spaceAfter=5),
 'skill':ParagraphStyle('skill',fontName='Helvetica',fontSize=8.6,leading=11.4,textColor=ink,spaceAfter=3),
}
flow=[]
def p(text,style='body'):return Paragraph(text,styles[style])
def add(text,style='body'):flow.append(p(text,style))
def chapter(number,title,lead):
 flow.append(KeepTogether([p(f'{number} / {title}','chapter'),p(lead)]))
def entry(title,copy):flow.append(KeepTogether([p(title,'entry'),p(copy)]))

add('NAREDDY JASHWANTH REDDY','name')
add('AI / Machine Learning Engineer  |  Generative AI &amp; Computer Vision','role')
add('Melbourne, VIC  |  +61 432 396 557  |  <link href="mailto:jashwanthreddysungjin@gmail.com">jashwanthreddysungjin@gmail.com</link>','contact')
add('<link href="https://jashwanth-reddy-portfolio.vercel.app">Portfolio: jashwanth-reddy-portfolio.vercel.app</link>  |  <link href="https://github.com/NaReddyJashwanthReddy">GitHub: NaReddyJashwanthReddy</link>','contact')
add('<link href="https://www.kaggle.com/jashwanthreddy0264">Kaggle: jashwanthreddy0264</link>','contact')
flow.append(Spacer(1,10))
flow.append(HRFlowable(width='100%',thickness=1,color=navy,spaceAfter=9))
add('My path into AI began with electrical engineering and an AI/ML minor. It has since taken me from language-model experiments to production computer vision, with <b>&gt;99% detection accuracy</b> and <b>60% less manual editing effort</b> at Fotos. Today, I’m extending that foundation through a Master of Artificial Intelligence at Monash University.')

chapter('01','EDUCATION | THE FOUNDATION',
 'At <b>BVRIT (JNTUH), 2020-2024</b>, I studied Electrical and Electronic Engineering alongside a Computer Science minor in Artificial Intelligence &amp; Machine Learning. I graduated with a <b>B.Tech CGPA of 8.05/10</b> and a <b>minor CGPA of 8.90/10</b>.')

chapter('02','PROFESSIONAL EXPERIENCE | FROM LANGUAGE TO VISION',
 '<b>Navodita InfoTech - Artificial Intelligence Intern | Jan-Feb 2024 | Remote</b><br/>My early professional work focused on language: a chatbot combining spaCy/NLTK with transformer-generated responses, and a French-English encoder-decoder translator that achieved <b>BLEU 0.8</b>.')
entry('Fotos - AI Engineer | Feb 2025-Jan 2026 | Remote',
 'At Fotos, the work expanded into production photography workflows. I deployed vision microservices on GCP using TensorFlow, OpenCV, RetinaFace, and DeepFace/ArcFace, achieving <b>&gt;99% accuracy</b> for facial, eye, and mouth topology detection. For photo culling, I combined identity clustering and quality/expression scoring with Qwen2.5-VL served through vLLM for context-aware ranking.<br/><br/>The next part of the workflow was editing. Neural preset-based color style-transfer models reduced manual professional editing effort by <b>60%</b>. Cloud deployment, inference APIs, and performance monitoring connected the models to production serving.')

chapter('03','SELECTED PROJECTS | CONNECTING THE PIECES',
 '<b>Assistants that move from conversation to action.</b> A Telegram assistant uses LangGraph, intent routing, RAG, and Google APIs across email, calendar, news, and travel workflows. A separate travel-sales voice assistant connects speech recognition, an LLM, retrieval, and text-to-speech.')
add('<b>Language adapted to context.</b> I fine-tuned a conversational LLM on role-structured, multi-turn chat data for concise replies and tested unseen prompts. Qwen3 continued pretraining on approximately 20 medical books explored domain terminology for a health-information assistant.')
add('<b>Understanding and generating images.</b> I implemented GAN and diffusion models from scratch on CIFAR, including adversarial training, timestep conditioning, U-Net noise prediction, and reverse denoising. Multimodal experiments combine structured image-quality assessments with CLIP ranking and YOLO/OpenCV detection.')
add('<b>Predictions connected to decisions.</b> A churn workflow brings together SQL/EDA, Random Forest, cross-validation, FastAPI, Power BI, and A/B-testing design. A Kaggle loan-approval classifier using XGBoost/Random Forest, Optuna, and 5-fold cross-validation achieved <b>0.97070 public-leaderboard ROC-AUC</b>.')

chapter('04','EDUCATION | THE NEXT CHAPTER',
 'I’m now pursuing a <b>Master of Artificial Intelligence at Monash University, 2026-2028 (expected)</b>, with a current <b>WAM of 79.0</b> and <b>GPA of 3.5</b>. My work spans model development, multimodal reasoning, and the engineering needed to deploy AI systems.')

flow.append(p('TECHNICAL SKILLS','chapter'))
add('<b>Core:</b> Python, SQL, C++, MongoDB, Power BI; scikit-learn, XGBoost, Random Forest, Optuna.<br/><b>AI:</b> PyTorch, TensorFlow, Hugging Face, LLM fine-tuning, RAG, LangGraph, LangChain, NLP, CNNs, transformers, GANs, diffusion, YOLO, OpenCV, CLIP.<br/><b>Engineering:</b> FastAPI, vLLM, GCP, Docker, Git/GitHub, REST APIs, CUDA, MLOps, deployment and monitoring.','skill')
flow.append(p('ACHIEVEMENTS &amp; CERTIFICATION','chapter'))
add('ATVC Innovation Runner-Up (2023) | My Anatomy AI-thon Finalist (2023)<br/>Advanced Data Science &amp; AI Certification - Intellipaat (IIT-Madras)','skill')
doc=SimpleDocTemplate(str(out),pagesize=A4,leftMargin=35,rightMargin=35,topMargin=28,bottomMargin=27,title='Nareddy Jashwanth Reddy - AI Engineering Story',author='Nareddy Jashwanth Reddy')
doc.build(flow)
qa=root/'tmp/pdfs';qa.mkdir(parents=True,exist_ok=True)
with pdfplumber.open(out) as pdf:
 print('Pages:',len(pdf.pages))
 for i,page in enumerate(pdf.pages):page.to_image(resolution=130).save(str(qa/f'resume-story-{i+1}.png'))
print(out)
