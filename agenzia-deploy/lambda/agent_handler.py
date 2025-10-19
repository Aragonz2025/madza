from strands import Agent
from strands_tools import shell, editor, load_tool, http_request
from typing import Dict, Any, List
import os
import boto3
import json

# Model configuration based on environment
def get_model_config():
    """
    Get model configuration based on environment.
    Returns appropriate model for local (Ollama) or AWS (Bedrock) deployment.
    """
    # Check if running locally with Ollama
    if os.environ.get("USE_OLLAMA", "false").lower() == "true":
        from strands.models.ollama import OllamaModel
        return OllamaModel(
            host=os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434"),
            model_id=os.environ.get("OLLAMA_MODEL_ID", "llama3.2:latest")
        )
    else:
        # Use Bedrock model for AWS deployment
        bedrock_model_id = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")
        return bedrock_model_id

# Get the appropriate model configuration
model_config = get_model_config()

# RAG Configuration
def get_rag_client():
    """Initialize Bedrock client for RAG operations"""
    if os.environ.get("ENABLE_RAG", "false").lower() == "true":
        return boto3.client('bedrock-agent-runtime', region_name='us-east-1')
    return None

def retrieve_medical_knowledge(query: str, max_results: int = 5) -> List[Dict]:
    """
    Retrieve relevant medical insurance knowledge using AWS Bedrock Knowledge Base
    """
    rag_client = get_rag_client()
    if not rag_client:
        return []
    
    try:
        knowledge_base_id = os.environ.get("KNOWLEDGE_BASE_ID")
        if not knowledge_base_id:
            print("WARNING: KNOWLEDGE_BASE_ID not configured")
            return []
        
        response = rag_client.retrieve(
            knowledgeBaseId=knowledge_base_id,
            retrievalQuery={
                'text': query
            },
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': max_results
                }
            }
        )
        
        # Extract relevant documents
        documents = []
        for result in response.get('retrievalResults', []):
            documents.append({
                'content': result.get('content', {}).get('text', ''),
                'source': result.get('location', {}).get('s3Location', {}).get('uri', 'Unknown'),
                'score': result.get('score', 0.0)
            })
        
        return documents
        
    except Exception as e:
        print(f"RAG retrieval error: {str(e)}")
        return []

def format_rag_context(documents: List[Dict]) -> str:
    """Format retrieved documents for agent context"""
    if not documents:
        return "\n=== NO RELEVANT KNOWLEDGE BASE CONTEXT FOUND ===\nNo specific medical billing information found in knowledge base for this query. Use general medical insurance knowledge.\n"
    
    context = "\n=== RELEVANT MEDICAL INSURANCE KNOWLEDGE ===\n"
    for i, doc in enumerate(documents, 1):
        context += f"\n[Knowledge Base Source {i}] (Relevance Score: {doc['score']:.2f})\n"
        context += f"Medical Information: {doc['content']}\n"
        context += f"Document Source: {doc['source']}\n"
        context += "-" * 50 + "\n"
    
    context += "\n=== END KNOWLEDGE BASE CONTEXT ===\n"
    return context


def run_research_workflow(user_input: str) -> str:
    """
    Run a three-agent workflow specialized for medical insurance claims research.
    
    Args:
        user_input: Medical insurance claim query or question
        
    Returns:
        str: The final report from the Writer Agent
    """
    
    # Step 1: Medical Claims Researcher Agent
    researcher_agent = Agent(
        system_prompt=(
            "You are a Medical Insurance Claims Research Agent with expertise in healthcare billing, "
            "insurance policies, medical coding (CPT, ICD-10), and claims processing. "
            "IMPORTANT: Always prioritize and use the KNOWLEDGE BASE CONTEXT provided in the prompt. "
            "This context contains verified medical billing codes, insurance policies, and procedures. "
            "1. First, extract relevant information from the knowledge base context "
            "2. Provide specific CPT codes, ICD-10 codes, and billing information from the context "
            "3. Include coverage details, prior authorization requirements, and processing timelines "
            "4. Only supplement with web research if the knowledge base doesn't have the information "
            "5. Always cite specific codes and procedures from the provided context "
            "6. Keep findings under 500 words and focus on practical, actionable information"
        ),
        tools=[http_request],
        model=model_config
    )
    
    # Retrieve relevant knowledge from RAG system
    print(f"DEBUG - Retrieving RAG knowledge for: '{user_input}'")
    rag_documents = retrieve_medical_knowledge(user_input)
    print(f"DEBUG - Retrieved {len(rag_documents)} documents from RAG")
    rag_context = format_rag_context(rag_documents)
    print(f"DEBUG - RAG context length: {len(rag_context)} characters")
    
    researcher_prompt = f"""Medical Insurance Claim Research Query: '{user_input}'

KNOWLEDGE BASE CONTEXT (USE THIS FIRST):
{rag_context}

INSTRUCTIONS:
1. PRIORITIZE the knowledge base context above - it contains verified medical billing codes and procedures
2. Extract specific CPT codes, ICD-10 codes, and billing information from the context
3. If the context contains relevant information, use it as your primary source
4. Provide specific codes and procedures mentioned in the knowledge base
5. Focus on practical, actionable information for medical claims
6. Only use web research to supplement if knowledge base lacks information

Answer the query using the knowledge base context as your primary source."""

    researcher_response = researcher_agent(researcher_prompt)
    
    research_findings = str(researcher_response)
    
    # Step 2: Medical Claims Analyst Agent
    analyst_agent = Agent(
        system_prompt=(
            "You are a Medical Claims Analyst Agent with expertise in healthcare insurance policies and regulations. "
            "IMPORTANT: Focus on analyzing the medical billing codes and information provided by the researcher. "
            "1. Analyze the specific CPT codes, ICD-10 codes, and billing information provided "
            "2. Identify key factors affecting claim approval for the specific codes mentioned "
            "3. Highlight prior authorization requirements for the specific procedures "
            "4. Provide insights on processing timelines for the mentioned billing codes "
            "5. Rate information reliability based on the knowledge base sources "
            "6. Keep analysis under 400 words and focus on the specific codes provided"
        ),
        model=model_config
    )

    analyst_response = analyst_agent(
        f"Analyze these medical claim findings for '{user_input}':\n\n{research_findings}\n\n"
        f"Focus on claim approval factors, potential issues, and processing requirements."
    )
    
    analysis = str(analyst_response)
    
    # Step 3: Medical Claims Report Writer Agent
    writer_agent = Agent(
        system_prompt=(
            "You are a Medical Claims Report Writer Agent that creates clear, actionable reports for healthcare providers and patients. "
            "IMPORTANT: Always include the specific medical billing codes (CPT, ICD-10) mentioned in the analysis. "
            "1. Start with the specific CPT codes and procedures relevant to the query "
            "2. Structure reports with: Relevant Codes, Coverage Summary, Requirements, Timeline, Action Items "
            "3. Use clear language but always include the exact billing codes "
            "4. Highlight specific documentation requirements for the mentioned procedures "
            "5. Include prior authorization requirements for the specific CPT codes "
            "6. Keep reports under 500 words but ensure all relevant codes are mentioned"
        ),
        model=model_config
    )
    
    final_report = writer_agent(
        f"Create a medical claims report for '{user_input}' based on this analysis:\n\n{analysis}\n\n"
        f"IMPORTANT: Include all specific CPT codes, ICD-10 codes, and billing information mentioned in the analysis. "
        f"Structure the report with: 1) Relevant Medical Codes, 2) Coverage Details, 3) Requirements, 4) Action Items."
    )
    
    return str(final_report)


def run_meta_tooling_workflow(user_input: str) -> str:
    """
    Run meta-tooling workflow for dynamic tool creation and usage.
    
    Args:
        user_input: Tool creation request or task requiring custom tools
        
    Returns:
        str: Response from the meta-tooling agent
    """
    
    TOOL_BUILDER_SYSTEM_PROMPT = """You are an advanced agent that creates and uses custom Strands Agents tools.

Use all available tools implicitly as needed without being explicitly told. Always use tools instead of suggesting code 
that would perform the same operations. Proactively identify when tasks can be completed using available tools.

## TOOL NAMING CONVENTION:
   - The tool name (function name) MUST match the file name without the extension
   - Example: For file "tool_name.py", use tool name "tool_name"

## TOOL CREATION vs. TOOL USAGE:
   - CAREFULLY distinguish between requests to CREATE a new tool versus USE an existing tool
   - When a user asks a question like "reverse hello world" or "count abc", first check if an appropriate tool already exists before creating a new one
   - If an appropriate tool already exists, use it directly instead of creating a redundant tool
   - Only create a new tool when the user explicitly requests one with phrases like "create", "make a tool", etc.

## TOOL CREATION PROCESS:
   - Name the file "tool_name.py" where "tool_name is a human readable name
   - Name the function in the file the SAME as the file name (without extension)
   - The "name" parameter in the TOOL_SPEC MUST match the name of the file (without extension)
   - Include detailed docstrings explaining the tool's purpose and parameters
   - After creating a tool, announce "TOOL_CREATED: <filename>" to track successful creation

## TOOL STRUCTURE
When creating a tool, follow this exact structure:

```python
from typing import Any
from strands.types.tools import ToolUse, ToolResult

TOOL_SPEC = {
    "name": "tool_name",  # Must match function name
    "description": "What the tool does",
    "inputSchema": {  # Exact capitalization required
        "json": {
            "type": "object",
            "properties": {
                "param_name": {
                    "type": "string",
                    "description": "Parameter description"
                }
            },
            "required": ["param_name"]
        }
    }
}

def tool_name(tool_use: ToolUse, **kwargs: Any) -> ToolResult:
    # Tool function docstring
    tool_use_id = tool_use["toolUseId"]
    param_value = tool_use["input"]["param_name"]
    
    # Process inputs
    result = param_value  # Replace with actual processing
    
    return {
        "toolUseId": tool_use_id,
        "status": "success",
        "content": [{"text": f"Result: {result}"}]
    }
```

Critical requirements:
1. Use "inputSchema" (not input_schema) with "json" wrapper
2. Function must access parameters via tool_use["input"]["param_name"]
3. Return dict must use "toolUseId" (not tool_use_id)
4. Content must be a list of objects: [{"text": "message"}]

## AUTONOMOUS TOOL CREATION WORKFLOW

When asked to create a tool:
1. Generate the complete Python code for the tool following the structure above
2. Use the editor tool to write the code directly to a file named "tool_name.py" where "tool_name" is a human readable name. 
3. Use the load_tool tool to dynamically load the newly created tool
4. After loading, report the exact tool name and path you created
5. Confirm when the tool has been created and loaded

Always use the following tools when appropriate:
- editor: For writing code to files and file editing operations
- load_tool: For loading custom tools
- shell: For running shell commands

You should detect user intents to create tools from natural language (like "create a tool that...", "build a tool for...", etc.) and handle the creation process automatically.
"""
    
    meta_agent = Agent(
        system_prompt=TOOL_BUILDER_SYSTEM_PROMPT,
        tools=[load_tool, shell, editor],
        model=model_config
    )
    
    response = meta_agent(user_input)
    return str(response)


def detect_workflow_type(user_input: str) -> str:
    """
    Detect which workflow to use based on user input.
    
    Args:
        user_input: The user's prompt
        
    Returns:
        str: Either 'research' or 'meta_tooling'
    """
    
    # Keywords that indicate research workflow (now focused on medical claims)
    research_keywords = [
        'research', 'fact check', 'verify', 'investigate', 'find information',
        'what is', 'who is', 'when did', 'where is', 'how does', 'why does',
        'explain', 'tell me about', 'information about', 'details about',
        # Medical insurance claim specific keywords
        'insurance claim', 'medical claim', 'health insurance', 'coverage',
        'deductible', 'copay', 'coinsurance', 'prior authorization', 'appeal',
        'medicare', 'medicaid', 'billing code', 'cpt code', 'icd-10',
        'claim processing', 'claim denial', 'out of network', 'in network',
        'medical billing', 'healthcare costs', 'insurance coverage',
        'claim status', 'reimbursement', 'benefits', 'policy'
    ]
    
    # Keywords that indicate meta-tooling workflow
    meta_keywords = [
        'create a tool', 'make a tool', 'build a tool', 'tool that',
        'create function', 'make function', 'build function',
        'reverse', 'count', 'calculate', 'process', 'transform'
    ]
    
    user_lower = user_input.lower()
    
    # Check for explicit meta-tooling requests
    for keyword in meta_keywords:
        if keyword in user_lower:
            return 'meta_tooling'
    
    # Check for research requests
    for keyword in research_keywords:
        if keyword in user_lower:
            return 'research'
    
    # Default to research for general questions
    return 'research'


# The handler function signature `def handler(event, context)` is what Lambda
# looks for when invoking your function.
def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    Lambda handler that supports both direct invocation and API Gateway requests
    """
    
    # Debug: Log the event structure (remove in production)
    import json
    print(f"DEBUG - Event: {json.dumps(event, default=str)}")
    
    # Check if this is an API Gateway request
    # API Gateway events have 'httpMethod' or 'requestContext'
    if 'httpMethod' in event or 'requestContext' in event:
        return handle_api_gateway_request(event, context)
    else:
        # Direct Lambda invocation - return string for backward compatibility
        return handle_direct_invocation(event, context)


def handle_api_gateway_request(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    Handle API Gateway HTTP requests
    """
    try:
        # Parse request body
        import json
        
        body = {}
        if event.get('body'):
            try:
                if event.get('isBase64Encoded', False):
                    import base64
                    body = json.loads(base64.b64decode(event['body']).decode('utf-8'))
                else:
                    body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
            except json.JSONDecodeError as e:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': f'Invalid JSON in request body: {str(e)}',
                        'received_body': event.get('body', 'No body')
                    })
                }
        
        # Extract prompt and mode from request
        user_prompt = body.get('prompt', body.get('message', ''))
        mode = body.get('mode', None)
        
        if not user_prompt:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': json.dumps({
                    'error': 'Missing prompt or message in request body',
                    'example': {'prompt': 'What are quantum computers?', 'mode': 'research'}
                })
            }
        
        # Process the request
        response_text = process_agent_request(user_prompt, mode)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps({
                'response': response_text,
                'workflow': detect_workflow_type(user_prompt) if not mode else mode,
                'timestamp': context.aws_request_id if context else None
            })
        }
        
    except Exception as e:
        import json
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps({
                'error': str(e),
                'type': 'InternalServerError'
            })
        }


def handle_direct_invocation(event: Dict[str, Any], context) -> str:
    """
    Handle direct Lambda invocation (backward compatibility)
    """
    import json
    print(f"DEBUG - Direct invocation event: {json.dumps(event, default=str)}")
    
    # Support both 'prompt' and 'message' keys for backward compatibility
    user_prompt = event.get('message', event.get('prompt', ''))
    mode = event.get('workflow', event.get('mode', None))
    
    print(f"DEBUG - Extracted user_prompt: '{user_prompt}', mode: {mode}")
    
    return process_agent_request(user_prompt, mode)


def process_agent_request(user_prompt: str, mode: str = None) -> str:
    """
    Core agent processing logic
    """
    print(f"DEBUG - Processing request: '{user_prompt}', mode: {mode}")
    
    # For medical claims questions, always use research workflow
    if any(keyword in user_prompt.lower() for keyword in ['cpt', 'icd', 'medical', 'insurance', 'claim', 'mri', 'billing']):
        workflow_type = 'research'
        print(f"DEBUG - Medical query detected, using research workflow")
    elif mode == 'research':
        workflow_type = 'research'
    elif mode == 'meta_tooling':
        workflow_type = 'meta_tooling'
    else:
        # Auto-detect workflow type based on user input
        workflow_type = detect_workflow_type(user_prompt)
    
    print(f"DEBUG - Using workflow: {workflow_type}")
    
    # Route to appropriate workflow
    if workflow_type == 'research':
        return run_research_workflow(user_prompt)
    else:
        return run_meta_tooling_workflow(user_prompt)