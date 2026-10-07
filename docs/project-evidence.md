# Project-copy evidence

Reviewed the user's four Colab notebooks as JSON on 7 October 2026. No notebook code was executed. Cell numbers below are zero-based. The notebooks remain local and are not downloadable portfolio artifacts.

## Notebook-backed details

- `every_thing.ipynb`, cells 14–16: Qwen2.5-VL-3B-Instruct, 4-bit NF4 loading, image-plus-chat preprocessing, generation and text decoding. No saved multimodal output or benchmark is present. Structured quality-assessment JSON and CLIP/YOLO analysis are separately user-reported work; they are not results established by this notebook.
- `wikiQA_base.ipynb`, cells 19–26: DeepSeek-R1-Distill-Qwen-1.5B quantized-model saving, vLLM loading and an example generation. This supports inference prototyping, not a WikiQA benchmark or medical training.
- `projects_3.ipynb`, cells 23–27: PDF loading, 500-character chunks / 50-character overlap, all-MiniLM-L6-v2 embeddings, Chroma, Groq Qwen3-32B and RetrievalQA configured to return source documents. MultiQueryRetriever is imported but not used; do not claim multi-query retrieval from these cells.
- `projects_3.ipynb`, cells 30–44: 1,000 examples from `gaussalgo/Canard_Wiki-augmented`, 900/100 training/validation split, 30 virtual prompt tokens, LFM2-350M-PII-Extract-JP, five-epoch soft-prompt training logs, adapter save/load and base/adapted generation examples. The saved examples do not demonstrate a rewriting-quality improvement. BLEU is not published: the evaluation includes the full query/answer sequence and is not established as a clean generated-rewrite benchmark.
- `projects_3.ipynb`, cell 46: a separate rank-16 LoRA run with 4-bit NF4, five-epoch training logs. The notebook warns about packing/attention compatibility. No robust generated-response benchmark is claimed.
- `basic_diffusion.ipynb`, cells 4, 6, 14, 30, 32, 37–40: CIFAR-10 training set, 1,000-step linear noise schedule, convolutional encoder-decoder noise predictor, MSE/Adam, ten completed epochs, reverse sampler and code to save a 16-image grid. The model does not consume timesteps and has no U-Net skip connections. No saved generated-image grid or FID/quality metric is present. Describe this as an initial diffusion training study.
- The SARIMAX section in `projects_3.ipynb` ends with a sample-count error. It is not included as a completed forecasting project.

## User-reported and existing project details

The medical workflow (Qwen3, 20+ books/papers, continued pretraining then labelled conversational SFT), BPE tokenizer, BERT sentiment study, brain-tumour CNN/Optuna work and production experience are supplied by the user or existing resume. These four notebooks do not independently establish those results. The medical model was explicitly confirmed as Qwen3. Encoder-style MLM wording is retained for BERT, not Qwen3.

The brain-tumour metric remains omitted because the user could not distinguish precision from recall. Unsupported facial-detection accuracy and translator BLEU claims are removed. AgentForge remains in development, with completed architecture work described separately from implementation.

The resume retains three selected projects: AgentForge, Multimodal Image Analysis and LLM Fine-Tuning & Domain Adaptation. Separate notebook studies are described explicitly as such. The portfolio includes two or three entries per collection, with diffusion and neural style transfer grouped under image generation.

## Follow-up wording and metrics

The prompt-tuning result uses the saved cell-44 validation-loss table: 0.964061 at epoch one and 0.913545 at epoch five, rounded to 0.964 and 0.914. Labels copy the full input sequence, so this is validation sequence loss, not a response-only loss, a base-model improvement measurement or a generated-rewrite benchmark. The portfolio explains that distinction.

Docker and scikit-learn are restored from the user's existing skills and ML application work; RAG and LangChain are additionally supported by the supplied retrieval notebook. Docker is not newly attributed to Fotos based solely on GCP usage. Groq remains in project stacks, rather than the general skills list. No new Fotos scale or performance number is inferred.

The user clarified that Fotos results were reviewed on Indian wedding images with 10+ people per image, and that the >99% figure was estimated from visual review rather than measured against labels. Copy includes the image context and visual-review method, but does not present that estimate as detection accuracy.
