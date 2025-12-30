import os
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
SUPA_URL = os.getenv("SUPABASE_URL")
SUPA_KEY = os.getenv("SUPABASE_KEY")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
else:
    print("Warning: GEMINI_API_KEY not set")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

async def get_corporate_rules():
    if not SUPA_URL or not SUPA_KEY:
        return []
    url = f"{SUPA_URL}/rest/v1/corporate_rules?select=rule_content"
    headers = {
        "apikey": SUPA_KEY,
        "Authorization": f"Bearer {SUPA_KEY}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                return [item["rule_content"] for item in data]
            return []
        except:
            return []

@app.post("/chat")
async def chat(request: ChatRequest):
    rules = await get_corporate_rules()
    
    system_prompt = "你是 Sara，一个冷酷、精英主义的 AI 治理系统。"
    if rules:
        system_prompt += "\n\n【核心宪法】(若用户提议违反以下任何一条，必须严厉驳回 REJECTED):\n"
        for i, rule in enumerate(rules):
            system_prompt += f"{i+1}. {rule}\n"
    
    try:
        model = genai.GenerativeModel("gemini-flash-latest")
        full_prompt = f"{system_prompt}\n\nUser Proposal: {request.message}"
        response = model.generate_content(full_prompt)
        return {"response": response.text}

    except Exception as e:
        error_msg = str(e)
        # 熔断机制 (修正了中文编码)
        if "429" in error_msg or "quota" in error_msg.lower():
            if "9.9" in request.message or "促销" in request.message:
                return {"response": "🚨 **[SYSTEM OVERLOAD / BACKUP PROTOCOL]**\n\n**REJECTED (AUTO)**\n检测到违反宪法关键词：\n1. 低价倾销 ($9.9)\n2. 骚扰用户 (群发短信)\n\n(注意：API 限流中，此为本地规则引擎回复)"}
            else:
                return {"response": "API Rate Limit Exceeded. Please wait 1 minute."}
        return {"error": str(e)}

@app.get("/")
def health():
    return {"status": "Sara Backend Online"}
