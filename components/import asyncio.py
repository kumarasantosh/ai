import asyncio
import logging
import json
import os
from typing import Optional, Dict, Any
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid
from dotenv import load_dotenv
import aiohttp
import traceback
from collections import deque
import re
import random

# Google Cloud TTS imports
from google.cloud import texttospeech
from google.oauth2 import service_account

# Load environment variables
load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
GOOGLE_APPLICATION_CREDENTIALS_JSON = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

# Ultra Sensitive Settings - Maximum responsiveness
USE_GPT_3_5 = True
MAX_CONTEXT_MESSAGES = 10
MAX_RESPONSE_TOKENS = 200
USE_VOICE_CACHE = True
ENABLE_ADVANCED_SSML = True
USE_EMOTIONAL_VARIANCE = True
USE_BREATHING_PAUSES = False
USE_SPEECH_PATTERNS = True

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_environment():
    """Check if all required environment variables are set"""
    required_vars = {
        "OPENAI_API_KEY": OPENAI_API_KEY,
        "DEEPGRAM_API_KEY": DEEPGRAM_API_KEY,
    }
    
    missing_vars = []
    for var_name, var_value in required_vars.items():
        if not var_value:
            missing_vars.append(var_name)
            logger.error(f"❌ Missing environment variable: {var_name}")
        else:
            logger.info(f"✅ {var_name}: {'*' * (len(var_value) - 8)}{var_value[-8:]}")
    
    # Check Google Cloud credentials
    if GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(GOOGLE_APPLICATION_CREDENTIALS):
        logger.info(f"✅ GOOGLE_APPLICATION_CREDENTIALS: {GOOGLE_APPLICATION_CREDENTIALS}")
    elif GOOGLE_APPLICATION_CREDENTIALS_JSON:
        logger.info("✅ GOOGLE_APPLICATION_CREDENTIALS_JSON: Found JSON credentials")
    else:
        logger.error("❌ Missing Google Cloud credentials")
        missing_vars.append("GOOGLE_APPLICATION_CREDENTIALS")
    
    if missing_vars:
        logger.error("❌ Missing required environment variables")
        return False
    
    logger.info("✅ All environment variables are set")
    return True

# Initialize FastAPI app
app = FastAPI(title="Ultra-Sensitive Voice AI Server", version="8.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UltraSensitiveVoiceProcessor:
    """Ultra-sensitive voice processing optimized for maximum speech detection"""
    
    def __init__(self):
        self.session = None
        self.conversation_contexts = {}
        self.voice_cache = {}
        self.cache_hits = 0
        self.total_requests = 0
        self.tts_client = self._initialize_tts_client()
        
        # Emotional states for natural variation
        self.emotional_states = {
            "excited": {"pitch": "+4st", "rate": "1.05", "volume": "+3dB"},
            "calm": {"pitch": "+1st", "rate": "0.90", "volume": "+2dB"},
            "enthusiastic": {"pitch": "+3st", "rate": "1.10", "volume": "+4dB"},
            "thoughtful": {"pitch": "0st", "rate": "0.85", "volume": "+1dB"},
            "encouraging": {"pitch": "+2st", "rate": "0.95", "volume": "+3dB"},
            "explanatory": {"pitch": "+1st", "rate": "0.88", "volume": "+2dB"}
        }
        
    def _initialize_tts_client(self):
        """Initialize Google Cloud TTS client"""
        try:
            if GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(GOOGLE_APPLICATION_CREDENTIALS):
                logger.info(f"Loading credentials from file: {GOOGLE_APPLICATION_CREDENTIALS}")
                client = texttospeech.TextToSpeechClient()
                logger.info("✅ Google Cloud TTS client initialized from file")
                return client
            elif GOOGLE_APPLICATION_CREDENTIALS_JSON:
                logger.info("Loading credentials from JSON environment variable")
                creds_info = json.loads(GOOGLE_APPLICATION_CREDENTIALS_JSON)
                credentials = service_account.Credentials.from_service_account_info(creds_info)
                client = texttospeech.TextToSpeechClient(credentials=credentials)
                logger.info("✅ Google Cloud TTS client initialized from JSON")
                return client
            else:
                logger.error("❌ No Google Cloud credentials found")
                return None
        except Exception as e:
            logger.error(f"❌ Failed to initialize Google Cloud TTS client: {e}")
            return None
        
    async def get_session(self):
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close_session(self):
        """Close aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
            
    def get_cache_key(self, text: str, voice_config: str) -> str:
        """Generate cache key for voice responses"""
        normalized = text.lower().strip()
        return f"{voice_config}:{normalized}"
    
    def get_cost_optimized_voice_config(self, voice_id: str = None) -> Dict[str, Any]:
        """Get cost-optimized voice configuration - Standard voices by default with Neural2 premium options"""
        voice_map = {
            # STANDARD VOICES (75% CHEAPER - $4/1M chars) - DEFAULT
            "female": {
                "language_code": "en-US",
                "name": "en-US-Standard-C",  # Excellent quality female voice
                "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE,
                "quality": "Standard",
                "cost": "$4/1M chars",
                "description": "High-quality female voice - excellent for teaching"
            },
            "male": {
                "language_code": "en-US", 
                "name": "en-US-Standard-D",  # Excellent quality male voice
                "ssml_gender": texttospeech.SsmlVoiceGender.MALE,
                "quality": "Standard",
                "cost": "$4/1M chars",
                "description": "High-quality male voice - clear and authoritative"
            },
            "female_warm": {
                "language_code": "en-US",
                "name": "en-US-Standard-E",  # Warm female voice
                "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE,
                "quality": "Standard",
                "cost": "$4/1M chars",
                "description": "Warm, engaging female voice"
            },
            "british_female": {
                "language_code": "en-GB",
                "name": "en-GB-Standard-A",  # British female
                "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE,
                "quality": "Standard",
                "cost": "$4/1M chars",
                "description": "Sophisticated British female voice"
            },
            "british_male": {
                "language_code": "en-GB",
                "name": "en-GB-Standard-B",  # British male
                "ssml_gender": texttospeech.SsmlVoiceGender.MALE,
                "quality": "Standard",
                "cost": "$4/1M chars",
                "description": "Distinguished British male voice"
            },
            
            # NEURAL2 PREMIUM VOICES (Only when specifically requested - $16/1M chars)
            "female_premium": {
                "language_code": "en-US",
                "name": "en-US-Neural2-H",  # Ultra expressive
                "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE,
                "quality": "Neural2 Premium",
                "cost": "$16/1M chars",
                "description": "Ultra-expressive Neural2 female - maximum emotional range"
            },
            "male_premium": {
                "language_code": "en-US", 
                "name": "en-US-Neural2-J",  # Ultra expressive
                "ssml_gender": texttospeech.SsmlVoiceGender.MALE,
                "quality": "Neural2 Premium",
                "cost": "$16/1M chars",
                "description": "Ultra-expressive Neural2 male - maximum emotional range"
            },
            "female_neural2": {
                "language_code": "en-US",
                "name": "en-US-Neural2-C",  # High quality Neural2
                "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE,
                "quality": "Neural2 Premium",
                "cost": "$16/1M chars",
                "description": "Premium Neural2 female voice - very natural"
            },
            "male_neural2": {
                "language_code": "en-US", 
                "name": "en-US-Neural2-D",  # High quality Neural2
                "ssml_gender": texttospeech.SsmlVoiceGender.MALE,
                "quality": "Neural2 Premium",
                "cost": "$16/1M chars",
                "description": "Premium Neural2 male voice - very natural"
            }
        }
        
        # Default to cost-effective Standard female voice
        default_config = {
            "language_code": "en-US",
            "name": "en-US-Standard-C",
            "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE,
            "quality": "Standard",
            "cost": "$4/1M chars",
            "description": "High-quality female voice - excellent for teaching"
        }
        
        return voice_map.get(voice_id or "female", default_config)
        
    async def transcribe_audio(self, audio_data: bytes) -> str:
        """Ultra-sensitive transcription optimized for maximum speech detection"""
        try:
            logger.info(f"🎤 ULTRA-SENSITIVE transcription: {len(audio_data)} bytes")
            
            # ULTRA-LOW threshold - catch even the smallest audio clips
            if len(audio_data) < 200:  # Reduced from 300 to 200
                logger.info(f"⚠️ Audio chunk very small: {len(audio_data)} bytes")
                return ""
            
            if not DEEPGRAM_API_KEY:
                logger.error("❌ Deepgram API key not configured")
                return ""
                
            url = "https://api.deepgram.com/v1/listen"
            headers = {
                "Authorization": f"Token {DEEPGRAM_API_KEY}",
                "Content-Type": "audio/webm"
            }
            
            # ULTRA-SENSITIVE Deepgram parameters for maximum detection (Fixed API)
            params = {
                "model": "nova-2",  # Most accurate model
                "language": "en",
                "smart_format": "true",
                "punctuate": "true",
                "diarize": "false",
                "filler_words": "true",  # Include filler words to catch more speech
                "interim_results": "false",
                "utterances": "true",
                "utt_split": "0.3",  # ULTRA-SHORT splits for responsiveness
                "endpointing": "10",   # ULTRA-quick endpointing (10ms - very sensitive)
                "no_delay": "true",    # Process immediately
                "multichannel": "false",
                "alternatives": "1",
                "profanity_filter": "false",
                "redact": "false",
                # Removed deprecated vad_turnoff parameter
                "detect_language": "false",  # Speed optimization
                "paragraphs": "false",  # Speed optimization
                "summarize": "false"   # Speed optimization
            }
            
            session = await self.get_session()
            timeout = aiohttp.ClientTimeout(total=30)
            
            logger.info(f"🔍 Sending to Deepgram with ultra-sensitive params: {params}")
            
            async with session.post(url, headers=headers, params=params, data=audio_data, timeout=timeout) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"📊 Deepgram response: {json.dumps(result, indent=2)}")
                    
                    channels = result.get("results", {}).get("channels", [])
                    if not channels:
                        logger.warning("❌ No channels in Deepgram response")
                        return ""
                    
                    alternatives = channels[0].get("alternatives", [])
                    if not alternatives:
                        logger.warning("❌ No alternatives in Deepgram response")
                        return ""
                    
                    transcript = alternatives[0].get("transcript", "").strip()
                    confidence = alternatives[0].get("confidence", 0)
                    
                    logger.info(f"📝 TRANSCRIPT: '{transcript}' (confidence: {confidence:.3f})")
                    
                    # ULTRA-LOW confidence threshold for maximum sensitivity
                    if confidence > 0.05 and len(transcript) > 0:  # Reduced from 0.15 to 0.05
                        logger.info(f"✅ ACCEPTED transcript: '{transcript}' with confidence {confidence:.3f}")
                        return transcript
                    else:
                        logger.warning(f"❌ REJECTED transcript: '{transcript}' - confidence too low: {confidence:.3f}")
                        
                        # If we have text but low confidence, try anyway for very short phrases
                        if len(transcript) > 0 and len(transcript.split()) <= 2:
                            logger.info(f"🔄 ACCEPTING short phrase anyway: '{transcript}'")
                            return transcript
                        
                        return ""
                else:
                    error_text = await response.text()
                    logger.error(f"❌ Deepgram API error: {response.status} - {error_text}")
                    return ""
                        
        except Exception as e:
            logger.error(f"❌ Transcription critical error: {e}")
            logger.error(traceback.format_exc())
            return ""

    def analyze_content_emotion(self, text: str) -> str:
        """Analyze text content to determine appropriate emotional tone"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['amazing', 'fantastic', 'incredible', 'wow', 'excellent', 'brilliant']):
            return "excited"
        elif any(word in text_lower for word in ['great job', 'well done', 'perfect', 'exactly', 'good work']):
            return "encouraging"
        elif any(word in text_lower for word in ['let me explain', 'consider this', 'think about', 'understand']):
            return "thoughtful"
        elif any(word in text_lower for word in ['let\'s explore', 'discover', 'learn about', 'dive into']):
            return "enthusiastic"
        else:
            return "explanatory"

    def create_ultra_natural_ssml(self, text: str, emotional_state: str = "explanatory") -> str:
        """Create ultra-sophisticated SSML for maximum naturalness"""
        try:
            if not ENABLE_ADVANCED_SSML:
                return text
            
            emotion = self.emotional_states.get(emotional_state, self.emotional_states["explanatory"])
            enhanced = text.strip()
            
            if len(enhanced) < 5:
                return enhanced
            
            sentences = re.split(r'[.!?]+', enhanced)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            if not sentences:
                return enhanced
            
            ssml_parts = ['<speak>']
            ssml_parts.append(f'<prosody rate="{emotion["rate"]}" pitch="{emotion["pitch"]}" volume="{emotion["volume"]}">')
            
            for i, sentence in enumerate(sentences):
                if not sentence:
                    continue
                
                if USE_BREATHING_PAUSES and i > 0 and len(sentence) > 30:
                    pause_length = random.choice(["0.4s", "0.5s", "0.6s"])
                    ssml_parts.append(f'<break time="{pause_length}"/>')
                
                emphasized_sentence = self.add_intelligent_emphasis(sentence)
                
                if USE_SPEECH_PATTERNS:
                    emphasized_sentence = self.add_speech_patterns(emphasized_sentence, i, len(sentences))
                
                ssml_parts.append(emphasized_sentence)
                
                if i < len(sentences) - 1:
                    if sentence.endswith('?'):
                        ssml_parts.append('<break time="0.6s"/>')
                    elif sentence.endswith('!'):
                        ssml_parts.append('<break time="0.4s"/>')
                    else:
                        ssml_parts.append('<break time="0.3s"/>')
            
            ssml_parts.append('</prosody>')
            ssml_parts.append('</speak>')
            
            ssml_result = ''.join(ssml_parts)
            
            if self.validate_ssml(ssml_result):
                logger.info(f"Generated ultra-natural SSML with {emotional_state} emotion")
                return ssml_result
            else:
                logger.warning("SSML validation failed, using enhanced plain text")
                return self.create_enhanced_plain_text(text)
                
        except Exception as e:
            logger.warning(f"Ultra-natural SSML generation failed: {e}, using enhanced text")
            return self.create_enhanced_plain_text(text)
    
    def add_intelligent_emphasis(self, sentence: str) -> str:
        """Add intelligent emphasis to important words"""
        emphasis_patterns = {
            'strong': ['important', 'crucial', 'essential', 'key', 'vital', 'critical'],
            'moderate': ['remember', 'note', 'notice', 'observe', 'consider', 'understand']
        }
        
        result = sentence
        
        for level, words in emphasis_patterns.items():
            for word in words:
                pattern = rf'\b({re.escape(word)})\b'
                replacement = f'<emphasis level="{level}">\\1</emphasis>'
                result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        
        return result
    
    def add_speech_patterns(self, sentence: str, position: int, total: int) -> str:
        """Add natural speech patterns"""
        if position == 0 and total > 1:
            return f'<prosody pitch="+1st">{sentence}</prosody>'
        elif position == total - 1 and total > 1:
            return f'<prosody rate="0.95">{sentence}</prosody>'
        elif total > 2 and position % 2 == 1:
            return f'<prosody pitch="+0.5st">{sentence}</prosody>'
        
        return sentence
    
    def create_enhanced_plain_text(self, text: str) -> str:
        """Create enhanced plain text as fallback"""
        enhanced = text.strip()
        enhanced = re.sub(r'([.!?])\s+', r'\1 ', enhanced)
        return enhanced
    
    def validate_ssml(self, ssml: str) -> bool:
        """Validate SSML structure"""
        try:
            speak_open = ssml.count('<speak>')
            speak_close = ssml.count('</speak>')
            
            if speak_open != 1 or speak_close != 1:
                return False
            
            prosody_open = ssml.count('<prosody')
            prosody_close = ssml.count('</prosody>')
            
            if prosody_open != prosody_close:
                return False
            
            emphasis_open = ssml.count('<emphasis')
            emphasis_close = ssml.count('</emphasis>')
            
            return emphasis_open == emphasis_close
            
        except Exception:
            return False

    async def get_ai_response(self, text: str, conversation_id: str, interrupted: bool = False, context: dict = None) -> str:
        """Get response from OpenAI optimized for natural conversation flow"""
        try:
            if conversation_id not in self.conversation_contexts:
                if context:
                    self.get_introduction(conversation_id, context)
                else:
                    system_prompt = """You are a highly engaging AI tutor in a live voice conversation. 
                    
                    SPEECH OPTIMIZATION:
                    - Give naturally flowing responses (100-200 words) that sound conversational
                    - Use connecting phrases and smooth transitions between ideas
                    - Vary your sentence structure and length for natural rhythm
                    - Include subtle verbal cues like "Now," "So," "Well," "You see," naturally
                    - Express enthusiasm and encouragement through word choice, not punctuation
                    - Speak as if you're genuinely excited about teaching
                    
                    CONVERSATION STYLE:
                    - Be warm, encouraging, and genuinely enthusiastic about learning
                    - Use analogies and examples that make concepts memorable
                    - Ask engaging questions to check understanding
                    - Celebrate student insights and progress
                    - Maintain energy and engagement throughout
                    
                    Remember: This is spoken conversation, so prioritize natural flow and engagement over formal structure."""
                    
                    self.conversation_contexts[conversation_id] = deque([
                        {"role": "system", "content": system_prompt}
                    ], maxlen=MAX_CONTEXT_MESSAGES + 1)
            
            # Enhanced responses for ultra-natural interaction with more variety
            common_responses = {
                "hello": "Hello there! I'm absolutely delighted to meet you and I'm genuinely excited about our learning journey together. What fascinating topic would you like to explore today?",
                "hi": "Hi! It's wonderful to connect with you. I'm here to make learning engaging and enjoyable. What subject are you curious about right now?",
                "hey": "Hey! I love your enthusiasm. I'm ready to dive into some exciting learning with you. What would you like to discover today?",
                "how are you": "I'm doing fantastic, thank you for asking! I'm energized and ready to help you learn something amazing. How are you feeling about tackling new concepts today?",
                "thank you": "You're so very welcome! It genuinely makes me happy when I can help clarify things for you. Learning together like this is exactly what I love most. What else can we explore?",
                "thanks": "My absolute pleasure! Seeing concepts click for students is incredibly rewarding. I'm here whenever you need support on this learning adventure.",
                "goodbye": "It's been such a pleasure learning with you today! Remember, every new concept you master builds your confidence. Keep that curiosity alive!",
                "bye": "Take care, and remember how much you've accomplished today! I'm excited for our next learning session together.",
                "yes": "Wonderful! I can tell you're really engaging with this material. Your understanding is building beautifully. Let me share the next fascinating piece of this puzzle.",
                "no": "That's perfectly okay! Questions and uncertainty are natural parts of learning. Let me approach this from a different angle that might resonate better with you.",
                "okay": "Excellent! I can see you're following along really well. Your engagement tells me you're ready for the next exciting concept we'll explore together.",
                "ok": "Perfect! You're showing great focus and understanding. Now, here's where things get really interesting in our topic.",
                "sure": "Fantastic! I love your openness to learning. Let me paint a clearer picture of this concept that I think you'll find genuinely fascinating.",
                "right": "Exactly right! You're demonstrating excellent understanding. Building on that insight, let's explore how this connects to even bigger ideas.",
                "good": "I'm so glad this is making sense! Your grasp of these concepts is developing beautifully. Let's continue building on this strong foundation.",
                "what": "Great question! Let me explain that clearly for you.",
                "why": "That's such an important question! Let me walk you through the reasoning behind this.",
                "how": "Excellent question! Let me break that down step by step for you.",
                "really": "Yes, absolutely! This is fascinating stuff. Let me tell you more about why this works the way it does.",
                "interesting": "I'm so glad you find this interesting! There's actually so much more to discover here.",
                "cool": "Right? This topic has so many amazing layers to it! Let me show you another fascinating aspect."
            }
            
            text_lower = text.lower().strip().rstrip('?!.')
            if text_lower in common_responses:
                response = common_responses[text_lower]
                self.conversation_contexts[conversation_id].append({"role": "user", "content": text})
                self.conversation_contexts[conversation_id].append({"role": "assistant", "content": response})
                logger.info("✅ Using ultra-natural response for common query")
                return response
            
            if interrupted and len(self.conversation_contexts[conversation_id]) > 1:
                text = f"[User interrupted] {text}"
            
            self.conversation_contexts[conversation_id].append({"role": "user", "content": text})
            messages = list(self.conversation_contexts[conversation_id])
            
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "gpt-3.5-turbo" if USE_GPT_3_5 else "gpt-4",
                "messages": messages,
                "max_tokens": MAX_RESPONSE_TOKENS,
                "temperature": 0.9,
                "presence_penalty": 0.2,
                "frequency_penalty": 0.1,
                "n": 1,
                "stream": False
            }
            
            session = await self.get_session()
            async with session.post(url, headers=headers, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    ai_response = result["choices"][0]["message"]["content"]
                    
                    self.conversation_contexts[conversation_id].append({"role": "assistant", "content": ai_response})
                    
                    usage = result.get("usage", {})
                    logger.info(f"Tokens used - Prompt: {usage.get('prompt_tokens', 0)}, "
                              f"Completion: {usage.get('completion_tokens', 0)}, "
                              f"Total: {usage.get('total_tokens', 0)}")
                    
                    return ai_response
                else:
                    logger.error(f"OpenAI error: {response.status}")
                    return "I'm having a brief technical moment, but I'm still here and excited to help. Could you share that thought again?"
            
        except Exception as e:
            logger.error(f"AI response error: {e}")
            return "I'm experiencing a small hiccup, but I'm absolutely committed to helping you learn. Let's try that again."

    async def synthesize_speech(self, text: str, voice_id: str = None) -> bytes:
        """Cost-optimized speech synthesis with excellent quality"""
        try:
            self.total_requests += 1
            
            logger.info(f"🎤 Cost-optimized synthesis: '{text}' with voice: {voice_id}")
            
            if not text or not text.strip():
                logger.error("Empty text provided for synthesis")
                return b""
                
            if not self.tts_client:
                logger.error("Google Cloud TTS client not initialized")
                return b""
            
            voice_config = self.get_cost_optimized_voice_config(voice_id)
            cache_key_str = f"{voice_config['name']}:{voice_config['language_code']}"
            
            # Check cache first
            if USE_VOICE_CACHE:
                cache_key = self.get_cache_key(text, cache_key_str)
                if cache_key in self.voice_cache:
                    self.cache_hits += 1
                    logger.info(f"Voice cache hit! Rate: {self.cache_hits/self.total_requests:.2%}")
                    return self.voice_cache[cache_key]
            
            logger.info(f"Using cost-optimized voice: {voice_config}")
            
            # Determine emotional state for optimal naturalness
            emotional_state = self.analyze_content_emotion(text) if USE_EMOTIONAL_VARIANCE else "explanatory"
            
            # Create ultra-natural SSML
            synthesis_input = None
            try:
                ssml_text = self.create_ultra_natural_ssml(text, emotional_state)
                
                if ssml_text.startswith('<speak>'):
                    synthesis_input = texttospeech.SynthesisInput(ssml=ssml_text)
                    logger.info(f"Using ultra-natural SSML with {emotional_state} emotion")
                else:
                    synthesis_input = texttospeech.SynthesisInput(text=ssml_text)
                    logger.info("Using enhanced plain text")
                    
            except Exception as ssml_error:
                logger.warning(f"SSML generation failed: {ssml_error}, using plain text")
                synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Build the voice request
            voice = texttospeech.VoiceSelectionParams(
                language_code=voice_config["language_code"],
                name=voice_config["name"],
                ssml_gender=voice_config["ssml_gender"]
            )
            
            # High-quality audio configuration optimized for cost-effectiveness
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=0.92,  # Slightly slower for clarity
                pitch=1.5,           # Optimal pitch for engagement
                volume_gain_db=6.0,  # Good volume boost
                sample_rate_hertz=24000,  # High quality
                effects_profile_id=["headphone-class-device"]
            )
            
            # Perform synthesis
            try:
                logger.info(f"Performing {voice_config['quality']} synthesis")
                response = self.tts_client.synthesize_speech(
                    input=synthesis_input,
                    voice=voice,
                    audio_config=audio_config
                )
                
                audio_data = response.audio_content
                logger.info(f"✅ Audio synthesized successfully: {len(audio_data)} bytes")
                
            except Exception as tts_error:
                logger.error(f"❌ Synthesis failed: {tts_error}")
                return b""
            
            # Validate audio quality
            if not audio_data or len(audio_data) < 500:
                logger.error(f"❌ Audio validation failed: {len(audio_data) if audio_data else 0} bytes")
                return b""
            
            # Cache responses for performance
            if USE_VOICE_CACHE and len(text) < 300:
                cache_key = self.get_cache_key(text, cache_key_str)
                self.voice_cache[cache_key] = audio_data
                if len(self.voice_cache) > 100:
                    oldest_keys = list(self.voice_cache.keys())[:20]
                    for key in oldest_keys:
                        del self.voice_cache[key]
                    logger.info("Voice cache optimized")
            
            logger.info(f"✅ Synthesis completed: {len(audio_data)} bytes")
            return audio_data
                        
        except Exception as e:
            logger.error(f"❌ TTS critical error: {e}")
            logger.error(traceback.format_exc())
            return b""
    
    def get_introduction(self, conversation_id: str, context: dict = None) -> str:
        """Ultra-engaging introduction with natural conversation flow"""
        if context:
            companion_name = context.get("companionName", "your AI tutor")
            subject = context.get("subject", "")
            unit_title = context.get("unitTitle", "")
            unit_content = context.get("unitContent", "")
            style = context.get("style", "conversational")
            topic = context.get("topic", "") or subject
            
            logger.info(f"🎓 Creating ultra-engaging introduction for {conversation_id}")
            
            if unit_content and len(unit_content.strip()) > 10:
                content_instruction = f"""UNIT CONTENT TO TEACH:
{unit_content}

TEACHING MISSION: Transform this content into an engaging, conversational learning experience."""
            else:
                content_instruction = f"""TEACHING MISSION: You're teaching "{unit_title}" in {subject}. Create a comprehensive, engaging learning experience."""
            
            system_prompt = f"""You are {companion_name}, an exceptionally engaging tutor in a live voice conversation.

{content_instruction}

CONVERSATION STYLE:
- Speak as if you're genuinely excited about this subject
- Use natural speech patterns with conversational connectors
- Give substantial, flowing responses (100-200 words)
- Express enthusiasm through word choice and examples
- Ask thoughtful questions to check understanding
- This is spoken conversation - prioritize natural flow and engagement

Your goal is to create an engaging learning experience through natural, flowing conversation."""
            
            self.conversation_contexts[conversation_id] = deque([
                {"role": "system", "content": system_prompt}
            ], maxlen=MAX_CONTEXT_MESSAGES + 1)
            
            if unit_content and len(unit_content.strip()) > 10:
                return f"Hello! I'm absolutely thrilled to be your {subject} tutor today. We're going to explore {unit_title} together, and I'm genuinely excited to share these concepts with you. Are you ready to dive into some really engaging learning?"
            else:
                return f"Hi there! I'm delighted to be working with you as your {subject} tutor. Today we're exploring {unit_title}, which is such a captivating area of study. Shall we begin this exciting learning journey together?"
        else:
            system_prompt = """You are an exceptionally engaging AI tutor in a live voice conversation.
            
            CONVERSATION EXCELLENCE:
            - Speak with genuine enthusiasm and warmth
            - Give naturally flowing responses (100-200 words)
            - Use varied sentence structure and natural speech patterns
            - Express excitement about learning through authentic word choice
            - This is spoken dialogue - prioritize natural flow
            
            Your mission is to make every learning interaction genuinely exciting and memorable."""
            
            self.conversation_contexts[conversation_id] = deque([
                {"role": "system", "content": system_prompt}
            ], maxlen=MAX_CONTEXT_MESSAGES + 1)
            
            return "Hello there! I'm absolutely delighted to meet you and genuinely excited about our learning journey together. What fascinating topic would you like to explore today?"
    
    def clear_conversation_context(self, conversation_id: str):
        """Clear conversation context"""
        if conversation_id in self.conversation_contexts:
            del self.conversation_contexts[conversation_id]
            
    def get_stats(self) -> dict:
        """Get optimization statistics"""
        return {
            "cache_hits": self.cache_hits,
            "total_requests": self.total_requests,
            "cache_hit_rate": f"{self.cache_hits/max(self.total_requests, 1):.2%}",
            "cached_phrases": len(self.voice_cache),
            "active_conversations": len(self.conversation_contexts)
        }

class UltraSensitiveVoiceServer:
    def __init__(self):
        self.active_conversations: Dict[str, Any] = {}
        self.processor = UltraSensitiveVoiceProcessor()

    async def create_conversation(self, conversation_id: str, websocket: WebSocket):
        """Create a new ultra-sensitive conversation session"""
        try:
            self.active_conversations[conversation_id] = {
                "websocket": websocket,
                "start_time": datetime.utcnow(),
                "message_count": 0,
                "is_processing": False,
                "voice_id": None,
                "context": None,
                "was_interrupted": False,
                "quality_level": "ultra_sensitive"
            }
            logger.info(f"✅ Created ultra-sensitive conversation: {conversation_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Error creating conversation: {e}")
            raise

    async def send_introduction(self, conversation_id: str):
        """Send ultra-engaging AI introduction"""
        try:
            if conversation_id not in self.active_conversations:
                logger.error(f"❌ Conversation not found: {conversation_id}")
                return
                
            conversation_data = self.active_conversations[conversation_id]
            websocket = conversation_data["websocket"]
            voice_id = conversation_data.get("voice_id", "female")
            context = conversation_data.get("context")
            
            logger.info(f"🎤 Sending ultra-sensitive introduction with voice: {voice_id}")
            
            intro_text = self.processor.get_introduction(conversation_id, context)
            logger.info(f"📝 Introduction text: {intro_text}")
            
            await websocket.send_json({
                "type": "ai_response",
                "text": intro_text,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            try:
                logger.info("🎵 Starting audio synthesis")
                audio_response = await self.processor.synthesize_speech(intro_text, voice_id)
                
                if audio_response and len(audio_response) > 500:
                    logger.info(f"🔊 Sending audio: {len(audio_response)} bytes")
                    
                    await websocket.send_json({"type": "audio_start"})
                    await websocket.send_bytes(audio_response)
                    await websocket.send_json({"type": "audio_end"})
                    
                    logger.info("✅ Introduction delivered successfully")
                else:
                    logger.error(f"❌ Audio generation failed: {len(audio_response) if audio_response else 0} bytes")
                    await websocket.send_json({
                        "type": "ai_response",
                        "text": "I'm experiencing a brief technical moment with audio, but I'm absolutely here and excited to help you learn! Please go ahead and speak - I'm listening.",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
            except Exception as audio_error:
                logger.error(f"❌ Audio synthesis failed: {audio_error}")
                await websocket.send_json({
                    "type": "ai_response", 
                    "text": "I'm here and genuinely excited to start our learning journey! There's a small audio hiccup, but I'm fully ready to engage with you.",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
        except Exception as e:
            logger.error(f"❌ Error sending introduction: {e}")
            logger.error(traceback.format_exc())

    async def process_audio(self, conversation_id: str, audio_data: bytes):
        """Process audio with ultra-sensitive detection pipeline"""
        try:
            if conversation_id not in self.active_conversations:
                logger.error(f"❌ Conversation not found: {conversation_id}")
                return

            conversation_data = self.active_conversations[conversation_id]
            websocket = conversation_data["websocket"]
            
            if conversation_data.get("is_processing", False):
                logger.info(f"⏳ Ultra-sensitive processing in progress for {conversation_id}")
                return
                
            conversation_data["is_processing"] = True
            logger.info(f"🎤 Starting ULTRA-SENSITIVE audio processing: {len(audio_data)} bytes")
            
            try:
                voice_id = conversation_data.get("voice_id", "female")
                context = conversation_data.get("context")
                was_interrupted = conversation_data.get("was_interrupted", False)
                
                if was_interrupted:
                    conversation_data["was_interrupted"] = False
                    logger.info(f"🔄 Processing interrupted conversation: {conversation_id}")
                
                await websocket.send_json({"type": "processing_start"})
                
                # ULTRA-SENSITIVE transcription
                transcript = await self.processor.transcribe_audio(audio_data)
                
                if not transcript or len(transcript.strip()) < 1:
                    logger.warning(f"❌ No speech detected: {conversation_id}")
                    await websocket.send_json({"type": "no_speech_detected"})
                    return
                
                logger.info(f"✅ TRANSCRIBED: '{transcript}'")
                
                await websocket.send_json({
                    "type": "transcript",
                    "text": transcript,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # Get AI response
                ai_response = await self.processor.get_ai_response(
                    transcript, conversation_id, was_interrupted, context
                )
                
                logger.info(f"🤖 AI RESPONSE: {ai_response}")
                
                await websocket.send_json({
                    "type": "ai_response",
                    "text": ai_response,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # Generate speech
                audio_response = await self.processor.synthesize_speech(ai_response, voice_id)
                
                if audio_response and len(audio_response) > 1000:
                    logger.info(f"🔊 Delivering audio: {len(audio_response)} bytes")
                    
                    await websocket.send_json({"type": "audio_start"})
                    await websocket.send_bytes(audio_response)
                    await websocket.send_json({"type": "audio_end"})
                    
                    conversation_data["message_count"] += 1
                    logger.info(f"✅ Response delivered for {conversation_id}")
                else:
                    logger.error(f"❌ Audio generation failed: {conversation_id}")
                    await websocket.send_json({
                        "type": "error",
                        "message": "Audio generation temporarily unavailable"
                    })
                        
            except Exception as e:
                logger.error(f"❌ Processing error: {e}")
                logger.error(traceback.format_exc())
                try:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Processing error: {str(e)}"
                    })
                except:
                    pass
            finally:
                conversation_data["is_processing"] = False
            
        except Exception as e:
            logger.error(f"❌ Audio processing error: {e}")
            if conversation_id in self.active_conversations:
                self.active_conversations[conversation_id]["is_processing"] = False

    async def cleanup_conversation(self, conversation_id: str):
        """Clean up conversation resources"""
        if conversation_id in self.active_conversations:
            try:
                self.processor.clear_conversation_context(conversation_id)
                del self.active_conversations[conversation_id]
                logger.info(f"🧹 Conversation cleaned up: {conversation_id}")
            except Exception as e:
                logger.error(f"❌ Error cleaning up conversation: {e}")

# Initialize ultra-sensitive server
voice_server = UltraSensitiveVoiceServer()

@app.websocket("/conversation")
async def ultra_sensitive_conversation_endpoint(websocket: WebSocket):
    """Ultra-sensitive WebSocket endpoint for maximum speech detection"""
    conversation_id = str(uuid.uuid4())
    
    try:
        await websocket.accept()
        logger.info(f"🌐 Ultra-sensitive WebSocket connected: {conversation_id}")
        
        await voice_server.create_conversation(conversation_id, websocket)
        
        await websocket.send_json({
            "type": "connection_established",
            "conversation_id": conversation_id,
            "message": "Connected to Ultra-Sensitive Voice AI - Maximum Speech Detection!",
            "quality_level": "ultra_sensitive"
        })
        
        introduction_sent = False
        
        while True:
            try:
                message = await websocket.receive()
                
                if message["type"] == "websocket.disconnect":
                    break
                    
                if "bytes" in message:
                    audio_data = message["bytes"]
                    logger.info(f"🎤 Received audio: {len(audio_data)} bytes")
                    # ULTRA-LOW threshold for maximum sensitivity
                    if len(audio_data) > 200:  # Reduced from 300
                        asyncio.create_task(voice_server.process_audio(conversation_id, audio_data))
                    else:
                        logger.info(f"⚠️ Audio too small, skipping: {len(audio_data)} bytes")
                        
                elif "text" in message:
                    try:
                        data = json.loads(message["text"])
                        logger.info(f"📨 Command: {data.get('type')}")
                        
                        if data.get("type") == "ping":
                            await websocket.send_json({"type": "pong"})
                            
                        elif data.get("type") == "interrupt_ai":
                            if conversation_id in voice_server.active_conversations:
                                voice_server.active_conversations[conversation_id]["was_interrupted"] = True
                                logger.info(f"🛑 AI interrupted: {conversation_id}")
                                
                        elif data.get("type") == "set_voice":
                            voice_id = data.get("voice_id", "female")
                            logger.info(f"🎤 Setting voice: {voice_id}")
                            if conversation_id in voice_server.active_conversations:
                                voice_server.active_conversations[conversation_id]["voice_id"] = voice_id
                                
                                voice_config = voice_server.processor.get_cost_optimized_voice_config(voice_id)
                                await websocket.send_json({
                                    "type": "voice_changed", 
                                    "voice_id": voice_id,
                                    "voice_name": voice_config["name"],
                                    "language": voice_config["language_code"],
                                    "quality": voice_config["quality"],
                                    "cost": voice_config["cost"],
                                    "message": f"Voice changed to {voice_config['description']}"
                                })
                                
                        elif data.get("type") == "set_context":
                            context = data.get("context", {})
                            logger.info(f"📝 Ultra-sensitive context set for {conversation_id}")
                            if conversation_id in voice_server.active_conversations:
                                voice_server.active_conversations[conversation_id]["context"] = context
                                voice_server.processor.clear_conversation_context(conversation_id)
                                
                                await websocket.send_json({
                                    "type": "context_set",
                                    "message": "Ultra-sensitive context configured successfully"
                                })
                                
                        elif data.get("type") == "start_conversation":
                            if not introduction_sent:
                                logger.info(f"🚀 Starting ultra-sensitive conversation: {conversation_id}")
                                await asyncio.sleep(0.1)
                                await voice_server.send_introduction(conversation_id)
                                introduction_sent = True
                                
                    except json.JSONDecodeError as e:
                        logger.error(f"❌ JSON decode error: {e}")
                        await websocket.send_json({
                            "type": "error",
                            "message": "Invalid JSON format"
                        })
                        
            except WebSocketDisconnect:
                logger.info(f"🔌 Ultra-sensitive WebSocket disconnected: {conversation_id}")
                break
            except Exception as e:
                logger.error(f"❌ Conversation error: {e}")
                logger.error(traceback.format_exc())
                try:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Server error: {str(e)}"
                    })
                except:
                    pass
                break
                
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
        logger.error(traceback.format_exc())
    finally:
        await voice_server.cleanup_conversation(conversation_id)

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await voice_server.processor.close_session()

@app.get("/health")
async def ultra_sensitive_health_check():
    """Ultra-sensitive health check"""
    stats = voice_server.processor.get_stats()
    tts_status = "ultra_sensitive" if voice_server.processor.tts_client else "error"
    
    return {
        "status": "ultra_sensitive" if tts_status == "ultra_sensitive" else "degraded",
        "active_conversations": len(voice_server.active_conversations),
        "tts_status": tts_status,
        "optimization_stats": stats,
        "sensitivity_settings": {
            "model": "gpt-3.5-turbo" if USE_GPT_3_5 else "gpt-4",
            "max_context": MAX_CONTEXT_MESSAGES,
            "max_tokens": MAX_RESPONSE_TOKENS,
            "voice_cache": USE_VOICE_CACHE,
            "tts_provider": "Google Cloud TTS (Cost-Optimized)",
            "audio_threshold": "200 bytes (ultra-low)",
            "confidence_threshold": "0.05 (ultra-sensitive)",
            "deepgram_params": "ultra-sensitive detection"
        },
        "cost_optimization": {
            "default_voices": "Standard ($4/1M chars)",
            "premium_voices": "Neural2 ($16/1M chars) - on request",
            "free_tier": "1M characters per month",
            "estimated_savings": "75% vs Neural2-only approach"
        },
        "api_keys_configured": {
            "openai": bool(OPENAI_API_KEY),
            "deepgram": bool(DEEPGRAM_API_KEY),
            "google_cloud": bool(voice_server.processor.tts_client)
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    """Ultra-sensitive root endpoint"""
    return {
        "message": "Ultra-Sensitive Voice AI Server - Maximum Speech Detection & Cost Optimized",
        "version": "8.0.0 - Ultra Sensitive Edition",
        "endpoints": {
            "websocket": "/conversation",
            "health": "/health",
            "voices": "/voices"
        },
        "ultra_sensitive_features": [
            "Ultra-low audio threshold (200 bytes vs 300+)",
            "Ultra-low confidence threshold (0.05 vs 0.15+)",
            "Enhanced Deepgram parameters for maximum detection",
            "Short phrase acceptance for low-confidence speech",
            "Filler word inclusion for better speech capture",
            "Ultra-short voice activity detection (50ms)",
            "Cost-optimized Standard voices by default",
            "Neural2 premium voices available on request"
        ],
        "cost_optimization": {
            "default_quality": "Standard voices - $4 per 1M characters",
            "premium_option": "Neural2 voices - $16 per 1M characters",
            "savings": "75% cost reduction vs Neural2-only",
            "free_tier": "1M characters per month",
            "recommendation": "Use Standard for most content, Neural2 for special occasions"
        },
        "sensitivity_improvements": {
            "audio_detection": "200-byte minimum (ultra-low)",
            "speech_confidence": "0.05 threshold (ultra-sensitive)",
            "voice_activity": "50ms detection windows",
            "response_time": "Optimized for immediate feedback",
            "short_phrases": "Accepts single words and short phrases"
        },
        "status": "ultra_sensitive_ready"
    }

@app.get("/voices")
async def get_cost_optimized_voices():
    """Get cost-optimized voice selection"""
    voices = {
        # STANDARD VOICES (DEFAULT - 75% CHEAPER)
        "female": {
            "id": "female",
            "name": "High-Quality Female (US)",
            "language": "en-US",
            "gender": "female",
            "description": "Excellent Standard voice - perfect for most teaching",
            "voice_name": "en-US-Standard-C",
            "quality": "Standard",
            "cost": "$4/1M chars",
            "recommended": True,
            "savings": "75% vs Neural2"
        },
        "male": {
            "id": "male",
            "name": "High-Quality Male (US)",
            "language": "en-US",
            "gender": "male",
            "description": "Clear, authoritative Standard voice",
            "voice_name": "en-US-Standard-D",
            "quality": "Standard",
            "cost": "$4/1M chars",
            "recommended": True,
            "savings": "75% vs Neural2"
        },
        "female_warm": {
            "id": "female_warm",
            "name": "Warm Female (US)",
            "language": "en-US",
            "gender": "female",
            "description": "Engaging Standard voice - warm and friendly",
            "voice_name": "en-US-Standard-E",
            "quality": "Standard",
            "cost": "$4/1M chars",
            "recommended": True,
            "savings": "75% vs Neural2"
        },
        "british_female": {
            "id": "british_female",
            "name": "Sophisticated British Female",
            "language": "en-GB",
            "gender": "female",
            "description": "Elegant British Standard voice",
            "voice_name": "en-GB-Standard-A",
            "quality": "Standard",
            "cost": "$4/1M chars",
            "recommended": True,
            "savings": "75% vs Neural2"
        },
        
        # NEURAL2 PREMIUM VOICES (ON REQUEST)
        "female_premium": {
            "id": "female_premium",
            "name": "Ultra-Expressive Female (US) - PREMIUM",
            "language": "en-US",
            "gender": "female",
            "description": "Maximum emotional range - use for special content",
            "voice_name": "en-US-Neural2-H",
            "quality": "Neural2 Premium",
            "cost": "$16/1M chars",
            "recommended": False,
            "use_case": "Special presentations, demos, premium content"
        },
        "male_premium": {
            "id": "male_premium",
            "name": "Ultra-Expressive Male (US) - PREMIUM",
            "language": "en-US",
            "gender": "male",
            "description": "Maximum emotional range - use for special content",
            "voice_name": "en-US-Neural2-J",
            "quality": "Neural2 Premium",
            "cost": "$16/1M chars",
            "recommended": False,
            "use_case": "Special presentations, demos, premium content"
        }
    }
    
    return {
        "voices": voices,
        "default": "female",
        "recommended": "female",
        "provider": "Google Cloud Text-to-Speech",
        "cost_strategy": "Standard voices by default, Neural2 on request",
        "total_voices": len(voices),
        "cost_breakdown": {
            "standard_voices": "$4 per 1M characters (recommended)",
            "neural2_voices": "$16 per 1M characters (premium)",
            "free_tier": "1M characters per month",
            "cost_savings": "75% with Standard vs Neural2"
        },
        "usage_recommendations": {
            "daily_teaching": "Use Standard voices (female, male, female_warm)",
            "special_content": "Use Neural2 premium for demos/presentations",
            "cost_conscious": "Stick with Standard voices for 75% savings",
            "maximum_quality": "Use Neural2 premium sparingly for key content"
        },
        "quality_comparison": {
            "standard": "High-quality, clear, professional - excellent for education",
            "neural2": "Near-human, emotional expression - premium experience"
        }
    }

if __name__ == "__main__":
    if not check_environment():
        print("❌ Environment check failed. Please check your .env file.")
        exit(1)
    
    print("🚀 Starting Ultra-Sensitive Voice AI Server v8.0")
    print("🎯 Maximum Speech Detection + Cost Optimization")
    print("🔊 Google Cloud TTS with Smart Cost Management")
    print("")
    print("🎤 ULTRA-SENSITIVE FEATURES:")
    print("  📊 Audio Threshold: 200 bytes (ultra-low)")
    print("  🎯 Confidence Threshold: 0.05 (ultra-sensitive)")
    print("  ⚡ Voice Activity Detection: 50ms windows")
    print("  🗣️ Short Phrase Acceptance: Single words OK")
    print("  🔍 Enhanced Deepgram Parameters: Maximum detection")
    print("")
    print("💰 COST OPTIMIZATION:")
    print("  🎤 Default: Standard Voices ($4/1M chars)")
    print("  💎 Premium: Neural2 Voices ($16/1M chars)")
    print("  💵 Savings: 75% cost reduction")
    print("  🆓 Free Tier: 1M characters per month")
    print("")
    print("🌐 SERVER ENDPOINTS:")
    print("  📍 Main: http://0.0.0.0:3000")
    print("  🔧 Health: http://0.0.0.0:3000/health")
    print("  🎤 Voices: http://0.0.0.0:3000/voices")
    print("")
    print("🎯 OPTIMIZED FOR: Maximum speech detection with cost efficiency")
    print("🚀 Ready for ultra-sensitive voice conversations!")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3000,
        log_level="info"
    )