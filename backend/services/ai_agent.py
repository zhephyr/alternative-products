import os
import json
import base64
from openai import AsyncOpenAI

async def analyze_image(image_bytes: bytes, provider: str = "openai", client=None) -> dict:
    """
    Sends the image to an AI Vision-Language Model to extract structured 
    semantic parameters for searching products.
    """
    default_result = {
        "category": "unknown",
        "color": "unknown",
        "materials": [],
        "keywords": []
    }
    
    try:
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        prompt = '''Analyze this image of a product/furniture. Return ONLY a valid JSON object with the following keys exactly:
{
  "category": "e.g., accent chair, sofa, lamp",
  "color": "e.g., mustard yellow, matte black",
  "materials": ["e.g., velvet", "e.g., walnut wood", "e.g., brass"],
  "keywords": ["e.g., mid-century modern", "tufted", "minimalist"]
}'''

        if provider == "openai":
            if client is None:
                client = AsyncOpenAI(api_key=os.getenv("OPEN_AI_API_KEY", "dummy_key"))
                
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                            }
                        ]
                    }
                ],
                max_tokens=300
            )
            content = response.choices[0].message.content
        else:
            # Placeholder for anthropic or others
            return default_result
            
        # Clean possible markdown JSON formatting
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        print(f"[PIPELINE_DEBUG] AI Analysis Content: {content}")
        return json.loads(content.strip())
        
    except Exception as e:
        print(f"Error in analyze_image: {e}")
        return default_result
